'use client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { LANGUAGES } from '@/types/types';
import { ArrowRightLeft, Loader2 } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { createPromptTranslateLanguage } from '@/prompt/languageTranslatePrompt';
import { OpenAIStream } from '@/service/openAI';
import { Label } from '@/components/ui/label';

const MAX_TEXT_LENGTH = 5000;

const Page = () => {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [inputLanguage, setInputLanguage] = useState(LANGUAGES.ja);
  const [outputLanguage, setOutputLanguage] = useState(LANGUAGES.vn);
  const [isLoading, setIsLoading] = useState(false);

  const textAreaSourceRef = useRef<HTMLTextAreaElement>(null);
  const textAreaTranslatedRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleTranslate = useCallback(async () => {
    setTranslatedText('');
    if (!sourceText || sourceText == '' || sourceText == null) {
      return;
    }

    if (!localStorage.getItem('apiKey')) {
      alert('Please enter an API key.');
      return;
    }

    if (inputLanguage === outputLanguage) {
      alert('Please select different languages.');
      return;
    }

    if (sourceText.length > MAX_TEXT_LENGTH) {
      alert(
        `Please enter data less than ${MAX_TEXT_LENGTH} characters. You are currently at ${sourceText.length} characters.`
      );
      return;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setTranslatedText('');
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsLoading(true);
    const prompt = createPromptTranslateLanguage(inputLanguage, outputLanguage, sourceText);
    try {
      const stream = await OpenAIStream(prompt, abortController.signal);

      for await (const textPart of stream.textStream) {
        setTranslatedText((prevData) => prevData + textPart);
      }
    } catch (error) {
      if (error instanceof Error) {
        if (['AbortError', 'aborted'].some((term) => error.message.includes(term))) return;
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }

    setIsLoading(false);
  }, [inputLanguage, outputLanguage, sourceText]);

  useEffect(() => {
    const handler = setTimeout(() => {
      handleTranslate();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [sourceText, inputLanguage, outputLanguage, handleTranslate]);

  const handleSourceTextInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textAreaSourceCurrent = textAreaSourceRef.current;
    if (textAreaSourceCurrent) {
      textAreaSourceCurrent.style.height = 'auto'; // Reset height

      const height = textAreaSourceCurrent.scrollHeight;
      textAreaSourceCurrent.style.height = `${height}px`; // update height to element
      if (textAreaTranslatedRef.current) {
        textAreaTranslatedRef.current.style.height = `${height}px`;
      }
    }
    setSourceText(e.target.value);
  };

  return (
    <div className='flex flex-col size-full min-w-0  bg-background text-black px-4 sm:px-10 gap-10'>
      <div className='p-1 flex flex-col items-center justify-center sm:mt-10'>
        <Label className='text-4xl'>Smart AI Translator Powered by ChatGPT</Label>
      </div>
      <div className='flex flex-col md:flex-row justify-center w-full max-w-full gap-3 md:px-0 lg:px-14 xl:px-32'>
        <div className='flex flex-col gap-1 w-full md:w-1/2'>
          <div className='flex flex-wrap'>
            <Button
              variant={inputLanguage === LANGUAGES.ja ? 'default' : 'link'}
              onClick={() => setInputLanguage(LANGUAGES.ja)}
              disabled={outputLanguage === LANGUAGES.ja}
            >
              Nhật
            </Button>
            <Button
              variant={inputLanguage === LANGUAGES.en ? 'default' : 'link'}
              onClick={() => setInputLanguage(LANGUAGES.en)}
              disabled={outputLanguage === LANGUAGES.en}
            >
              Anh
            </Button>
            <Button
              variant={inputLanguage === LANGUAGES.vn ? 'default' : 'link'}
              onClick={() => setInputLanguage(LANGUAGES.vn)}
              disabled={outputLanguage === LANGUAGES.vn}
            >
              Việt
            </Button>
            <Button
              variant={inputLanguage === LANGUAGES.natural ? 'default' : 'link'}
              onClick={() => setInputLanguage(LANGUAGES.natural)}
            >
              Phát hiện ngôn ngữ
            </Button>
          </div>
          <div className='relative w-full flex rounded-md border border-input bg-background px-1 pt-1 pb-8'>
            <Textarea
              ref={textAreaSourceRef}
              className='w-full min-h-[128px] resize-none border-none outline-none bg-transparent 
              focus:outline-none focus:ring-0 focus:ring-offset-0 focus:shadow-none 
              focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
              placeholder='Type or paste text here to translate'
              onChange={handleSourceTextInput}
            />
            <span className='absolute bottom-0 right-3 text-gray-500 bg-white px-1'>
              {sourceText.length.toLocaleString()}/{MAX_TEXT_LENGTH.toLocaleString()}
            </span>
          </div>
        </div>
        <div className='flex w-[10x]'>
          <Button variant='ghost' size='icon' disabled>
            {isLoading ? <Loader2 className='animate-spin' /> : <ArrowRightLeft />}
          </Button>
        </div>
        <div className='flex flex-col gap-1 w-full md:w-1/2'>
          <div className='flex flex-wrap'>
            <Button
              variant={outputLanguage === LANGUAGES.vn ? 'default' : 'link'}
              onClick={() => setOutputLanguage(LANGUAGES.vn)}
              disabled={inputLanguage === LANGUAGES.vn}
            >
              Việt
            </Button>
            <Button
              variant={outputLanguage === LANGUAGES.en ? 'default' : 'link'}
              onClick={() => setOutputLanguage(LANGUAGES.en)}
              disabled={inputLanguage === LANGUAGES.en}
            >
              Anh
            </Button>
            <Button
              variant={outputLanguage === LANGUAGES.ja ? 'default' : 'link'}
              onClick={() => setOutputLanguage(LANGUAGES.ja)}
              disabled={inputLanguage === LANGUAGES.ja}
            >
              Nhật
            </Button>
          </div>
          <div className=''>
            <div className='w-full flex rounded-md border border-input bg-gray-50 px-1 pt-1 pb-8 '>
              <Textarea
                ref={textAreaTranslatedRef}
                className='min-h-[128px] resize-none w-full border-none outline-none disabled:cursor-auto disabled:bg-gray-50 disabled:opacity-100'
                value={translatedText}
                disabled={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
