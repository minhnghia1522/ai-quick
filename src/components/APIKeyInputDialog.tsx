'use client';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import AppDialog, { AppDialogRefHandle } from './AppDialog';

const APIKeyInputDialog = forwardRef<AppDialogRefHandle>((_, ref) => {
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
      title='Settings'
      onOpenChange={(openChange) => setOpen(openChange)}
      submitCallback={submitCallback}
      closeCallback={closeCallback}
      bodyContent={
        <div className='grid gap-8'>
          <div>
            <div className='mb-2'>
              <Label>OpenAI API Key</Label>
              <div className='text-xs text-gray-600'>
                Your OpenAI API Key is stored locally and never sent to our servers
              </div>
            </div>
            <Input
              className='w-full'
              type='password'
              placeholder='OpenAI API Key'
              value={apiKey}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
          <div>
            <div className='mb-2'>
              <Label>Google Gemini API Key</Label>
              <div className='text-xs text-gray-600'>
                Gemini API key for using Google Gemini models. This key is optional.
              </div>
            </div>
            <Input
              className='w-full'
              type='password'
              placeholder='Google Gemini API Key'
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
