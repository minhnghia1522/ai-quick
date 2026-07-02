'use client';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import isEmpty from 'lodash/isEmpty';
import { useTranslations } from 'next-intl';
import { KeyRound } from 'lucide-react';
import Link from 'next/link';
import AppDialog, { AppDialogRefHandle } from './AppDialog';
import { useAppStore } from '../store';
import PasswordField from './PasswordField';
import { STORAGE_KEY_AIQUICK_API_KEY, STORAGE_KEY_GEMINI_API_KEY, STORAGE_KEY_OPENAI_API_KEY } from '@/src/types/model';

const APIKeyInputDialog = forwardRef<AppDialogRefHandle>((_, ref) => {
  const t = useTranslations();
  const { setIsAIQuickApiKey, setIsGeminiApiKey, setIsOpenApiKey } = useAppStore();

  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [aiQuickApiKey, setAIQuickApiKey] = useState<string>('');

  useEffect(() => {
    if (!open) {
      return;
    }
    const apiKeyLocalStorage = localStorage.getItem(STORAGE_KEY_OPENAI_API_KEY);
    const geminiApiKeyLocalStorage = localStorage.getItem(STORAGE_KEY_GEMINI_API_KEY);
    const aiQuickApiKeyLocalStorage = localStorage.getItem(STORAGE_KEY_AIQUICK_API_KEY);

    if (apiKeyLocalStorage) {
      setApiKey(apiKeyLocalStorage);
      setIsOpenApiKey(true);
    }
    if (geminiApiKeyLocalStorage) {
      setGeminiApiKey(geminiApiKeyLocalStorage);
      setIsGeminiApiKey(true);
    }
    if (aiQuickApiKeyLocalStorage) {
      setAIQuickApiKey(aiQuickApiKeyLocalStorage);
      setIsAIQuickApiKey(true);
    }
  }, [open, setIsAIQuickApiKey, setIsGeminiApiKey, setIsOpenApiKey]);

  const submitCallback = () => {
    localStorage.setItem(STORAGE_KEY_OPENAI_API_KEY, apiKey);
    setIsOpenApiKey(!isEmpty(apiKey));
    localStorage.setItem(STORAGE_KEY_GEMINI_API_KEY, geminiApiKey);
    setIsGeminiApiKey(!isEmpty(geminiApiKey));
    localStorage.setItem(STORAGE_KEY_AIQUICK_API_KEY, aiQuickApiKey);
    setIsAIQuickApiKey(!isEmpty(aiQuickApiKey));
    setOpen(false);
  };

  const closeCallback = () => {
    setOpen(false);
  };

  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
    close: () => setOpen(false)
  }));

  return (
    <AppDialog
      open={open}
      title={t('Dialog.settings')}
      onOpenChange={setOpen}
      submitCallback={submitCallback}
      closeCallback={closeCallback}
      bodyContent={
        <div className='grid gap-6'>
          <p className='text-xs text-muted-foreground italic text-center p-2 bg-muted/50 rounded'>
            {t('Dialog.apiKeyStorageNotice')}
          </p>
          <div className='grid gap-3 p-4 border rounded-lg'>
            <div className='flex items-center gap-2'>
              <KeyRound className='w-5 h-5' />
              <h3 className='text-lg font-semibold'>{t('Dialog.openaiApiKey')}</h3>
            </div>
            <p className='text-sm text-muted-foreground'>{t('Dialog.openaiApiKeyDesc')}</p>
            <PasswordField value={apiKey} onChange={setApiKey} placeholder={t('Dialog.openaiApiKey')} />
            <p className='text-xs text-muted-foreground'>
              {t('Dialog.getApiKeyFrom')}{' '}
              <Link href='https://platform.openai.com/api-keys' target='_blank' className='text-blue-600 underline'>
                OpenAI Dashboard
              </Link>
              .
            </p>
          </div>
          <div className='grid gap-3 p-4 border rounded-lg'>
            <div className='flex items-center gap-2'>
              <KeyRound className='w-5 h-5' />
              <h3 className='text-lg font-semibold'>{t('Dialog.geminiApiKey')}</h3>
            </div>
            <p className='text-sm text-muted-foreground'>{t('Dialog.geminiApiKeyDesc')}</p>
            <PasswordField value={geminiApiKey} onChange={setGeminiApiKey} placeholder={t('Dialog.geminiApiKey')} />
            <p className='text-xs text-muted-foreground'>
              {t('Dialog.getApiKeyFrom')}{' '}
              <Link href='https://aistudio.google.com/app/apikey' target='_blank' className='text-blue-600 underline'>
                Google AI Studio
              </Link>
              .
            </p>
          </div>
          <div className='grid gap-3 p-4 border rounded-lg'>
            <div className='flex items-center gap-2'>
              <KeyRound className='w-5 h-5' />
              <h3 className='text-lg font-semibold'>{t('Dialog.aiQuickApiKey')}</h3>
            </div>
            <p className='text-sm text-muted-foreground'>{t('Dialog.aiQuickApiKeyDesc')}</p>
            <PasswordField value={aiQuickApiKey} onChange={setAIQuickApiKey} placeholder={t('Dialog.aiQuickApiKey')} />
          </div>
        </div>
      }
    />
  );
});

APIKeyInputDialog.displayName = 'APIKeyInputDialog';
export default APIKeyInputDialog;