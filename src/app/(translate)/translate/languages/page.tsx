'use client';

import PageView from '@/src/components/PageView';
import TranslationHistory, {
  ITranslationHistory,
  ITranslationHistoryRefHandle
} from '@/src/components/TranslationHistory';
import { Button } from '@/src/components/ui/button';
import { useSidebar } from '@/src/components/ui/sidebar';
import { useJapaneseLearningSelection } from '@/src/hooks/useJapaneseLearningSelection';
import { markdownToPlainText } from '@/src/lib/markdown';
import { createPromptTranslateImage, createPromptTranslateLanguage } from '@/src/prompt/languageTranslatePrompt';
import { modelCallWithStreaming } from '@/src/service/translateService';
import { LANGUAGES } from '@/src/types/model';
import { areAnyApiKeysAvailable } from '@/src/utils/getProvider';
import type { ModelMessage } from 'ai';
import { ArrowRightLeft, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import ExpandedOutputDialog from './_components/ExpandedOutputDialog';
import JapaneseLearningActionButton from './_components/JapaneseLearningActionButton';
import JapaneseLearningDialog from './_components/JapaneseLearningDialog';
import SourceLanguagePanel from './_components/SourceLanguagePanel';
import TranslationOutputPanel from './_components/TranslationOutputPanel';
import {
  ACCEPTED_IMAGE_TYPES,
  IMAGE_PANEL_HEIGHT,
  JAPANESE_LEARNING_ENABLED_STORAGE_KEY,
  JAPANESE_LEARNING_MAX_SELECTION_LENGTH,
  MAX_IMAGE_SIZE_BYTES,
  MAX_TEXT_LENGTH,
  TEXT_AREA_HEIGHT_DEFAULT,
  formatFileSize,
  getImageSourceKey
} from './_components/translationHelpers';
import type { SourceMode, TranslationViewMode } from './_components/translationHelpers';

const IMAGE_OUTPUT_HISTORY_FALLBACK_RESERVE = 160;
const IMAGE_OUTPUT_HISTORY_TOP_GAP = 32;
const IMAGE_OUTPUT_VIEWPORT_BOTTOM_PADDING = 32;
const HORIZONTAL_OVERFLOW_THRESHOLD = 8;

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
  const [sourceHeight, setSourceHeight] = useState<number>(TEXT_AREA_HEIGHT_DEFAULT);
  const [outputHeight, setOutputHeight] = useState<number>(TEXT_AREA_HEIGHT_DEFAULT);
  const [translationViewMode, setTranslationViewMode] = useState<TranslationViewMode>('text');
  const [isOutputExpandedOpen, setIsOutputExpandedOpen] = useState(false);
  const [isJapaneseLearningEnabled, setIsJapaneseLearningEnabled] = useState(false);
  const [isJapaneseLearningOpen, setIsJapaneseLearningOpen] = useState(false);
  const [japaneseLearningText, setJapaneseLearningText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const { open: isSidebarOpen, setOpen: setSidebarOpen, isMobile } = useSidebar();
  const translationHistoryRef = useRef<ITranslationHistoryRefHandle | null>(null);
  const skipHistorySaveRef = useRef(false);
  const lastRequestedSourceRef = useRef<string>('');
  const sourceTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const outputTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const markdownOutputRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const translationHistoryAnchorRef = useRef<HTMLDivElement | null>(null);
  const currentTranslationCostRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const outputAutoExpandedRef = useRef(false);
  const hasAutoClosedSidebarForOutputRef = useRef(false);
  const plainTranslatedText = useMemo(() => markdownToPlainText(translatedText), [translatedText]);
  const allowOutputJapaneseLearningSelection = [LANGUAGES.ja, LANGUAGES.en].includes(outputLanguage);
  const japaneseLearningTextareaRefs = useMemo(
    () => allowOutputJapaneseLearningSelection ? [sourceTextareaRef, outputTextareaRef] : [sourceTextareaRef],
    [allowOutputJapaneseLearningSelection]
  );
  const {
    text: selectedJapaneseLearningText,
    position: japaneseLearningPosition,
    visible: isJapaneseLearningActionVisible,
    clearSelection: clearJapaneseLearningSelection
  } = useJapaneseLearningSelection({
    enabled: isJapaneseLearningEnabled,
    isBlocked: isJapaneseLearningOpen,
    maxLength: JAPANESE_LEARNING_MAX_SELECTION_LENGTH,
    textareaRefs: japaneseLearningTextareaRefs
  });

  useEffect(() => {
    setIsJapaneseLearningEnabled(localStorage.getItem(JAPANESE_LEARNING_ENABLED_STORAGE_KEY) === 'true');
  }, []);

  useEffect(() => {
    clearJapaneseLearningSelection();
  }, [allowOutputJapaneseLearningSelection, clearJapaneseLearningSelection]);

  const handleJapaneseLearningToggle = useCallback((enabled: boolean) => {
    setIsJapaneseLearningEnabled(enabled);
    localStorage.setItem(JAPANESE_LEARNING_ENABLED_STORAGE_KEY, String(enabled));
    clearJapaneseLearningSelection();
  }, [clearJapaneseLearningSelection]);

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
    setSourceHeight(TEXT_AREA_HEIGHT_DEFAULT);
    setOutputHeight(TEXT_AREA_HEIGHT_DEFAULT);
    outputAutoExpandedRef.current = false;
    hasAutoClosedSidebarForOutputRef.current = false;
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
      setTranslationViewMode('markdown');
      setSourceHeight(IMAGE_PANEL_HEIGHT);
      setOutputHeight(IMAGE_PANEL_HEIGHT);
      outputAutoExpandedRef.current = false;
      hasAutoClosedSidebarForOutputRef.current = false;
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

  const handleSourceTextInput = useCallback(
    (value: string) => {
      if (value.trim() === '') {
        handleClearSourceText();
        return;
      }

      setSourceMode('text');
      clearSourceImage();
      setReusedImageSourceName('');
      if (sourceMode === 'image') {
        setSourceHeight(TEXT_AREA_HEIGHT_DEFAULT);
        setOutputHeight(TEXT_AREA_HEIGHT_DEFAULT);
      }
      setSourceText(value);
    },
    [clearSourceImage, handleClearSourceText, sourceMode]
  );

  useEffect(() => {
    return () => {
      if (sourceImagePreview) {
        URL.revokeObjectURL(sourceImagePreview);
      }
    };
  }, [sourceImagePreview]);

  useEffect(() => {
    if (sourceMode !== 'image' || translationViewMode !== 'markdown') return;

    let frameId = 0;
    const adjustOutputHeight = () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }

      frameId = requestAnimationFrame(() => {
        const markdownOutput = markdownOutputRef.current;
        if (!markdownOutput) return;

        const { top } = markdownOutput.getBoundingClientRect();
        const historyAnchorHeight =
          translationHistoryAnchorRef.current?.getBoundingClientRect().height ??
          IMAGE_OUTPUT_HISTORY_FALLBACK_RESERVE;
        const footerReserve =
          historyAnchorHeight + IMAGE_OUTPUT_HISTORY_TOP_GAP + IMAGE_OUTPUT_VIEWPORT_BOTTOM_PADDING;
        const maxOutputHeight = Math.max(
          IMAGE_PANEL_HEIGHT,
          Math.floor(window.innerHeight - top - footerReserve)
        );
        const desiredOutputHeight = Math.max(IMAGE_PANEL_HEIGHT, markdownOutput.scrollHeight);
        const nextOutputHeight = Math.min(desiredOutputHeight, maxOutputHeight);

        setOutputHeight(nextOutputHeight);

        if (desiredOutputHeight > nextOutputHeight && translatedText && !outputAutoExpandedRef.current) {
          outputAutoExpandedRef.current = true;
          setIsOutputExpandedOpen(true);
        }
      });
    };

    adjustOutputHeight();
    window.addEventListener('resize', adjustOutputHeight);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', adjustOutputHeight);
    };
  }, [sourceMode, translatedText, translationViewMode]);

  useEffect(() => {
    if (sourceMode !== 'image') {
      outputAutoExpandedRef.current = false;
    }
  }, [sourceMode]);

  useEffect(() => {
    if (!translatedText || translationViewMode !== 'markdown') {
      hasAutoClosedSidebarForOutputRef.current = false;
    }
  }, [translatedText, translationViewMode]);

  useEffect(() => {
    if (
      isMobile ||
      !isSidebarOpen ||
      !translatedText ||
      translationViewMode !== 'markdown' ||
      hasAutoClosedSidebarForOutputRef.current
    ) {
      return;
    }

    let frameId = 0;
    let timeoutId = 0;

    const closeSidebarWhenPageOverflows = () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }

      frameId = requestAnimationFrame(() => {
        const documentOverflow = Math.max(
          document.documentElement.scrollWidth - document.documentElement.clientWidth,
          document.body.scrollWidth - window.innerWidth
        );

        if (documentOverflow > HORIZONTAL_OVERFLOW_THRESHOLD) {
          hasAutoClosedSidebarForOutputRef.current = true;
          setSidebarOpen(false);
        }
      });
    };

    closeSidebarWhenPageOverflows();
    timeoutId = window.setTimeout(closeSidebarWhenPageOverflows, 250);
    window.addEventListener('resize', closeSidebarWhenPageOverflows);

    return () => {
      cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
      window.removeEventListener('resize', closeSidebarWhenPageOverflows);
    };
  }, [isMobile, isSidebarOpen, setSidebarOpen, translatedText, translationViewMode]);

  const handleTranslate = useCallback(async () => {
    const trimmedSourceText = sourceText.trim();
    const imageSourceKey = sourceImage ? getImageSourceKey(sourceImage) : '';

    if (!trimmedSourceText && !sourceImage) {
      setIsLoading(false);
      return;
    }

    setTranslatedText('');
    hasAutoClosedSidebarForOutputRef.current = false;
    if (sourceImage) {
      setOutputHeight(IMAGE_PANEL_HEIGHT);
      outputAutoExpandedRef.current = false;
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
        !sourceImage &&
        item.sourceText === trimmedSourceText &&
        item.sourceType !== 'image' &&
        item.inputLanguage === inputLanguage &&
        item.outputLanguage === outputLanguage
    );

    if (matchedHistory) {
      skipHistorySaveRef.current = true;
      hasAutoClosedSidebarForOutputRef.current = false;
      setTranslatedText(matchedHistory.translatedText);
      setIsLoading(false);
      return;
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsLoading(true);
    lastRequestedSourceRef.current = sourceImage ? imageSourceKey : trimmedSourceText;
    currentTranslationCostRef.current = 0;

    try {
      const promptConfig = sourceImage
        ? createPromptTranslateImage(inputLanguage, outputLanguage)
        : createPromptTranslateLanguage(inputLanguage, outputLanguage, trimmedSourceText);
      const stream = sourceImage
        ? await modelCallWithStreaming(
            {
              system: promptConfig.system,
              messages: [
                {
                  role: 'user',
                  content: [
                    {
                      type: 'text',
                      text: promptConfig.prompt
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
                currentTranslationCostRef.current = cost;
              }
            },
            abortController.signal
          )
        : await modelCallWithStreaming(
            {
              system: promptConfig.system,
              prompt: promptConfig.prompt,
              taskType: 'translate',
              onCostTracked: (cost) => {
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
  }, [inputLanguage, outputLanguage, sourceImage, sourceText, t]);

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
  }, [inputLanguage, isLoading, outputLanguage, sourceImage, sourceText, t, translatedText]);

  const handleInputLanguageChange = useCallback(
    (language: string) => {
      setInputLanguage((preValue) => {
        if (language === outputLanguage) {
          setOutputLanguage(preValue);
        }
        return language;
      });
    },
    [outputLanguage]
  );

  const handleOutputLanguageChange = useCallback(
    (language: string) => {
      setOutputLanguage((preValue) => {
        if (inputLanguage === language) {
          setInputLanguage(preValue);
        }
        return language;
      });
    },
    [inputLanguage]
  );

  const handleSourceHeightChange = useCallback(
    (newHeight: number) => {
      setSourceHeight(newHeight);
      if (sourceMode === 'text') {
        setOutputHeight(newHeight);
      }
    },
    [sourceMode]
  );

  const handleOutputHeightChange = useCallback(
    (newHeight: number) => {
      setOutputHeight(newHeight);
      if (sourceMode === 'text') {
        setSourceHeight(newHeight);
      }
    },
    [sourceMode]
  );

  const handleTranslationViewModeChange = useCallback((mode: TranslationViewMode) => {
    setTranslationViewMode(mode);
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

  const handleOpenJapaneseLearning = useCallback(() => {
    const selectedText = selectedJapaneseLearningText.trim();

    if (!selectedText) return;

    if (selectedText.length > JAPANESE_LEARNING_MAX_SELECTION_LENGTH) {
      toast.error(
        t('TranslatePage.japaneseLearningSelectionTooLong', {
          maxLength: JAPANESE_LEARNING_MAX_SELECTION_LENGTH,
          currentLength: selectedText.length
        })
      );
      return;
    }

    if (!areAnyApiKeysAvailable()) {
      toast.error(t('TranslatePage.apiKeyError'));
      return;
    }

    setJapaneseLearningText(selectedText);
    setIsJapaneseLearningOpen(true);
    clearJapaneseLearningSelection();
  }, [clearJapaneseLearningSelection, selectedJapaneseLearningText, t]);

  const handleReuseTranslation = useCallback(
    (item: ITranslationHistory) => {
      skipHistorySaveRef.current = true;
      clearSourceImage();
      if (item.sourceType === 'image') {
        setSourceMode('image');
        setReusedImageSourceName(item.sourceName ?? item.sourceText);
        setSourceText('');
        setTranslationViewMode('markdown');
        setSourceHeight(IMAGE_PANEL_HEIGHT);
        setOutputHeight(IMAGE_PANEL_HEIGHT);
        outputAutoExpandedRef.current = false;
      } else {
        setSourceMode('text');
        setReusedImageSourceName('');
        setSourceHeight(TEXT_AREA_HEIGHT_DEFAULT);
        setOutputHeight(TEXT_AREA_HEIGHT_DEFAULT);
        setSourceText(item.sourceText);
      }
      setTranslatedText(item.translatedText);
      hasAutoClosedSidebarForOutputRef.current = false;
      setInputLanguage(item.inputLanguage);
      setOutputLanguage(item.outputLanguage);
      setIsHistoryOpen(false);
      toast.info(t('TranslatePage.translationReused'));
    },
    [clearSourceImage, t]
  );

  const renderBody = () => (
    <>
      <div className='flex flex-col md:flex-row justify-center w-full max-w-full gap-3 md:px-0 lg:px-6 xl:px-16'>
        <SourceLanguagePanel
          sourceText={sourceText}
          sourceMode={sourceMode}
          sourceImage={sourceImage}
          sourceImagePreview={sourceImagePreview}
          reusedImageSourceName={reusedImageSourceName}
          inputLanguage={inputLanguage}
          isJapaneseLearningEnabled={isJapaneseLearningEnabled}
          sourceHeight={sourceHeight}
          imageInputRef={imageInputRef}
          sourceTextareaRef={sourceTextareaRef}
          onInputLanguageChange={handleInputLanguageChange}
          onJapaneseLearningEnabledChange={handleJapaneseLearningToggle}
          onSourceTextInput={handleSourceTextInput}
          onClearSource={handleClearSourceText}
          onSelectImage={handleSelectImage}
          onSourceHeightChange={handleSourceHeightChange}
        />
        <div className='flex w-[10x]'>
          <Button variant='ghost' size='icon' disabled>
            {isLoading ? <Loader2 className='animate-spin' /> : <ArrowRightLeft />}
          </Button>
        </div>
        <TranslationOutputPanel
          outputLanguage={outputLanguage}
          translatedText={translatedText}
          plainTranslatedText={plainTranslatedText}
          outputHeight={outputHeight}
          translationViewMode={translationViewMode}
          outputTextareaRef={outputTextareaRef}
          markdownOutputRef={markdownOutputRef}
          allowJapaneseLearningSelection={allowOutputJapaneseLearningSelection}
          onOutputLanguageChange={handleOutputLanguageChange}
          onOutputHeightChange={handleOutputHeightChange}
          onTranslationViewModeChange={handleTranslationViewModeChange}
          onExpandOutput={() => setIsOutputExpandedOpen(true)}
          onCopyTranslation={copyTranslation}
        />
      </div>
      <ExpandedOutputDialog
        open={isOutputExpandedOpen}
        translatedText={translatedText}
        plainTranslatedText={plainTranslatedText}
        translationViewMode={translationViewMode}
        allowJapaneseLearningSelection={allowOutputJapaneseLearningSelection}
        onOpenChange={setIsOutputExpandedOpen}
        onTranslationViewModeChange={handleTranslationViewModeChange}
        onCopyTranslation={copyTranslation}
      />
      <JapaneseLearningDialog
        open={isJapaneseLearningOpen}
        selectedText={japaneseLearningText}
        onOpenChange={setIsJapaneseLearningOpen}
      />
      <JapaneseLearningActionButton
        visible={isJapaneseLearningActionVisible && Boolean(japaneseLearningPosition)}
        x={japaneseLearningPosition?.x ?? 0}
        y={japaneseLearningPosition?.y ?? 0}
        onClick={handleOpenJapaneseLearning}
      />
      <div ref={translationHistoryAnchorRef} className='w-full flex justify-center'>
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
