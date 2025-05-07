'use client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, X } from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { createEnhancePrompt } from '@/prompt/enhancePrompt';
import { modelCallWithStreaming } from '@/service/translateService';
import { Label } from '@/components/ui/label';
import { areAnyApiKeysAvailable } from '@/src/utils/getProvider';

const MAX_TEXT_LENGTH = 10000;

const Page = () => {
  const [sourceText, setSourceText] = useState('');
  const [enhancedText, setEnhancedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const textAreaSourceRef = useRef<HTMLTextAreaElement>(null);
  const textAreaEnhancedRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleEnhance = useCallback(async () => {
    setEnhancedText('');
    if (!sourceText || sourceText.trim() === '') {
      return;
    }
    if (!areAnyApiKeysAvailable()) {
      toast.error('Vui lòng nhập API key.');
      return;
    }
    if (sourceText.length > MAX_TEXT_LENGTH) {
      toast.error(`Vui lòng nhập dưới ${MAX_TEXT_LENGTH} ký tự. Hiện tại: ${sourceText.length} ký tự.`);
      return;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setEnhancedText('');
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsLoading(true);
    const prompt = createEnhancePrompt(sourceText);
    try {
      const stream = await modelCallWithStreaming({ prompt }, abortController.signal);
      for await (const textPart of stream.textStream) {
        setEnhancedText((prevData) => prevData + textPart);
      }
    } catch (error) {
      if (error instanceof Error) {
        if (['AbortError', 'aborted'].some((term) => error.message.includes(term))) return;
        toast.error(error.message);
      } else {
        toast.error('Đã xảy ra lỗi không xác định.');
      }
    }
    setIsLoading(false);
  }, [sourceText]);

  const handleSourceTextInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textAreaSourceCurrent = textAreaSourceRef.current;
    if (textAreaSourceCurrent) {
      textAreaSourceCurrent.style.height = 'auto';
      const height = textAreaSourceCurrent.scrollHeight;
      textAreaSourceCurrent.style.height = `${height}px`;
      if (textAreaEnhancedRef.current) {
        textAreaEnhancedRef.current.style.height = `${height}px`;
      }
    }
    setSourceText(e.target.value);
  };

  const handleClearSourceText = () => {
    setIsLoading(false);
    abortControllerRef.current?.abort();
    setSourceText('');
    setEnhancedText('');
    if (textAreaSourceRef.current) textAreaSourceRef.current.style.height = 'auto';
    if (textAreaEnhancedRef.current) textAreaEnhancedRef.current.style.height = 'auto';
  };

  return (
    <div className='flex flex-col size-full min-w-0 bg-background text-black px-4 sm:px-10 gap-10'>
      <div className='p-1 flex flex-col items-center justify-center sm:mt-10'>
        <Label className='text-4xl'>Enhance Prompt (AI cải thiện prompt)</Label>
      </div>
      <div className='flex flex-col md:flex-row justify-center w-full max-w-full gap-3 md:px-0 lg:px-14 xl:px-32'>
        <div className='flex flex-col gap-1 w-full md:w-1/2'>
          <div className='relative w-full flex rounded-md border border-input bg-background px-1 pt-1 pb-8'>
            <Textarea
              ref={textAreaSourceRef}
              value={sourceText}
              className='w-full min-h-[128px] resize-none border-none outline-none bg-transparent 
                focus:outline-none focus:ring-0 focus:ring-offset-0 focus:shadow-none 
                focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
              placeholder='Nhập prompt cần cải thiện...'
              onChange={handleSourceTextInput}
              disabled={isLoading}
            />
            <span>
              {sourceText !== '' ? (
                <Button variant='ghost' size='icon' onClick={handleClearSourceText}>
                  <X />
                </Button>
              ) : undefined}
            </span>
            <div className='absolute bottom-0 right-3 text-gray-500 bg-white px-1'>
              {sourceText.length.toLocaleString()}/{MAX_TEXT_LENGTH.toLocaleString()}
            </div>
          </div>
          <div className='flex justify-end mt-2'>
            <Button onClick={handleEnhance} disabled={isLoading || !sourceText.trim()} className='w-32'>
              {isLoading ? <Loader2 className='animate-spin' /> : 'Cản thiện'}
            </Button>
          </div>
        </div>
        <div className='flex flex-col gap-1 w-full md:w-1/2'>
          <div className='w-full flex rounded-md border border-input bg-gray-50 px-1 pt-1 pb-8'>
            <Textarea
              ref={textAreaEnhancedRef}
              className='min-h-[128px] resize-none w-full border-none outline-none disabled:cursor-auto disabled:bg-gray-50 disabled:opacity-100'
              value={enhancedText}
              placeholder={isLoading ? 'Đang cải thiện prompt...' : 'Prompt đã được cải thiện sẽ hiển thị ở đây...'}
              disabled={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
