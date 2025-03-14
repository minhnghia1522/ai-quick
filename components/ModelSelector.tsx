'use client';

import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

import { CheckCircleFillIcon, ChevronDownIcon } from './icons';
import { DEFAULT_CHAT_MODEL, openAIModels } from '@/types/types';

export function ModelSelector({ className }: {} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const [modelId, setModelId] = useState(DEFAULT_CHAT_MODEL);

  const selectedModel = useMemo(() => openAIModels.find((chatModel) => chatModel.id === modelId), [modelId]);

  useEffect(() => {
    const modelLocalStorage = localStorage.getItem('modelId');
    if (modelLocalStorage) {
      setModelId(modelLocalStorage);
    } else {
      localStorage.setItem('modelId', DEFAULT_CHAT_MODEL);
    }
  }, [setModelId]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        className={cn('w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground', className)}
      >
        <Button data-testid='model-selector' variant='outline' className='md:px-2 md:h-[34px]'>
          {selectedModel?.name}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='min-w-[300px]'>
        {openAIModels.map((chatModel) => {
          const { id } = chatModel;

          return (
            <DropdownMenuItem
              data-testid={`model-selector-item-${id}`}
              key={id}
              onSelect={() => {
                setModelId(id);
                setOpen(false);
              }}
              data-active={id === modelId}
              asChild
            >
              <button type='button' className='gap-4 group/item flex flex-row justify-between items-center w-full'>
                <div className='flex flex-col gap-1 items-start'>
                  <div>{chatModel.name}</div>
                  <div className='text-xs text-muted-foreground'>{chatModel.description}</div>
                </div>

                <div className='text-foreground dark:text-foreground opacity-0 group-data-[active=true]/item:opacity-100'>
                  <CheckCircleFillIcon />
                </div>
              </button>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
