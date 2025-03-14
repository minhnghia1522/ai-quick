'use client';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import AppDialog, { AppDialogRefHandle } from './AppDialog';

const APIKeyInputDialog = forwardRef<AppDialogRefHandle>((_, ref) => {
  const [open, setOpen] = useState(false);

  const [apiKey, setApiKey] = useState<string>('');

  useEffect(() => {
    const apiKeyLocalStorage = localStorage.getItem('apiKey');

    if (apiKeyLocalStorage) {
      setApiKey(apiKeyLocalStorage);
    }
  }, []);

  const onChange = (value: string) => {
    setApiKey(value);
  };

  const submitCallback = () => {
    localStorage.setItem('apiKey', apiKey);
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
        <div className='grid gap-1'>
          <div>
            <Label>API Key</Label>
            <div className='text-xs text-gray-600'>Your API key is stored locally and never sent to our servers</div>
          </div>
          <Input
            className='w-full'
            type='password'
            placeholder='OpenAI API Key'
            value={apiKey}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      }
    />
  );
});

APIKeyInputDialog.displayName = 'APIKeyInputDialog';
export default APIKeyInputDialog;
