'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { PlusIcon, Settings2Icon, RotateCcwIcon } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

type PromptToolbarProps = {
  onCreate: () => void;
  onManage: () => void;
  onResetToDefault: () => void;
  isDefaultActive: boolean;
  hasCustomPrompts: boolean;
};

export function PromptToolbar({
  onCreate,
  onManage,
  onResetToDefault,
  isDefaultActive,
  hasCustomPrompts
}: PromptToolbarProps) {
  const t = useTranslations('PromptManager');

  const canReset = useMemo(() => hasCustomPrompts && !isDefaultActive, [hasCustomPrompts, isDefaultActive]);

  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Button type='button' onClick={onCreate} size='sm'>
        <PlusIcon className='size-4' aria-hidden />
        <span>{t('toolbar.create')}</span>
      </Button>

      <Button type='button' variant='outline' onClick={onManage} size='sm' disabled={!hasCustomPrompts}>
        <Settings2Icon className='size-4' aria-hidden />
        <span>{t('toolbar.manage')}</span>
      </Button>

      {canReset ? (
        <Button type='button' variant='ghost' onClick={onResetToDefault} size='sm'>
          <RotateCcwIcon className='size-4' aria-hidden />
          <span>{t('toolbar.useDefault')}</span>
        </Button>
      ) : null}
    </div>
  );
}
