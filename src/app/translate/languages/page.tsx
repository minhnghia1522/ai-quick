'use client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { LANGUAGES } from '@/types/types';
import { ArrowRightLeft, Languages } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { createPromptTranslateLanguage } from '@/prompt/languageTranslatePrompt';
import { OpenAIStream } from '@/service/openAI';
import { Label } from '@/components/ui/label';

const maxTextLength = 5000;
const Page = () => {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [inputLanguage, setInputLanguage] = useState(LANGUAGES.ja);
  const [outputLanguage, setOutputLanguage] = useState(LANGUAGES.vn);

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

    if (sourceText.length > maxTextLength) {
      alert(
        `Please enter data less than ${maxTextLength} characters. You are currently at ${sourceText.length} characters.`
      );
      return;
    }

    const controller = new AbortController();

    const prompt = createPromptTranslateLanguage(inputLanguage, outputLanguage, sourceText);

    const stream = await OpenAIStream({
      prompt,
      controller
    });
    const response = new Response(stream);

    if (!response.ok) {
      toast.error('Something went wrong.');
      return;
    }

    const data = response.body;

    if (!data) {
      toast.error('Something went wrong.');
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);

      setTranslatedText((prevCode) => prevCode + chunkValue);
    }
  }, [inputLanguage, outputLanguage, sourceText]);

  useEffect(() => {
    const handler = setTimeout(() => {
      handleTranslate();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [sourceText, inputLanguage, outputLanguage, handleTranslate]);

  return (
    <div className='flex h-full w-full min-h-screen flex-col px-4 pb-20 text-black sm:px-10'>
      <div className='p-10 flex flex-col items-center justify-center sm:mt-20'>
        <Label className='text-4xl'>Smart AI Translator Powered by ChatGPT</Label>
        <div className='p-3'>
          <Button variant='outline' size='default'>
            <Languages />
            Văn bản
          </Button>
        </div>
      </div>
      <div className='flex justify-center w-full max-w-full gap-3'>
        <div className='gap-1'>
          <div className='flex'>
            <Button
              variant={inputLanguage === LANGUAGES.ja ? 'default' : 'link'}
              onClick={() => {
                setInputLanguage(LANGUAGES.ja);
              }}
              disabled={outputLanguage === LANGUAGES.ja}
            >
              Nhật
            </Button>
            <Button
              variant={inputLanguage === LANGUAGES.en ? 'default' : 'link'}
              onClick={() => {
                setInputLanguage(LANGUAGES.en);
              }}
              disabled={outputLanguage === LANGUAGES.en}
            >
              Anh
            </Button>
            <Button
              variant={inputLanguage === LANGUAGES.vn ? 'default' : 'link'}
              onClick={() => {
                setInputLanguage(LANGUAGES.vn);
              }}
              disabled={outputLanguage === LANGUAGES.vn}
            >
              Việt
            </Button>
            <Button
              variant={inputLanguage === LANGUAGES.natural ? 'default' : 'link'}
              onClick={() => {
                setInputLanguage(LANGUAGES.natural);
              }}
            >
              Phát hiện ngôn ngữ
            </Button>
          </div>
          <div className='pt-0.5 relative w-xl max-w-xl'>
            <Textarea
              className='h-50 resize-none'
              placeholder='Type or paste text here to translate'
              onChange={(e) => {
                setSourceText(e.target.value);
              }}
            />
            <span className='absolute bottom-2 right-3 text-gray-500 bg-white px-1'>
              {sourceText.length.toLocaleString()}/{maxTextLength.toLocaleString()}
            </span>
          </div>
        </div>
        <div className='w-[50px] max-w-[50px]'>
          <Button variant='ghost' size='icon' disabled>
            <ArrowRightLeft />
          </Button>
        </div>
        <div className='w-xl max-w-xl'>
          <div className='flex flex-1'>
            <Button
              variant={outputLanguage === LANGUAGES.vn ? 'default' : 'link'}
              onClick={() => {
                setOutputLanguage(LANGUAGES.vn);
              }}
              disabled={inputLanguage === LANGUAGES.vn}
            >
              Việt
            </Button>
            <Button
              variant={outputLanguage === LANGUAGES.en ? 'default' : 'link'}
              onClick={() => {
                setOutputLanguage(LANGUAGES.en);
              }}
              disabled={inputLanguage === LANGUAGES.en}
            >
              Anh
            </Button>
            <Button
              variant={outputLanguage === LANGUAGES.ja ? 'default' : 'link'}
              onClick={() => {
                setOutputLanguage(LANGUAGES.ja);
              }}
              disabled={inputLanguage === LANGUAGES.ja}
            >
              Nhật
            </Button>
          </div>
          <div className='flex-1 pt-0.5 '>
            <div className='h-50 border-input  flex field-sizing-content min-h-16 w-full rounded-md border bg-gray-50 px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px]  md:text-sm'>
              {translatedText}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
