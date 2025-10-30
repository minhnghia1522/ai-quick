'use client';
import { Button } from '@/src/components/ui/button';
import { LANGUAGES } from '@/src/types/model';
import { ArrowRightLeft, Copy, Loader2, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { createPromptTranslateLanguage } from '@/src/prompt/languageTranslatePrompt';
import { modelCallWithStreaming } from '@/src/service/translateService';
import { areAnyApiKeysAvailable } from '@/src/utils/getProvider';
import PageView from '@/src/components/PageView';
import TextareaAutosize from '@/src/components/input/TextareaAutosize';
import TranslationHistory, {
  ITranslationHistory,
  ITranslationHistoryRefHandle
} from '@/src/components/TranslationHistory';

const MAX_TEXT_LENGTH = 25000;
const TEXT_AREA_HEIGHT_DEFAULT = 128;

const Page = () => {
  const t = useTranslations();
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [inputLanguage, setInputLanguage] = useState(LANGUAGES.ja);
  const [outputLanguage, setOutputLanguage] = useState(LANGUAGES.vn);
  const [sharedHeight, setSharedHeight] = useState<number>(TEXT_AREA_HEIGHT_DEFAULT);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const translationHistoryRef = useRef<ITranslationHistoryRefHandle | null>(null);
  const skipHistorySaveRef = useRef(false);
  const lastRequestedSourceRef = useRef<string>('');
  const sourceTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleTranslate = useCallback(async () => {
    const trimmedSourceText = sourceText.trim();

    if (trimmedSourceText !== sourceText) {
      /* keep UI value untrimmed */
    }

    setTranslatedText('');

    if (!trimmedSourceText) {
      setIsLoading(false);
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

    if (trimmedSourceText.length > MAX_TEXT_LENGTH) {
      toast.error(
        t('TranslatePage.maxLengthError', {
          maxLength: MAX_TEXT_LENGTH,
          currentLength: trimmedSourceText.length
        })
      );
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setTranslatedText('');
    }

    const historyList = translationHistoryRef.current?.getHistory?.() ?? [];
    const matchedHistory = historyList.find(
      (item) =>
        item.sourceText === trimmedSourceText &&
        item.inputLanguage === inputLanguage &&
        item.outputLanguage === outputLanguage
    );

    if (matchedHistory) {
      skipHistorySaveRef.current = true;
      setTranslatedText(matchedHistory.translatedText);
      setIsLoading(false);
      return;
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsLoading(true);
    lastRequestedSourceRef.current = trimmedSourceText;
    const prompt = createPromptTranslateLanguage(inputLanguage, outputLanguage, trimmedSourceText);
    try {
      const stream = await modelCallWithStreaming(
        {
          system: prompt.system,
          prompt: prompt.prompt,
          taskType: 'translate'
        },
        abortController.signal
      );

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
    } finally {
      setIsLoading(false);
    }
  }, [abortControllerRef, inputLanguage, outputLanguage, skipHistorySaveRef, sourceText, t, translationHistoryRef]);

  useEffect(() => {
    const handler = setTimeout(() => {
      handleTranslate();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [sourceText, inputLanguage, outputLanguage, handleTranslate]);

  useEffect(() => {
    const trimmedSourceText = sourceText.trim();

    if (skipHistorySaveRef.current) {
      skipHistorySaveRef.current = false;
      return;
    }

    if (!isLoading && translatedText && trimmedSourceText && trimmedSourceText === lastRequestedSourceRef.current) {
      const newEntry: ITranslationHistory = {
        id: new Date().toISOString(),
        sourceText: trimmedSourceText,
        translatedText,
        inputLanguage,
        outputLanguage,
        timestamp: Date.now()
      };
      translationHistoryRef.current?.add(newEntry);
    }
  }, [inputLanguage, isLoading, outputLanguage, skipHistorySaveRef, sourceText, translatedText, translationHistoryRef]);

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

  const handleReuseTranslation = (item: ITranslationHistory) => {
    skipHistorySaveRef.current = true;
    setSourceText(item.sourceText);
    setTranslatedText(item.translatedText);
    setInputLanguage(item.inputLanguage);
    setOutputLanguage(item.outputLanguage);
    setIsHistoryOpen(false);
    toast.info(t('TranslatePage.translationReused'));
  };

  const renderBody = () => (
    <>
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
              ref={sourceTextareaRef}
              value={sourceText}
              className='w-full border-none outline-none bg-transparent
          focus:outline-none focus:ring-0 focus:ring-offset-0 focus:shadow-none
          focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
              placeholder={t('TranslatePage.sourcePlaceholder')}
              onChange={(e) => {
                const rawValue = e.target.value;
                if (rawValue.trim() === '') {
                  handleClearSourceText();
                } else {
                  setSourceText(rawValue);
                }
              }}
              onPaste={(e) => {
                const text = e.clipboardData?.getData('text') ?? '';
                const trimmed = text.trim();
                if (trimmed !== text) {
                  e.preventDefault();
                  const el = sourceTextareaRef.current;
                  if (el) {
                    const { selectionStart, selectionEnd } = el;
                    setSourceText((prev) => {
                      const before = prev.slice(0, selectionStart);
                      const after = prev.slice(selectionEnd);
                      return before + trimmed + after;
                    });
                    requestAnimationFrame(() => {
                      const pos = selectionStart + trimmed.length;
                      try {
                        el.setSelectionRange(pos, pos);
                      } catch {}
                    });
                  }
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
              <span>
                {translatedText !== '' ? (
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => {
                      navigator.clipboard.writeText(translatedText);
                      toast.success(t('TranslatePage.copied'));
                    }}
                  >
                    <Copy />
                  </Button>
                ) : undefined}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className='w-full flex justify-center'>
        <TranslationHistory
          ref={translationHistoryRef}
          open={isHistoryOpen}
          onOpenChange={setIsHistoryOpen}
          onReuse={handleReuseTranslation}
        />
      </div>
    </>
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
