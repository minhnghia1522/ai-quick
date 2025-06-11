'use client';
import { Button } from '@/src/components/ui/button';
import { LANGUAGES } from '@/src/types/model';
import { ArrowRightLeft, Loader2, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { createPromptTranslateLanguage } from '@/src/prompt/languageTranslatePrompt';
import { modelCallWithStreaming } from '@/src/service/translateService';
import { areAnyApiKeysAvailable } from '@/src/utils/getProvider';
import PageView from '@/src/components/PageView';
import TextareaAutosize from '@/src/components/input/TextareaAutosize';
import { isEmpty } from 'lodash';

const MAX_TEXT_LENGTH = 5000;
const TEXT_AREA_HEIGHT_DEFAULT = 128;

const Page = () => {
  const t = useTranslations();
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [inputLanguage, setInputLanguage] = useState(LANGUAGES.ja);
  const [outputLanguage, setOutputLanguage] = useState(LANGUAGES.vn);
  const [sharedHeight, setSharedHeight] = useState<number>(TEXT_AREA_HEIGHT_DEFAULT);
  const [isLoading, setIsLoading] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleTranslate = useCallback(async () => {
    setTranslatedText('');
    if (!sourceText || sourceText === '' || sourceText == null) {
      return;
    }

    if (!areAnyApiKeysAvailable()) {
      toast.error(t('TranslatePage.apiKeyError'));
      return;
    }

    if (inputLanguage === outputLanguage) {
      toast.error(t('TranslatePage.selectDifferentLanguagesError'));
      return;
    }

    if (sourceText.length > MAX_TEXT_LENGTH) {
      toast.error(t('TranslatePage.maxLengthError', { maxLength: MAX_TEXT_LENGTH, currentLength: sourceText.length }));
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
      const stream = await modelCallWithStreaming(prompt, abortController.signal);

      for await (const textPart of stream.textStream) {
        setTranslatedText((prevData) => prevData + textPart);
      }
    } catch (error) {
      if (error instanceof Error) {
        if (['AbortError', 'aborted'].some((term) => error.message.includes(term))) return;
        toast.error(error.message);
      } else {
        toast.error(t('TranslatePage.unexpectedError'));
      }
    }

    setIsLoading(false);
  }, [inputLanguage, outputLanguage, sourceText, t]);

  useEffect(() => {
    const handler = setTimeout(() => {
      handleTranslate();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [sourceText, inputLanguage, outputLanguage, handleTranslate]);

  const handleInputLanguageChange = (language: string) => () => {
    setInputLanguage((preValue) => {
      if (language == outputLanguage) {
        setOutputLanguage(preValue);
      }
      return language;
    });
  };

  const handleOutLanguageChange = (language: string) => () => {
    setOutputLanguage((preValue) => {
      if (inputLanguage == language) {
        setInputLanguage(preValue);
      }
      return language;
    });
  };

  const handleClearSourceText = () => {
    setIsLoading(false);
    abortControllerRef.current?.abort();
    setSourceText('');
    setTranslatedText('');
    setSharedHeight(TEXT_AREA_HEIGHT_DEFAULT);
  };

  const handleSourceHeightChange = useCallback((newHeight: number) => {
    setSharedHeight(newHeight);
  }, []);

  const renderBody = () => (
    <div className='flex flex-col md:flex-row justify-center w-full max-w-full gap-3 md:px-0 lg:px-6 xl:px-16'>
      <div className='flex flex-col gap-1 w-full md:w-1/2'>
        <div className='flex flex-nowrap gap-1 overflow-x-auto'>
          <Button
            variant={inputLanguage === LANGUAGES.ja ? 'default' : 'link'}
            onClick={handleInputLanguageChange(LANGUAGES.ja)}
          >
            {t('TranslatePage.japanese')}
          </Button>
          <Button
            variant={inputLanguage === LANGUAGES.en ? 'default' : 'link'}
            onClick={handleInputLanguageChange(LANGUAGES.en)}
            className={`hidden block xs:block md:hidden lg:block xl:block`}
          >
            {t('TranslatePage.english')}
          </Button>
          <Button
            variant={inputLanguage === LANGUAGES.vn ? 'default' : 'link'}
            onClick={handleInputLanguageChange(LANGUAGES.vn)}
          >
            {t('TranslatePage.vietnamese')}
          </Button>
          <Button
            variant={inputLanguage === LANGUAGES.natural ? 'default' : 'link'}
            onClick={handleInputLanguageChange(LANGUAGES.natural)}
          >
            {t('TranslatePage.detectLanguage')}
          </Button>
        </div>
        <div className='relative w-full flex rounded-md border border-input bg-background px-1 pt-1 pb-8'>
          <TextareaAutosize
            value={sourceText}
            className='w-full border-none outline-none bg-transparent
          focus:outline-none focus:ring-0 focus:ring-offset-0 focus:shadow-none
          focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
            placeholder={t('TranslatePage.sourcePlaceholder')}
            onChange={(e) => {
              if (isEmpty(e.target.value)) {
                handleClearSourceText();
              } else {
                setSourceText(e.target.value);
              }
            }}
            forcedHeight={sharedHeight}
            onHeightChange={handleSourceHeightChange}
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
      </div>
      <div className='flex w-[10x]'>
        <Button variant='ghost' size='icon' disabled>
          {isLoading ? <Loader2 className='animate-spin' /> : <ArrowRightLeft />}
        </Button>
      </div>
      <div className='flex flex-col gap-1 w-full md:w-1/2'>
        <div className='flex flex-nowrap gap-1 overflow-x-auto'>
          <Button
            variant={outputLanguage === LANGUAGES.vn ? 'default' : 'link'}
            onClick={handleOutLanguageChange(LANGUAGES.vn)}
          >
            {t('TranslatePage.vietnamese')}
          </Button>
          <Button
            variant={outputLanguage === LANGUAGES.en ? 'default' : 'link'}
            onClick={handleOutLanguageChange(LANGUAGES.en)}
          >
            {t('TranslatePage.english')}
          </Button>
          <Button
            variant={outputLanguage === LANGUAGES.ja ? 'default' : 'link'}
            onClick={handleOutLanguageChange(LANGUAGES.ja)}
          >
            {t('TranslatePage.japanese')}
          </Button>
        </div>
        <div className=''>
          <div className='w-full flex rounded-md border border-input bg-gray-50 px-1 pt-1 pb-8 '>
            <TextareaAutosize
              className='w-full border-none outline-none disabled:cursor-auto disabled:bg-gray-50 disabled:opacity-100'
              value={translatedText}
              disabled={true}
              forcedHeight={sharedHeight}
              onHeightChange={handleSourceHeightChange}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <PageView
      title={{
        titleName: t('TranslatePage.title'),
        description: t('TranslatePage.description')
      }}
      body={renderBody()}
    />
  );
};

export default Page;
