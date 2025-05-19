import type { ComponentProps } from 'react';

import { type SidebarTrigger, useSidebar } from '@/src/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/components/ui/tooltip';
import { useTranslations } from 'next-intl';

import { Button } from './ui/button';
import { SidebarLeftIcon } from './icons';

export function SidebarToggle({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  className
}: ComponentProps<typeof SidebarTrigger>) {
  const { toggleSidebar } = useSidebar();
  const t = useTranslations();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button onClick={toggleSidebar} variant='outline' className='md:px-2 md:h-fit'>
          <SidebarLeftIcon size={16} />
        </Button>
      </TooltipTrigger>
      <TooltipContent align='start'>{t('SidebarToggle.tooltip')}</TooltipContent>
    </Tooltip>
  );
}
