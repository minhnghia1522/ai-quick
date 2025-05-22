'use client';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import isEmpty from 'lodash/isEmpty';
import { useTranslations } from 'next-intl';
import { Label } from './ui/label';
import AppDialog, { AppDialogRefHandle } from './AppDialog';
import { useAppStore } from '../store';
import PasswordField from './PasswordField';

const APIKeyInputDialog = forwardRef<AppDialogRefHandle>((_, ref) => {
  const t = useTranslations();
  const { setIsGeminiApiKey, setIsOpenApiKey } = useAppStore();

  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');

  useEffect(() => {
    if (!open) {
      return;
    }
    const apiKeyLocalStorage = localStorage.getItem('apiKey');
    const geminiApiKeyLocalStorage = localStorage.getItem('geminiApiKey');

    if (apiKeyLocalStorage) {
      setApiKey(apiKeyLocalStorage);
      setIsOpenApiKey(true);
    }
    if (geminiApiKeyLocalStorage) {
      setGeminiApiKey(geminiApiKeyLocalStorage);
      setIsGeminiApiKey(true);
    }
  }, [open, setIsGeminiApiKey, setIsOpenApiKey]);

  const onChangeOpenApiKey = (value: string) => {
    setApiKey(value);
  };

  const onChangeGeminiKey = (value: string) => {
    setGeminiApiKey(value);
  };

  const submitCallback = () => {
    localStorage.setItem('apiKey', apiKey);
    setIsOpenApiKey(isEmpty(apiKey));
    localStorage.setItem('geminiApiKey', geminiApiKey);
    setIsGeminiApiKey(isEmpty(geminiApiKey));
    setOpen(false);
  };

  const closeCallback = () => {
    setOpen(false);
    setApiKey('');
    setGeminiApiKey('');
  };

  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
    close: () => setOpen(false)
  }));

  return (
    <AppDialog
      open={open}
      title={t('Dialog.settings')}
      onOpenChange={() => closeCallback()}
      submitCallback={submitCallback}
      closeCallback={closeCallback}
      bodyContent={
        <div className='grid gap-8'>
          <div>
            <div className='mb-2'>
              <Label>{t('Dialog.openaiApiKey')}</Label>
              <div className='text-xs text-gray-600'>{t('Dialog.openaiApiKeyDesc')}</div>
            </div>
            <PasswordField value={apiKey} onChange={onChangeOpenApiKey} placeholder={t('Dialog.openaiApiKey')} />
          </div>
          <div>
            <div className='mb-2'>
              <Label>{t('Dialog.geminiApiKey')}</Label>
              <div className='text-xs text-gray-600'>{t('Dialog.geminiApiKeyDesc')}</div>
            </div>
            <PasswordField value={geminiApiKey} onChange={onChangeGeminiKey} placeholder={t('Dialog.geminiApiKey')} />
          </div>
        </div>
      }
    />
  );
});

APIKeyInputDialog.displayName = 'APIKeyInputDialog';
export default APIKeyInputDialog;
