'use client';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from './ui/input';
import { Label } from './ui/label';
import AppDialog, { AppDialogRefHandle } from './AppDialog';

const APIKeyInputDialog = forwardRef<AppDialogRefHandle>((_, ref) => {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  const [apiKey, setApiKey] = useState<string>('');
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');

  useEffect(() => {
    const apiKeyLocalStorage = localStorage.getItem('apiKey');
    const geminiApiKeyLocalStorage = localStorage.getItem('geminiApiKey');

    if (apiKeyLocalStorage) {
      setApiKey(apiKeyLocalStorage);
    }
    if (geminiApiKeyLocalStorage) {
      setGeminiApiKey(geminiApiKeyLocalStorage);
    }
  }, []);

  const onChange = (value: string) => {
    setApiKey(value);
  };

  const onChangeGemini = (value: string) => {
    setGeminiApiKey(value);
  };

  const submitCallback = () => {
    localStorage.setItem('apiKey', apiKey);
    localStorage.setItem('geminiApiKey', geminiApiKey);
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
      onOpenChange={(openChange) => setOpen(openChange)}
      submitCallback={submitCallback}
      closeCallback={closeCallback}
      bodyContent={
        <div className='grid gap-8'>
          <div>
            <div className='mb-2'>
              <Label>{t('Dialog.openaiApiKey')}</Label>
              <div className='text-xs text-gray-600'>{t('Dialog.openaiApiKeyDesc')}</div>
            </div>
            <Input
              className='w-full'
              type='password'
              placeholder={t('Dialog.openaiApiKey')}
              value={apiKey}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
          <div>
            <div className='mb-2'>
              <Label>{t('Dialog.geminiApiKey')}</Label>
              <div className='text-xs text-gray-600'>{t('Dialog.geminiApiKeyDesc')}</div>
            </div>
            <Input
              className='w-full'
              type='password'
              placeholder={t('Dialog.geminiApiKey')}
              value={geminiApiKey}
              onChange={(e) => onChangeGemini(e.target.value)}
            />
          </div>
        </div>
      }
    />
  );
});

APIKeyInputDialog.displayName = 'APIKeyInputDialog';
export default APIKeyInputDialog;
