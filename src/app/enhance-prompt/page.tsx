'use client';
import { Button } from '@/src/components/ui/button';
import { Copy, Languages, Loader2, WandSparkles, X } from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { createEnhancePrompt } from '@/src/prompt/enhancePrompt';
import { createPromptTranslateEnhancePrompt } from '@/src/prompt/languageTranslatePrompt';
import { LANGUAGES } from '@/src/types/model';
import { modelCallWithStreaming } from '@/src/service/translateService';
import { areAnyApiKeysAvailable } from '@/src/utils/getProvider';
import PageView from '@/src/components/PageView';
import TextareaAutosize from '@/src/components/input/TextareaAutosize';
import { isEmpty } from 'lodash';

const MAX_TEXT_LENGTH = 10000;
const TEXT_AREA_HEIGHT_DEFAULT = 128;

const Page = () => {
  const t = useTranslations();
  const [sourceText, setSourceText] = useState('');
  const [enhancedText, setEnhancedText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sharedHeight, setSharedHeight] = useState<number>(TEXT_AREA_HEIGHT_DEFAULT);

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleEnhance = useCallback(async () => {
    setEnhancedText('');
    if (!sourceText || sourceText.trim() === '') {
      return;
    }
    if (!areAnyApiKeysAvailable()) {
      toast.error(t('EnhancePromptPage.apiKeyError'));
      return;
    }
    if (sourceText.length > MAX_TEXT_LENGTH) {
      toast.error(
        t('EnhancePromptPage.maxLengthError', { maxLength: MAX_TEXT_LENGTH, currentLength: sourceText.length })
      );
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
      const stream = await modelCallWithStreaming({ prompt, taskType: 'enhance-prompt' }, abortController.signal);
      for await (const textPart of stream.textStream) {
        setEnhancedText((prevData) => prevData + textPart);
      }
    } catch (error) {
      if (error instanceof Error) {
        if (['AbortError', 'aborted'].some((term) => error.message.includes(term))) return;
        toast.error(error.message);
      } else {
        toast.error(t('EnhancePromptPage.unexpectedError'));
      }
    }
    setIsLoading(false);
  }, [sourceText, t]);

  const handleTranslateToEnglish = useCallback(async () => {
    if (!enhancedText || enhancedText.trim() === '') {
      return;
    }
    if (!areAnyApiKeysAvailable()) {
      toast.error(t('EnhancePromptPage.apiKeyError'));
      return;
    }
    if (enhancedText.length > MAX_TEXT_LENGTH) {
      toast.error(
        t('EnhancePromptPage.maxLengthError', { maxLength: MAX_TEXT_LENGTH, currentLength: enhancedText.length })
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
    const { system, prompt } = createPromptTranslateEnhancePrompt(LANGUAGES.en, enhancedText);
    try {
      const stream = await modelCallWithStreaming({ prompt, system, taskType: 'translate' }, abortController.signal);
      for await (const textPart of stream.textStream) {
        setTranslatedText((prevData) => prevData + textPart);
      }
    } catch (error) {
      if (error instanceof Error) {
        if (['AbortError', 'aborted'].some((term) => error.message.includes(term))) return;
        toast.error(error.message);
      } else {
        toast.error(t('EnhancePromptPage.unexpectedError'));
      }
    }
    setIsLoading(false);
  }, [enhancedText, t]);

  const handleClearSourceText = () => {
    setIsLoading(false);
    abortControllerRef.current?.abort();
    setSourceText('');
    setEnhancedText('');
    setTranslatedText('');
    setSharedHeight(TEXT_AREA_HEIGHT_DEFAULT);
  };

  const handleSourceHeightChange = useCallback((newHeight: number) => {
    setSharedHeight(newHeight);
  }, []);

  const renderBody = () => {
    return (
      <div className='flex flex-col md:flex-row justify-center w-full max-w-full gap-3 md:px-0 lg:px-14 xl:px-32'>
        <div className='flex flex-col gap-1 w-full md:w-1/2'>
          <div className='relative w-full flex rounded-md border border-input bg-background px-1 pt-1 pb-8'>
            <TextareaAutosize
              value={sourceText}
              className='w-full min-h-[128px] resize-none border-none outline-none bg-transparent
                  focus:outline-none focus:ring-0 focus:ring-offset-0 focus:shadow-none
                  focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
              placeholder={t('EnhancePromptPage.sourcePlaceholder')}
              onChange={(e) => {
                if (isEmpty(e.target.value)) {
                  handleClearSourceText();
                } else {
                  setSourceText(e.target.value);
                }
              }}
              disabled={isLoading}
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
          <div className='flex justify-end mt-2'>
            <div className='flex gap-2'>
              <Button onClick={handleEnhance} disabled={isLoading || !sourceText.trim()} className='w-32'>
                <>
                  {isLoading ? <Loader2 className='animate-spin' /> : <WandSparkles />}
                  {t(enhancedText ? 'EnhancePromptPage.enhanceAgainButton' : 'EnhancePromptPage.enhanceButton')}
                </>
              </Button>
              {enhancedText && (
                <Button onClick={handleTranslateToEnglish} disabled={isLoading} className='w-42' variant='outline'>
                  {isLoading ? <Loader2 className='animate-spin' /> : <Languages />}
                  {t('EnhancePromptPage.translateToEnglishButton')}
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className='flex flex-col gap-1 w-full md:w-1/2'>
          <div className='w-full flex flex-col gap-3'>
            <div className='relative w-full flex rounded-md border border-input bg-gray-50 px-1 pt-1 pb-8'>
              <TextareaAutosize
                className='w-full border-none outline-none disabled:cursor-auto disabled:bg-gray-50 disabled:opacity-100'
                value={enhancedText}
                placeholder={
                  isLoading
                    ? t('EnhancePromptPage.enhancedPlaceholderLoading')
                    : t('EnhancePromptPage.enhancedPlaceholder')
                }
                disabled={true}
                forcedHeight={sharedHeight}
                onHeightChange={handleSourceHeightChange}
              />
              <span>
                {enhancedText !== '' ? (
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => {
                      navigator.clipboard.writeText(enhancedText);
                      toast.success(t('EnhancePromptPage.copied'));
                    }}
                  >
                    <Copy />
                  </Button>
                ) : undefined}
              </span>
            </div>
            {translatedText && (
              <div className='relative w-full flex rounded-md border border-input bg-gray-50 px-1 pt-1 pb-8'>
                <TextareaAutosize
                  className='min-h-[128px] resize-none w-full border-none outline-none disabled:cursor-auto disabled:bg-gray-50 disabled:opacity-100'
                  value={translatedText}
                  placeholder={t('EnhancePromptPage.translatedPlaceholder')}
                  disabled={true}
                />
                <span>
                  {translatedText !== '' ? (
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => {
                        navigator.clipboard.writeText(translatedText);
                        toast.success(t('EnhancePromptPage.copied'));
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
    );
  };

  return (
    <PageView
      title={{
        titleName: t('EnhancePromptPage.title'),
        description: t('EnhancePromptPage.description')
      }}
      body={renderBody()}
    />
  );
};

export default Page;
