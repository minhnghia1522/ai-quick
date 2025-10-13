'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { LanguagePrompt } from '@/src/hooks/useLanguagePrompts';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/src/components/ui/card';

type PromptListProps = {
  prompts: LanguagePrompt[];
  onEdit: (prompt: LanguagePrompt) => void;
  onDelete: (prompt: LanguagePrompt) => void;
  onActivate: (prompt: LanguagePrompt) => void;
};

export function PromptList({ prompts, onEdit, onDelete, onActivate }: PromptListProps) {
  const t = useTranslations('PromptManager');

  const customPrompts = useMemo(() => prompts.filter((prompt) => !prompt.isDefault), [prompts]);

  if (customPrompts.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-12 text-center'>
        <Badge variant='outline'>{t('list.emptyBadge')}</Badge>
        <p className='max-w-md text-sm text-muted-foreground'>{t('list.empty')}</p>
      </div>
    );
  }

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {customPrompts.map((prompt) => {
        const isActive = prompt.isActive;

        return (
          <Card key={prompt.id}>
            <CardHeader className='gap-3'>
              <CardTitle className='flex items-center justify-between gap-3'>
                <span className='truncate' title={prompt.name}>
                  {prompt.name}
                </span>
                <Badge variant={isActive ? 'default' : 'outline'}>
                  {isActive ? t('list.badgeActive') : t('list.badgeInactive')}
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className='line-clamp-4 whitespace-pre-line text-sm text-muted-foreground'>{prompt.content}</p>
            </CardContent>

            <CardFooter className='flex flex-wrap gap-2'>
              <Button type='button' variant='secondary' size='sm' onClick={() => onEdit(prompt)}>
                {t('list.edit')}
              </Button>
              <Button type='button' variant='destructive' size='sm' onClick={() => onDelete(prompt)}>
                {t('list.delete')}
              </Button>
              {!isActive ? (
                <Button type='button' size='sm' onClick={() => onActivate(prompt)}>
                  {t('list.activate')}
                </Button>
              ) : null}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
