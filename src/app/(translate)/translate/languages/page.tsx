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
import { isEmpty } from 'lodash';
import { PromptSelect } from '@/src/components/Prompts/PromptSelect';
import { PromptToolbar } from '@/src/components/Prompts/PromptToolbar';
import { PromptDialog } from '@/src/components/Prompts/PromptDialog';
import { PromptList } from '@/src/components/Prompts/PromptList';
import { ConfirmDialog } from '@/src/components/ConfirmDialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/src/components/ui/dialog';
import TranslationHistory, {
  ITranslationHistory,
  ITranslationHistoryRefHandle
} from '@/src/components/TranslationHistory';
import { useLanguagePrompts, LanguagePrompt } from '@/src/hooks/useLanguagePrompts';
import type { PromptFormValues } from '@/src/form-control/PromptForm';

const MAX_TEXT_LENGTH = 25000;
const TEXT_AREA_HEIGHT_DEFAULT = 128;

const Page = () => {
  const t = useTranslations();
  const promptT = useTranslations('PromptManager');

  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [inputLanguage, setInputLanguage] = useState(LANGUAGES.ja);
  const [outputLanguage, setOutputLanguage] = useState(LANGUAGES.vn);
  const [sharedHeight, setSharedHeight] = useState<number>(TEXT_AREA_HEIGHT_DEFAULT);
  const [isLoading, setIsLoading] = useState(false);

  const translationHistoryRef = useRef<ITranslationHistoryRefHandle | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    prompts,
    customPrompts,
    activePrompt,
    defaultPrompt,
    setActivePrompt,
    createPrompt,
    updatePrompt,
    deletePrompt,
    resetToDefault,
    isNameUnique
  } = useLanguagePrompts();

  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingPrompt, setEditingPrompt] = useState<LanguagePrompt | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [promptPendingDelete, setPromptPendingDelete] = useState<LanguagePrompt | null>(null);

  const hasCustomPrompts = customPrompts.length > 0;
  const activePromptId = activePrompt?.id ?? defaultPrompt.id ?? 'default';

  const handlePromptDialogClose = useCallback(() => {
    setIsPromptDialogOpen(false);
    setEditingPrompt(null);
    setDialogMode('create');
  }, []);

  const handleOpenCreatePrompt = useCallback(() => {
    setIsManageDialogOpen(false);
    setIsConfirmOpen(false);
    setPromptPendingDelete(null);
    setDialogMode('create');
    setEditingPrompt(null);
    setIsPromptDialogOpen(true);
  }, []);

  const handlePromptDialogSubmit = useCallback(
    async (values: PromptFormValues) => {
      if (dialogMode === 'create') {
        const previousActiveId = activePrompt?.id ?? defaultPrompt?.id ?? 'default';
        await createPrompt(values);
        setActivePrompt(previousActiveId);
        return;
      }

      if (editingPrompt) {
        await updatePrompt(editingPrompt.id, values);
      }
    },
    [activePrompt?.id, createPrompt, defaultPrompt?.id, dialogMode, editingPrompt, setActivePrompt, updatePrompt]
  );

  const handleManagePrompts = useCallback(() => {
    if (!hasCustomPrompts) return;
    setIsManageDialogOpen(true);
  }, [hasCustomPrompts]);

  const handleManageOpenChange = useCallback((nextOpen: boolean) => {
    setIsManageDialogOpen(nextOpen);
    if (!nextOpen) {
      setPromptPendingDelete(null);
      setIsConfirmOpen(false);
    }
  }, []);

  const handleEditPrompt = useCallback((prompt: LanguagePrompt) => {
    setIsManageDialogOpen(false);
    setIsConfirmOpen(false);
    setPromptPendingDelete(null);
    setDialogMode('edit');
    setEditingPrompt(prompt);
    setIsPromptDialogOpen(true);
  }, []);

  const handleDeletePromptRequest = useCallback((prompt: LanguagePrompt) => {
    setPromptPendingDelete(prompt);
    setIsConfirmOpen(true);
  }, []);

  const handleDeletePromptConfirm = useCallback(() => {
    if (!promptPendingDelete) return;
    deletePrompt(promptPendingDelete.id);
    setIsConfirmOpen(false);
    setPromptPendingDelete(null);
  }, [deletePrompt, promptPendingDelete]);

  const handleDeletePromptCancel = useCallback(() => {
    setIsConfirmOpen(false);
    setPromptPendingDelete(null);
  }, []);

  const handleActivatePrompt = useCallback(
    (prompt: LanguagePrompt) => {
      setActivePrompt(prompt.id);
    },
    [setActivePrompt]
  );

  const handleResetToDefault = useCallback(() => {
    resetToDefault();
  }, [resetToDefault]);

  const handleTranslate = useCallback(async () => {
    setTranslatedText('');
    if (!sourceText) {
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

    const promptPayload =
      activePrompt && !activePrompt.isDefault
        ? {
            system: activePrompt.content,
            prompt: [
              `Source language: ${inputLanguage}`,
              `Target language: ${outputLanguage}`,
              '',
              'Text:',
              sourceText
            ].join('\n')
          }
        : createPromptTranslateLanguage(inputLanguage, outputLanguage, sourceText);

    // TODO: Hỗ trợ placeholders động cho prompt tùy chỉnh (vd: {{sourceText}}, {{inputLanguage}}).
    try {
      const stream = await modelCallWithStreaming(promptPayload, abortController.signal);

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
  }, [activePrompt, inputLanguage, outputLanguage, sourceText, t]);

  useEffect(() => {
    const handler = setTimeout(() => {
      handleTranslate();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [sourceText, inputLanguage, outputLanguage, handleTranslate]);

  useEffect(() => {
    if (!isLoading && translatedText && sourceText) {
      const newEntry: ITranslationHistory = {
        id: new Date().toISOString(),
        sourceText,
        translatedText,
        inputLanguage,
        outputLanguage
        // TODO: Lưu metadata prompt (vd: promptName) khi UI hỗ trợ hiển thị.
      };
      translationHistoryRef.current?.add(newEntry);
    }
  }, [isLoading, sourceText, translatedText, inputLanguage, outputLanguage]);

  const handleInputLanguageChange = (language: string) => () => {
    setInputLanguage((prevValue) => {
      if (language === outputLanguage) {
        setOutputLanguage(prevValue);
      }
      return language;
    });
  };

  const handleOutLanguageChange = (language: string) => () => {
    setOutputLanguage((prevValue) => {
      if (inputLanguage === language) {
        setInputLanguage(prevValue);
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

  const pageBody = (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-4'>
        <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
          <PromptSelect prompts={prompts} activePromptId={activePromptId} onSelect={setActivePrompt} />
          <PromptToolbar
            onCreate={handleOpenCreatePrompt}
            onManage={handleManagePrompts}
            onResetToDefault={handleResetToDefault}
            isDefaultActive={Boolean(activePrompt?.isDefault)}
            hasCustomPrompts={hasCustomPrompts}
          />
        </div>

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
                className='hidden block xs:block md:hidden lg:block xl:block'
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
                className='w-full border-none outline-none bg-transparent focus:outline-none focus:ring-0 focus:ring-offset-0 focus:shadow-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
                placeholder={t('TranslatePage.sourcePlaceholder')}
                onChange={(event) => {
                  if (isEmpty(event.target.value)) {
                    handleClearSourceText();
                  } else {
                    setSourceText(event.target.value);
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
            <div>
              <div className='w-full flex rounded-md border border-input bg-gray-50 px-1 pt-1 pb-8'>
                <TextareaAutosize
                  className='w-full border-none outline-none disabled:cursor-auto disabled:bg-gray-50 disabled:opacity-100'
                  value={translatedText}
                  disabled
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
      </div>

      <div className='w-full flex justify-center'>
        <TranslationHistory ref={translationHistoryRef} />
      </div>
    </div>
  );

  return (
    <>
      <PageView
        title={{
          titleName: t('TranslatePage.title'),
          description: t('TranslatePage.description')
        }}
        body={pageBody}
      />

      <PromptDialog
        open={isPromptDialogOpen}
        mode={dialogMode}
        defaultValues={
          dialogMode === 'edit' && editingPrompt
            ? {
                name: editingPrompt.name,
                content: editingPrompt.content
              }
            : undefined
        }
        excludeId={dialogMode === 'edit' ? editingPrompt?.id : undefined}
        onClose={handlePromptDialogClose}
        onSubmit={handlePromptDialogSubmit}
        validateName={isNameUnique}
      />

      <Dialog open={isManageDialogOpen} onOpenChange={handleManageOpenChange}>
        <DialogContent className='sm:max-w-3xl'>
          <DialogHeader>
            <DialogTitle>{promptT('manager.title')}</DialogTitle>
            <DialogDescription>{promptT('manager.description')}</DialogDescription>
          </DialogHeader>

          <div className='flex flex-col gap-4'>
            <PromptList
              prompts={customPrompts}
              onEdit={handleEditPrompt}
              onDelete={handleDeletePromptRequest}
              onActivate={handleActivatePrompt}
            />
            <div className='flex justify-end'>
              <Button type='button' size='sm' onClick={handleOpenCreatePrompt}>
                {promptT('toolbar.create')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isConfirmOpen}
        title={promptT('confirm.deleteTitle')}
        description={promptT('confirm.deleteDescription', { name: promptPendingDelete?.name ?? '' })}
        confirmText={promptT('confirm.deleteConfirm')}
        cancelText={promptT('confirm.deleteCancel')}
        onConfirm={handleDeletePromptConfirm}
        onCancel={handleDeletePromptCancel}
      />
    </>
  );
};

export default Page;
