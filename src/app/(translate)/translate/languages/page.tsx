'use client';
import { Button } from '@/src/components/ui/button';
import { LANGUAGES } from '@/src/types/model';
import { ArrowRightLeft, ChevronDown, Copy, ImagePlus, Loader2, X } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { createPromptTranslateImage, createPromptTranslateLanguage } from '@/src/prompt/languageTranslatePrompt';
import { modelCallWithStreaming } from '@/src/service/translateService';
import { areAnyApiKeysAvailable } from '@/src/utils/getProvider';
import PageView from '@/src/components/PageView';
import TextareaAutosize from '@/src/components/input/TextareaAutosize';
import MarkdownPreview from '@/src/components/MarkdownPreview';
import TranslationHistory, {
  ITranslationHistory,
  ITranslationHistoryRefHandle
} from '@/src/components/TranslationHistory';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/src/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { markdownToPlainText } from '@/src/lib/markdown';
import type { ModelMessage } from 'ai';

const MAX_TEXT_LENGTH = 25000;
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const TEXT_AREA_HEIGHT_DEFAULT = 128;
const IMAGE_PANEL_HEIGHT = 320;
const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
type SourceMode = 'text' | 'image';
type TranslationViewMode = 'text' | 'markdown';

const formatFileSize = (size: number) => {
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(2)} MB`;
};

const getImageSourceKey = (file: File) => `image:${file.name}:${file.type}:${file.size}:${file.lastModified}`;

const Page = () => {
  const t = useTranslations();
  const [sourceText, setSourceText] = useState('');
  const [sourceMode, setSourceMode] = useState<SourceMode>('text');
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [sourceImagePreview, setSourceImagePreview] = useState('');
  const [reusedImageSourceName, setReusedImageSourceName] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [inputLanguage, setInputLanguage] = useState(LANGUAGES.ja);
  const [outputLanguage, setOutputLanguage] = useState(LANGUAGES.vn);
  const [sharedHeight, setSharedHeight] = useState<number>(TEXT_AREA_HEIGHT_DEFAULT);
  const [translationViewMode, setTranslationViewMode] = useState<TranslationViewMode>('text');
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const translationHistoryRef = useRef<ITranslationHistoryRefHandle | null>(null);
  const skipHistorySaveRef = useRef(false);
  const lastRequestedSourceRef = useRef<string>('');
  const sourceTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const currentTranslationCostRef = useRef<number>(0);
  const plainTranslatedText = useMemo(() => markdownToPlainText(translatedText), [translatedText]);

  const abortControllerRef = useRef<AbortController | null>(null);

  const clearSourceImage = useCallback(() => {
    setSourceImage(null);
    setSourceImagePreview((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return '';
    });

    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  }, []);

  const handleClearSourceText = useCallback(() => {
    setIsLoading(false);
    abortControllerRef.current?.abort();
    setSourceMode('text');
    setSourceText('');
    clearSourceImage();
    setReusedImageSourceName('');
    setTranslatedText('');
    setSharedHeight(TEXT_AREA_HEIGHT_DEFAULT);
  }, [clearSourceImage]);

  const validateImageFile = useCallback(
    (file: File) => {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast.error(t('TranslatePage.invalidImageTypeError'));
        return false;
      }

      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        toast.error(
          t('TranslatePage.maxImageSizeError', {
            maxSize: formatFileSize(MAX_IMAGE_SIZE_BYTES),
            currentSize: formatFileSize(file.size)
          })
        );
        return false;
      }

      return true;
    },
    [t]
  );

  const handleSelectImage = useCallback(
    (file: File) => {
      if (!validateImageFile(file)) return;

      abortControllerRef.current?.abort();
      setIsLoading(false);
      setSourceMode('image');
      setSourceText('');
      setReusedImageSourceName('');
      setTranslatedText('');
      setSharedHeight(IMAGE_PANEL_HEIGHT);
      setSourceImage(file);
      setSourceImagePreview((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return URL.createObjectURL(file);
      });
    },
    [validateImageFile]
  );

  useEffect(() => {
    return () => {
      if (sourceImagePreview) {
        URL.revokeObjectURL(sourceImagePreview);
      }
    };
  }, [sourceImagePreview]);

  const handleTranslate = useCallback(async () => {
    const trimmedSourceText = sourceText.trim();
    const imageSourceKey = sourceImage ? getImageSourceKey(sourceImage) : '';

    if (trimmedSourceText !== sourceText) {
      /* keep UI value untrimmed */
    }

    if (!trimmedSourceText && !sourceImage) {
      setIsLoading(false);
      return;
    }

    setTranslatedText('');

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
        !sourceImage &&
        item.sourceText === trimmedSourceText &&
        item.sourceType !== 'image' &&
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
    lastRequestedSourceRef.current = sourceImage ? imageSourceKey : trimmedSourceText;
    currentTranslationCostRef.current = 0; // Reset cost for new translation
    try {
      const stream = sourceImage
        ? await modelCallWithStreaming(
            {
              messages: [
                {
                  role: 'user',
                  content: [
                    {
                      type: 'text',
                      text: createPromptTranslateImage(inputLanguage, outputLanguage).prompt
                    },
                    {
                      type: 'image',
                      image: await sourceImage.arrayBuffer(),
                      mediaType: sourceImage.type
                    }
                  ]
                }
              ] satisfies ModelMessage[],
              taskType: 'translate',
              onCostTracked: (cost) => {
                // Store the cost when tracking completes
                currentTranslationCostRef.current = cost;
              }
            },
            abortController.signal
          )
        : await modelCallWithStreaming(
            {
              system: createPromptTranslateLanguage(inputLanguage, outputLanguage, trimmedSourceText).system,
              prompt: createPromptTranslateLanguage(inputLanguage, outputLanguage, trimmedSourceText).prompt,
              taskType: 'translate',
              onCostTracked: (cost) => {
                // Store the cost when tracking completes
                currentTranslationCostRef.current = cost;
              }
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
  }, [
    abortControllerRef,
    inputLanguage,
    outputLanguage,
    skipHistorySaveRef,
    sourceImage,
    sourceText,
    t,
    translationHistoryRef
  ]);

  useEffect(() => {
    const handler = setTimeout(() => {
      handleTranslate();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [sourceText, sourceImage, inputLanguage, outputLanguage, handleTranslate]);

  useEffect(() => {
    const trimmedSourceText = sourceText.trim();
    const sourceKey = sourceImage ? getImageSourceKey(sourceImage) : trimmedSourceText;

    if (skipHistorySaveRef.current) {
      skipHistorySaveRef.current = false;
      return;
    }

    if (!isLoading && translatedText && sourceKey && sourceKey === lastRequestedSourceRef.current) {
      const newEntry: ITranslationHistory = {
        id: new Date().toISOString(),
        sourceText: sourceImage ? t('TranslatePage.imageHistorySource', { name: sourceImage.name }) : trimmedSourceText,
        translatedText,
        inputLanguage,
        outputLanguage,
        timestamp: Date.now(),
        cost: currentTranslationCostRef.current,
        sourceType: sourceImage ? 'image' : 'text',
        sourceName: sourceImage?.name
      };
      translationHistoryRef.current?.add(newEntry);
    }
  }, [
    inputLanguage,
    isLoading,
    outputLanguage,
    skipHistorySaveRef,
    sourceImage,
    sourceText,
    t,
    translatedText,
    translationHistoryRef
  ]);

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

  const handleSourceHeightChange = useCallback((newHeight: number) => {
    setSharedHeight(newHeight);
  }, []);

  const copyTranslation = useCallback(
    (format: TranslationViewMode = 'text') => {
      const text = format === 'markdown' ? translatedText : plainTranslatedText;

      if (!text) return;

      navigator.clipboard.writeText(text);
      toast.success(t(format === 'markdown' ? 'TranslatePage.copiedMarkdown' : 'TranslatePage.copiedText'));
    },
    [plainTranslatedText, t, translatedText]
  );

  const handleReuseTranslation = (item: ITranslationHistory) => {
    skipHistorySaveRef.current = true;
    clearSourceImage();
    if (item.sourceType === 'image') {
      setSourceMode('image');
      setReusedImageSourceName(item.sourceName ?? item.sourceText);
      setSourceText('');
      setSharedHeight(IMAGE_PANEL_HEIGHT);
    } else {
      setSourceMode('text');
      setReusedImageSourceName('');
      setSharedHeight(TEXT_AREA_HEIGHT_DEFAULT);
      setSourceText(item.sourceText);
    }
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
            <input
              ref={imageInputRef}
              type='file'
              accept={ACCEPTED_IMAGE_TYPES.join(',')}
              className='hidden'
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleSelectImage(file);
                }
              }}
            />
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
                  setSourceMode('text');
                  clearSourceImage();
                  setReusedImageSourceName('');
                  if (sourceMode === 'image') {
                    setSharedHeight(TEXT_AREA_HEIGHT_DEFAULT);
                  }
                  setSourceText(rawValue);
                }
              }}
              onPaste={(e) => {
                const imageItem = Array.from(e.clipboardData?.items ?? []).find((item) =>
                  item.type.startsWith('image/')
                );

                if (imageItem) {
                  const file = imageItem.getAsFile();
                  if (file) {
                    e.preventDefault();
                    handleSelectImage(file);
                  }
                  return;
                }

                const text = e.clipboardData?.getData('text') ?? '';
                const trimmed = text.trim();
                if (trimmed !== text) {
                  e.preventDefault();
                  const el = sourceTextareaRef.current;
                  if (el) {
                    setSourceMode('text');
                    clearSourceImage();
                    setReusedImageSourceName('');
                    if (sourceMode === 'image') {
                      setSharedHeight(TEXT_AREA_HEIGHT_DEFAULT);
                    }
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
            {sourceImage && sourceImagePreview ? (
              <div className='pointer-events-none absolute inset-1 bottom-8 z-10 bg-background pr-10'>
                <div className='h-full w-full overflow-hidden rounded border bg-gray-50'>
                  <img
                    src={sourceImagePreview}
                    alt={sourceImage.name}
                    className='h-full w-full object-contain'
                  />
                </div>
              </div>
            ) : reusedImageSourceName ? (
              <div className='pointer-events-none absolute inset-1 bottom-8 z-10 flex items-center justify-center rounded bg-gray-50 px-12 text-sm text-gray-600'>
                <span className='truncate'>
                  {t('TranslatePage.reusedImageHistorySource', { name: reusedImageSourceName })}
                </span>
              </div>
            ) : undefined}
            {sourceMode === 'image' && (sourceImage || reusedImageSourceName) ? (
              <Button
                variant='ghost'
                size='icon'
                className='absolute right-1 top-1 z-20 bg-background/90 hover:bg-background'
                onClick={handleClearSourceText}
              >
                <X />
              </Button>
            ) : undefined}
            {sourceMode === 'text' && sourceText !== '' ? (
              <span>
                <Button variant='ghost' size='icon' onClick={handleClearSourceText}>
                  <X />
                </Button>
              </span>
            ) : undefined}
            <div className='absolute bottom-0 right-3 z-20 max-w-[calc(100%-3.5rem)] truncate bg-white px-1 text-right text-gray-500'>
              {sourceImage
                ? `${sourceImage.name} (${formatFileSize(sourceImage.size)})`
                : reusedImageSourceName
                  ? t('TranslatePage.imageHistorySource', { name: reusedImageSourceName })
                : `${sourceText.length.toLocaleString()}/${MAX_TEXT_LENGTH.toLocaleString()}`}
            </div>
            <div className='absolute bottom-0 left-2 z-20 flex items-center gap-1 bg-white pr-1'>
              <Button
                variant='ghost'
                size='icon'
                aria-label={t('TranslatePage.uploadImage')}
                onClick={() => imageInputRef.current?.click()}
              >
                <ImagePlus className='h-4 w-4' />
              </Button>
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
            <div className='relative w-full flex rounded-md border border-input bg-gray-50 px-1 pt-1 pb-8'>
              <Tabs
                value={translationViewMode}
                onValueChange={(value) => setTranslationViewMode(value as TranslationViewMode)}
                className='w-full min-w-0'
              >
                <TabsContent value='text' className='m-0'>
                  <TextareaAutosize
                    className='w-full border-none outline-none disabled:cursor-auto disabled:bg-gray-50 disabled:opacity-100'
                    value={plainTranslatedText}
                    disabled={true}
                    forcedHeight={sharedHeight}
                    onHeightChange={handleSourceHeightChange}
                  />
                </TabsContent>
                <TabsContent value='markdown' className='m-0'>
                  <div
                    className='w-full min-w-0 overflow-auto rounded bg-gray-50 px-2 pb-2'
                    style={{ height: sharedHeight }}
                  >
                    <MarkdownPreview content={translatedText} />
                  </div>
                </TabsContent>
                <div className='absolute bottom-1 right-2 z-20 flex max-w-[calc(100%-1rem)] items-center gap-1 bg-gray-50 pl-1'>
                  <TabsList className='h-7 shadow-sm'>
                    <TabsTrigger value='text' className='h-6 px-2 text-xs'>
                      {t('TranslatePage.textView')}
                    </TabsTrigger>
                    <TabsTrigger value='markdown' className='h-6 px-2 text-xs'>
                      {t('TranslatePage.markdownView')}
                    </TabsTrigger>
                  </TabsList>
                  {translatedText !== '' ? (
                    <div className='flex shrink-0 items-center'>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8 rounded-r-none'
                        aria-label={t('TranslatePage.copyTranslation')}
                        onClick={() => copyTranslation('text')}
                      >
                        <Copy className='h-4 w-4' />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8 rounded-l-none border-l border-border'
                            aria-label={t('TranslatePage.copyOptions')}
                          >
                            <ChevronDown className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem onClick={() => copyTranslation('text')}>
                            {t('TranslatePage.copyAsText')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => copyTranslation('markdown')}>
                            {t('TranslatePage.copyAsMarkdown')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ) : undefined}
                </div>
              </Tabs>
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
