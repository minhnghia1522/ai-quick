'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '../../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../../ui/dropdown-menu';
import { FilterIcon, ChevronDownIcon } from 'lucide-react';

interface ModelFilterProps {
  availableModels: string[];
  selectedModels: string[];
  onModelToggle: (modelName: string, checked: boolean) => void;
  onSelectAll: () => void;
}

export const ModelFilter: React.FC<ModelFilterProps> = ({
  availableModels,
  selectedModels,
  onModelToggle,
  onSelectAll
}) => {
  const t = useTranslations('UsageAnalytics');

  const getDisplayText = () => {
    if (selectedModels.length === 0) {
      return t('filters.allModels');
    } else if (selectedModels.length === 1) {
      return selectedModels[0];
    } else if (selectedModels.length === availableModels.length) {
      return t('filters.allModels');
    } else {
      return t('filters.modelsCount', { count: selectedModels.length });
    }
  };

  return (
    <div className='space-y-2 pt-4 border-t'>
      <div className='flex items-center gap-2'>
        <FilterIcon className='h-4 w-4 text-muted-foreground' />
        <span className='text-xs text-muted-foreground'>{t('filters.modelsLabel')}</span>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' className='w-full justify-between' disabled={availableModels.length === 0}>
            <span className='truncate text-sm'>{getDisplayText()}</span>
            <ChevronDownIcon className='h-4 w-4 opacity-50' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56' align='start'>
          <DropdownMenuLabel>{t('filters.selectModels')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {availableModels.length > 1 && (
            <>
              <DropdownMenuCheckboxItem
                checked={selectedModels.length === availableModels.length}
                onCheckedChange={onSelectAll}
                className='font-medium'
              >
                {t('filters.allModelsOption')}
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
            </>
          )}
          {availableModels.length === 0 ? (
            <div className='px-2 py-1.5 text-sm text-muted-foreground'>{t('filters.noModels')}</div>
          ) : (
            availableModels.map((model) => (
              <DropdownMenuCheckboxItem
                key={model}
                checked={selectedModels.includes(model)}
                onCheckedChange={(checked) => onModelToggle(model, checked)}
              >
                <span className='truncate text-xs'>{model}</span>
              </DropdownMenuCheckboxItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
