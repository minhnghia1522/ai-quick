'use client';
import { SidebarToggle } from './SidebarToggle';
import { ModelSelector } from './ModelSelector';
import { useEffect, useRef, useState } from 'react';
import APIKeyInputDialog from './APIKeyInputDialog';
import { AppDialogRefHandle } from './AppDialog';
import { areAnyApiKeysAvailable } from '@/src/utils/getProvider';
import LocaleSwitcher from './LocaleSwitcher';
import { UsageCostBadge } from './UsageCostBadge';
import UsageAnalyticsDialog from './UsageAnalyticsDialog';

export function AppHeader() {
  const dialogRef = useRef<AppDialogRefHandle>(null);
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false);

  const openDialog = () => {
    dialogRef.current?.open();
  };

  const handleUsageCostClick = () => {
    setShowAnalyticsDialog(true);
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
      <div className='ml-auto flex items-center gap-2 order-2 md:order-3'>
        <UsageCostBadge onClick={handleUsageCostClick} />
        <LocaleSwitcher />
      </div>
      <APIKeyInputDialog ref={dialogRef} />
      <UsageAnalyticsDialog
        open={showAnalyticsDialog}
        onOpenChange={setShowAnalyticsDialog}
      />
    </header>
  );
}
