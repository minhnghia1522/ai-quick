'use client';
import React, { useRef } from 'react';
import { Button } from './ui/button';
import { Settings } from 'lucide-react';
import APIKeyInputDialog from './APIKeyInputDialog';
import { AppDialogRefHandle } from './AppDialog';

const ButtonSetting = () => {
  const dialogRef = useRef<AppDialogRefHandle>(null);
  const openDialog = () => {
    dialogRef.current?.open();
  };
  return (
    <>
      <Button variant='outline' onClick={openDialog} className='ml-auto'>
        <Settings />
      </Button>
      <APIKeyInputDialog ref={dialogRef} />
    </>
  );
};

export default ButtonSetting;
