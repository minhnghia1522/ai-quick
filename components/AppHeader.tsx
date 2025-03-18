'use client';
import { SidebarToggle } from './SidebarToggle';
import { ModelSelector } from './ModelSelector';
import { useEffect, useRef } from 'react';
import APIKeyInputDialog from './APIKeyInputDialog';
import { AppDialogRefHandle } from './AppDialog';

export function AppHeader() {
  const dialogRef = useRef<AppDialogRefHandle>(null);
  const openDialog = () => {
    dialogRef.current?.open();
  };

  useEffect(() => {
    if (!localStorage.getItem('apiKey')) {
      openDialog();
    }
  });

  return (
    <header className='flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2'>
      <SidebarToggle />
      <ModelSelector className='order-1 md:order-2' />
      <APIKeyInputDialog ref={dialogRef} />
    </header>
  );
}
