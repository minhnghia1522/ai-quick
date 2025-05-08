'use client';
import { cn } from '@/src/lib/utils';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/src/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/src/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/src/components/ui/dialog';
import { CheckCircleFillIcon, ChevronDownIcon } from './icons';
import {
  geminiModels,
  ModelAI,
  openAIModels,
  STORAGE_KEY_OPENAI_API_KEY,
  STORAGE_KEY_GEMINI_API_KEY,
  STORAGE_KEY_MODEL
} from '@/src/types/model';

export function ModelSelector({ className }: {} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const [model, setModel] = useState<ModelAI | undefined>(undefined);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingModel, setPendingModel] = useState<ModelAI | null>(null);
  const [models, setModels] = useState<ModelAI[]>([]);

  const selectedModel = useMemo(() => models.find((chatModel) => chatModel.id === model?.id), [models, model]);

  useEffect(() => {
    const modelList = [];
    if (localStorage.getItem(STORAGE_KEY_OPENAI_API_KEY)) {
      modelList.push(...openAIModels);
    }
    if (localStorage.getItem(STORAGE_KEY_GEMINI_API_KEY)) {
      modelList.push(...geminiModels);
    }
    setModels(modelList);

    const modelLocalStorage = localStorage.getItem(STORAGE_KEY_MODEL);
    if (modelLocalStorage !== null && modelLocalStorage !== 'undefined') {
      setModel(JSON.parse(modelLocalStorage));
    } else if (modelList.length > 0) {
      localStorage.setItem(STORAGE_KEY_MODEL, JSON.stringify(modelList[0]));
    }
  }, [setModel]);

  const handleModelChange = (chatModel: ModelAI) => {
    if (chatModel.model == model?.model) {
      setModel(chatModel);
      localStorage.setItem(STORAGE_KEY_MODEL, JSON.stringify(chatModel));
    } else {
      setPendingModel(chatModel);
      setConfirmDialogOpen(true);
      setOpen(false);
    }
  };

  const confirmModelChange = () => {
    if (pendingModel) {
      setModel(pendingModel);
      localStorage.setItem(STORAGE_KEY_MODEL, JSON.stringify(pendingModel));
      setConfirmDialogOpen(false);
      setPendingModel(null);
    }
  };

  const cancelModelChange = () => {
    setConfirmDialogOpen(false);
    setPendingModel(null);
  };

  return (
    <>
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
          {models.map((chatModel) => {
            const { id, name, description } = chatModel;

            return (
              <DropdownMenuItem
                data-testid={`model-selector-item-${id}`}
                key={name}
                onSelect={() => handleModelChange(chatModel)}
                data-active={id === model?.id}
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
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className='sm:max-w-2xl max-w-[1200px] px-4 sm:px-6'>
          <DialogHeader>
            <DialogTitle className='text-2xl'>Change AI Model</DialogTitle>
            <DialogDescription className='text-base'>
              You are about to switch from {model?.name} to {pendingModel?.name}. Please review the pricing and model
              characteristics carefully.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-6'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='bg-muted p-4 rounded-lg border'>
                <h3 className='text-base sm:text-lg font-semibold text-primary mb-3'>Current Model</h3>
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm sm:text-base'>
                    <span className='font-medium'>Model Name:</span>
                    <span className='text-muted-foreground'>{model?.name}</span>
                  </div>
                  <div className='flex justify-between text-sm sm:text-base'>
                    <span className='font-medium'>Input Price:</span>
                    <span className='text-muted-foreground'>${model?.priceInput?.toFixed(2)} / 1M tokens</span>
                  </div>
                  <div className='flex justify-between text-sm sm:text-base'>
                    <span className='font-medium'>Output Price:</span>
                    <span className='text-muted-foreground'>${model?.priceOutput?.toFixed(2)} / 1M tokens</span>
                  </div>
                </div>
              </div>
              <div className='bg-muted p-4 rounded-lg border'>
                <h3 className='text-base sm:text-lg font-semibold text-primary mb-3'>New Model</h3>
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm sm:text-base'>
                    <span className='font-medium'>Model Name:</span>
                    <span className='text-muted-foreground'>{pendingModel?.name}</span>
                  </div>
                  <div className='flex justify-between text-sm sm:text-base'>
                    <span className='font-medium'>Input Price:</span>
                    <span
                      className={`text-muted-foreground ${
                        pendingModel?.priceInput && model?.priceInput && pendingModel.priceInput > model?.priceInput
                          ? 'font-bold text-red-500'
                          : ''
                      }`}
                    >
                      ${pendingModel?.priceInput?.toFixed(2)} / 1M tokens
                    </span>
                  </div>
                  <div className='flex justify-between text-sm sm:text-base'>
                    <span className='font-medium'>Output Price:</span>
                    <span
                      className={`text-muted-foreground ${
                        pendingModel?.priceOutput && model?.priceOutput && pendingModel.priceOutput > model?.priceOutput
                          ? 'font-bold text-red-500'
                          : ''
                      }`}
                    >
                      ${pendingModel?.priceOutput?.toFixed(2)} / 1M tokens
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className='mt-4'>
            <Button variant='outline' onClick={cancelModelChange}>
              Keep Current Model
            </Button>
            <Button onClick={confirmModelChange} variant='default'>
              Switch to {pendingModel?.name}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
