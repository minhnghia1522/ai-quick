'use client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Loader2, X } from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { createEnhancePrompt } from '@/prompt/enhancePrompt';
import { createPromptTranslateEnhancePrompt } from '@/prompt/languageTranslatePrompt';
import { LANGUAGES } from '@/types/model';
import { modelCallWithStreaming } from '@/service/translateService';
import { Label } from '@/components/ui/label';
import { areAnyApiKeysAvailable } from '@/src/utils/getProvider';

const MAX_TEXT_LENGTH = 10000;

const Page = () => {
  const [sourceText, setSourceText] = useState('');
  const [enhancedText, setEnhancedText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
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

  const handleTranslateToEnglish = useCallback(async () => {
    if (!enhancedText || enhancedText.trim() === '') {
      return;
    }
    if (!areAnyApiKeysAvailable()) {
      toast.error('Vui lòng nhập API key.');
      return;
    }
    if (enhancedText.length > MAX_TEXT_LENGTH) {
      toast.error(`Vui lòng nhập dưới ${MAX_TEXT_LENGTH} ký tự. Hiện tại: ${enhancedText.length} ký tự.`);
      return;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setTranslatedText('');
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsLoading(true);
    const { system, prompt } = createPromptTranslateEnhancePrompt(LANGUAGES.en, enhancedText);
    try {
      const stream = await modelCallWithStreaming({ prompt, system }, abortController.signal);
      for await (const textPart of stream.textStream) {
        setTranslatedText((prevData) => prevData + textPart);
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
  }, [enhancedText]);

  const handleClearSourceText = () => {
    setIsLoading(false);
    abortControllerRef.current?.abort();
    setSourceText('');
    setEnhancedText('');
    setTranslatedText('');
    if (textAreaSourceRef.current) textAreaSourceRef.current.style.height = 'auto';
    if (textAreaEnhancedRef.current) textAreaEnhancedRef.current.style.height = 'auto';
  };

  return (
    <div className='flex flex-col size-full min-w-0 bg-background text-black px-4 sm:px-10 gap-10'>
      <div className='p-1 flex flex-col items-center justify-center sm:mt-10'>
        <Label className='text-4xl'>Cải thiện Prompt</Label>
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
            <div className='flex gap-2'>
              <Button onClick={handleEnhance} disabled={isLoading || !sourceText.trim()} className='w-32'>
                {isLoading ? <Loader2 className='animate-spin' /> : enhancedText ? 'Cải thiện lại' : 'Cải thiện'}
              </Button>
              {enhancedText && (
                <Button onClick={handleTranslateToEnglish} disabled={isLoading} className='w-42' variant='outline'>
                  {isLoading ? <Loader2 className='animate-spin' /> : 'Dịch sang tiếng Anh'}
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className='flex flex-col gap-1 w-full md:w-1/2'>
          <div className='w-full flex flex-col gap-3'>
            <div className='relative w-full flex rounded-md border border-input bg-gray-50 px-1 pt-1 pb-8'>
              <Textarea
                ref={textAreaEnhancedRef}
                className='min-h-[128px] resize-none w-full border-none outline-none disabled:cursor-auto disabled:bg-gray-50 disabled:opacity-100'
                value={enhancedText}
                placeholder={isLoading ? 'Đang cải thiện prompt...' : 'Prompt đã được cải thiện sẽ hiển thị ở đây...'}
                disabled={true}
              />
              <span>
                {enhancedText !== '' ? (
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => {
                      navigator.clipboard.writeText(enhancedText);
                      toast.success('Đã sao chép');
                    }}
                  >
                    <Copy />
                  </Button>
                ) : undefined}
              </span>
            </div>
            {translatedText && (
              <div className='relative w-full flex rounded-md border border-input bg-gray-50 px-1 pt-1 pb-8'>
                <Textarea
                  className='min-h-[128px] resize-none w-full border-none outline-none disabled:cursor-auto disabled:bg-gray-50 disabled:opacity-100'
                  value={translatedText}
                  placeholder='Bản dịch tiếng Anh sẽ hiển thị ở đây...'
                  disabled={true}
                />
                <span>
                  {translatedText !== '' ? (
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => {
                        navigator.clipboard.writeText(translatedText);
                        toast.success('Đã sao chép');
                      }}
                    >
                      <Copy />
                    </Button>
                  ) : undefined}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
