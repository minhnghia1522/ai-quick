'use client';
import { SidebarToggle } from './SidebarToggle';
import { ModelSelector } from './ModelSelector';
import { useEffect, useRef } from 'react';
import APIKeyInputDialog from './APIKeyInputDialog';
import { AppDialogRefHandle } from './AppDialog';
import { areAnyApiKeysAvailable } from '@/src/utils/getProvider';
import LocaleSwitcher from './LocaleSwitcher';
import UsageCostBadge from './UsageCostBadge';

export function AppHeader() {
  const dialogRef = useRef<AppDialogRefHandle>(null);
  const openDialog = () => {
    dialogRef.current?.open();
  };

  useEffect(() => {
    if (!areAnyApiKeysAvailable()) {
      openDialog();
    }
  }, []);

  return (
    <header className='flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2'>
      <SidebarToggle />
      <ModelSelector className='order-1 md:order-2' />
      <UsageCostBadge className='order-2 md:order-3' />
      <LocaleSwitcher className='ml-auto order-3 md:order-4' />
      <APIKeyInputDialog ref={dialogRef} />
    </header>
  );
}
