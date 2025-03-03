'use client';
import { APIKeyInput } from '@/components/APIKeyInput';
import { ModelSelect } from '@/components/ModelSelect';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { OpenAIModel, TranslateBody } from '@/types/types';
import { ArrowRightLeft, Languages } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { OpenAIStreamTranslateLanguage } from './action/service';
import { toast } from 'sonner';

const LANGUAGES = {
  ja: 'Japanese',
  vn: 'Vietnamese',
  en: 'English',
  natural: 'Natural'
};

const Page = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [model, setModel] = useState<OpenAIModel>('gpt-4o');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [inputLanguage, setInputLanguage] = useState(LANGUAGES.ja);
  const [outputLanguage, setOutputLanguage] = useState(LANGUAGES.vn);

  useEffect(() => {
    const apiKey = localStorage.getItem('apiKey');

    if (apiKey) {
      setApiKey(apiKey);
    }
  }, []);

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);

    localStorage.setItem('apiKey', value);
  };

  const swapLanguages = () => {
    setInputLanguage(outputLanguage);
    setSourceText(translatedText);

    setTranslatedText(sourceText);
    setOutputLanguage(inputLanguage);
  };

  const handleTranslate = useCallback(async () => {
    const maxCodeLength = 12000;
    setTranslatedText('');
    if (!sourceText || sourceText == '' || sourceText == null) {
      return;
    }

    if (!apiKey) {
      alert('Please enter an API key.');
      return;
    }

    if (inputLanguage === outputLanguage) {
      alert('Please select different languages.');
      return;
    }

    if (sourceText.length > maxCodeLength) {
      alert(
        `Please enter data less than ${maxCodeLength} characters. You are currently at ${sourceText.length} characters.`
      );
      return;
    }

    // setLoading(true);
    // setOutputCode('');

    const controller = new AbortController();

    const body: TranslateBody = {
      inputLanguage,
      outputLanguage,
      inputData: sourceText,
      model,
      apiKey
    };

    const response = await OpenAIStreamTranslateLanguage(
      outputLanguage,
      inputLanguage,
      sourceText,
      model,
      apiKey
    );

    if (!response.ok) {
      // setLoading(false);
      toast.error('Something went wrong.');
      return;
    }

    const data = response.body;

    if (!data) {
      // setLoading(false);
      toast.error('Something went wrong.');
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let code = '';

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);

      code += chunkValue;

      setTranslatedText((prevCode) => prevCode + chunkValue);
    }

    // setLoading(false);
    // setHasTranslated(true);
    // copyToClipboard(code);
  }, [apiKey, inputLanguage, model, outputLanguage, sourceText]);

  useEffect(() => {
    const handler = setTimeout(() => {
      handleTranslate();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [sourceText, inputLanguage, outputLanguage, handleTranslate]);
  //   const copyText = (text) => {
  //     navigator.clipboard.writeText(text);
  //   };

  //   const speakText = (text, lang) => {
  //     const utterance = new SpeechSynthesisUtterance(text);
  //     utterance.lang = lang;
  //     window.speechSynthesis.speak(utterance);
  //   };

  return (
    <div className="flex h-full min-h-screen flex-col px-4 pb-20 text-black sm:px-10">
      <div className="mt-10 flex flex-col items-center justify-center sm:mt-20">
        <div className="text-4xl font-bold">AI Languages Translator</div>
      </div>

      <div className="mt-6 flex flex-col items-center justify-center">
        <APIKeyInput apiKey={apiKey} onChange={handleApiKeyChange} />
      </div>

      <div className="mt-2 flex flex-col items-center justify-center">
        <ModelSelect model={model} onChange={(value) => setModel(value)} />
      </div>

      <div className="p-10">
        <div className="flex justify-between">
          <div className=""></div>
        </div>
        <div className="flex pb-3">
          <Button variant="outline" size="default">
            <Languages />
            Văn bản
          </Button>
        </div>
        <div className="flex justify-center w-full gap-2">
          <div className="flex-1 gap-1">
            <div className="flex">
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
                variant={
                  inputLanguage === LANGUAGES.natural ? 'default' : 'link'
                }
                onClick={() => {
                  setInputLanguage(LANGUAGES.natural);
                }}
              >
                Phát hiện ngôn ngữ
              </Button>
            </div>
            <div className="">
              <Textarea
                className="h-32"
                onChange={(e) => {
                  setSourceText(e.target.value);
                }}
              />
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={swapLanguages}>
            <ArrowRightLeft />
          </Button>
          <div className="flex-1">
            <div className="flex">
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
            <div className="">
              <Textarea
                className="h-32"
                value={translatedText}
                placeholder="Bản dịch"
                onChange={(e) => {
                  setTranslatedText(e.target.value);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
