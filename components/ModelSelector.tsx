'use client';
import { cn } from '@/lib/utils';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { CheckCircleFillIcon, ChevronDownIcon } from './icons';
import { OpenAIModel, openAIModels, STORAGE_KEY_MODEL } from '@/types/types';

export function ModelSelector({ className }: {} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const [model, setModel] = useState<OpenAIModel>(openAIModels[0]);

  const selectedModel = useMemo(() => openAIModels.find((chatModel) => chatModel.id === model.id), [model]);

  useEffect(() => {
    const modelLocalStorage = localStorage.getItem(STORAGE_KEY_MODEL);
    if (modelLocalStorage) {
      setModel(JSON.parse(modelLocalStorage));
    } else {
      localStorage.setItem(STORAGE_KEY_MODEL, JSON.stringify(openAIModels[0]));
    }
  }, [setModel]);

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
          const { id, name, description } = chatModel;

          return (
            <DropdownMenuItem
              data-testid={`model-selector-item-${id}`}
              key={id}
              onSelect={() => {
                setModel(chatModel);
                localStorage.setItem(STORAGE_KEY_MODEL, JSON.stringify(chatModel));
                setOpen(false);
              }}
              data-active={id === model.id}
              asChild
            >
              <button type='button' className='gap-4 group/item flex flex-row justify-between items-center w-full'>
                <div className='flex flex-col gap-1 items-start'>
                  <div>{name}</div>
                  <div className='text-xs text-muted-foreground'>{description}</div>
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
