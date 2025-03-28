'use client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRightLeft, Loader2, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { OpenAIStream } from '@/service/openAI';
import { Label } from '@/components/ui/label';

const MAX_TEXT_LENGTH = 5000;

const Page = () => {
  const [promptRoleUser, setPromptRoleUser] = useState('');
  const [promptRoleSystem, setPromptRoleSystemInput] = useState<string>(
    'You are **Bé Nhi**, a friendly and helpful assistant. Your primary goal is to assist users effectively while maintaining a professional yet approachable tone. **All your responses must be formatted using Markdown** to ensure they are clear, readable, and well-structured.'
  );
  const [result, reResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const textAreaSourceRef = useRef<HTMLTextAreaElement>(null);
  const textAreaTranslatedRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleTranslate = useCallback(async () => {
    reResult('');
    if (!promptRoleUser || promptRoleUser === '' || promptRoleUser == null) {
      return;
    }

    if (!localStorage.getItem('apiKey')) {
      alert('Please enter an API key.');
      return;
    }

    if (promptRoleUser.length > MAX_TEXT_LENGTH) {
      alert(
        `Please enter data less than ${MAX_TEXT_LENGTH} characters. You are currently at ${promptRoleUser.length} characters.`
      );
      return;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      reResult('');
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsLoading(true);
    const prompt = {
      system: promptRoleSystem,
      prompt: promptRoleUser
    };
    try {
      const stream = await OpenAIStream(prompt, abortController.signal);

      for await (const textPart of stream.textStream) {
        reResult((prevData) => prevData + textPart);
      }
    } catch (error) {
      if (error instanceof Error) {
        if (['AbortError', 'aborted'].some((term) => error.message.includes(term))) return;
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred.');
      }
    }

    setIsLoading(false);
  }, [promptRoleSystem, promptRoleUser]);

  useEffect(() => {
    const handler = setTimeout(() => {
      handleTranslate();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [promptRoleUser, handleTranslate]);

  const handleSourceTextInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textAreaSourceCurrent = textAreaSourceRef.current;
    if (textAreaSourceCurrent) {
      textAreaSourceCurrent.style.height = 'auto'; // Reset height

      const height = textAreaSourceCurrent.scrollHeight;
      textAreaSourceCurrent.style.height = `${height}px`; // Update height của phần tử
      if (textAreaTranslatedRef.current) {
        textAreaTranslatedRef.current.style.height = `${height}px`;
      }
    }
    setPromptRoleUser(e.target.value);
  };

  const handlePromptSystemInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPromptRoleSystemInput(e.target.value);
  };

  const handleClearSourceText = () => {
    setIsLoading(false);
    abortControllerRef.current?.abort();
    setPromptRoleUser('');
    reResult('');
    textAreaSourceRef.current!.style.height = 'auto';
    textAreaTranslatedRef.current!.style.height = 'auto';
  };

  return (
    <div className='flex flex-col size-full min-w-0  bg-background text-black px-4 sm:px-10 gap-10'>
      <div className='p-1 flex flex-col items-center justify-center sm:mt-10'>
        <Label className='text-4xl'>Prompt Testing</Label>
      </div>
      <div className='flex flex-col md:flex-row justify-center w-full max-w-full gap-3 md:px-0 lg:px-14 xl:px-32'>
        <div className='flex flex-col gap-1 w-full md:w-1/2'>
          <Label>Prompt</Label>
          <div className='relative w-full flex rounded-md border border-input bg-background px-1 pt-1 pb-8'>
            <Textarea
              value={promptRoleSystem}
              className='w-full min-h-[128px] resize-none border-none outline-none bg-transparent 
              focus:outline-none focus:ring-0 focus:ring-offset-0 focus:shadow-none 
              focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
              placeholder='Type or paste text here to translate'
              onChange={handlePromptSystemInput}
            />
          </div>
        </div>
      </div>
      <div className='flex flex-col md:flex-row justify-center w-full max-w-full gap-3 md:px-0 lg:px-14 xl:px-32'>
        <div className='flex flex-col gap-1 w-full md:w-1/2'>
          <Label>Input</Label>
          <div className='relative w-full flex rounded-md border border-input bg-background px-1 pt-1 pb-8'>
            <Textarea
              ref={textAreaSourceRef}
              value={promptRoleUser}
              className='w-full min-h-[128px] resize-none border-none outline-none bg-transparent 
              focus:outline-none focus:ring-0 focus:ring-offset-0 focus:shadow-none 
              focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
              placeholder='Type or paste text here to translate'
              onChange={handleSourceTextInput}
            />
            <span>
              {promptRoleUser !== '' ? (
                <Button variant='ghost' size='icon' onClick={handleClearSourceText}>
                  <X />
                </Button>
              ) : undefined}
            </span>
            <div className='absolute bottom-0 right-3 text-gray-500 bg-white px-1'>
              {promptRoleUser.length.toLocaleString()}/{MAX_TEXT_LENGTH.toLocaleString()}
            </div>
          </div>
        </div>
        <div className='flex w-[10x]'>
          <Button variant='ghost' size='icon' disabled>
            {isLoading ? <Loader2 className='animate-spin' /> : <ArrowRightLeft />}
          </Button>
        </div>
        <div className='flex flex-col gap-1 w-full md:w-1/2'>
          <Label>Result</Label>
          <div className='w-full flex rounded-md border border-input bg-gray-50 px-1 pt-1 pb-8 '>
            <Textarea
              ref={textAreaTranslatedRef}
              className='min-h-[128px] resize-none w-full border-none outline-none disabled:cursor-auto disabled:bg-gray-50 disabled:opacity-100'
              value={result}
              disabled={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
