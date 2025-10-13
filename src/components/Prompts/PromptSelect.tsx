'use client';

import { useMemo } from 'react';
import type { LanguagePrompt } from '@/src/hooks/useLanguagePrompts';
import { useTranslations } from 'next-intl';
import { Badge } from '@/src/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';

type PromptSelectProps = {
  prompts: LanguagePrompt[];
  activePromptId: string;
  onSelect: (id: string) => void;
};

export function PromptSelect({ prompts, activePromptId, onSelect }: PromptSelectProps) {
  const t = useTranslations('PromptManager');

  const options = useMemo(
    () =>
      prompts.map((prompt) => ({
        id: prompt.id,
        label: prompt.name,
        isDefault: prompt.isDefault
      })),
    [prompts]
  );

  const activeOption = useMemo(
    () => options.find((option) => option.id === activePromptId) ?? options[0],
    [activePromptId, options]
  );

  return (
    <Select value={activeOption?.id} onValueChange={onSelect}>
      <SelectTrigger className='min-w-52'>
        <SelectValue aria-label={activeOption?.label} placeholder={t('select.placeholder')}>
          <span className='flex items-center gap-2'>
            <span className='truncate'>{activeOption?.label ?? t('select.placeholder')}</span>
            {activeOption ? (
              <Badge variant={activeOption.isDefault ? 'secondary' : 'outline'}>
                {activeOption.isDefault ? t('select.badgeDefault') : t('select.badgeCustom')}
              </Badge>
            ) : null}
          </span>
        </SelectValue>
      </SelectTrigger>

      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            <span className='flex items-center gap-2'>
              <span className='truncate'>{option.label}</span>
              <Badge variant={option.isDefault ? 'secondary' : 'outline'}>
                {option.isDefault ? t('select.badgeDefault') : t('select.badgeCustom')}
              </Badge>
              {option.id === activePromptId ? <Badge variant='default'>{t('select.badgeActive')}</Badge> : null}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
