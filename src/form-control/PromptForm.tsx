'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';

export type PromptFormValues = {
  name: string;
  content: string;
};

export type PromptFormProps = {
  mode: 'create' | 'edit';
  defaultValues?: PromptFormValues;
  onSubmit: (values: PromptFormValues) => void | Promise<void>;
  onCancel: () => void;
  validateName: (name: string, excludeId?: string) => boolean;
  excludeId?: string;
  isSubmitting?: boolean;
};

type PromptFormErrors = Partial<Record<keyof PromptFormValues, string>>;

// TODO: Viết kiểm thử cho PromptForm khi hạ tầng testing sẵn sàng.

export function PromptForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  validateName,
  excludeId,
  isSubmitting
}: PromptFormProps) {
  const t = useTranslations('PromptManager');

  const [name, setName] = useState(defaultValues?.name ?? '');
  const [content, setContent] = useState(defaultValues?.content ?? '');
  const [errors, setErrors] = useState<PromptFormErrors>({});
  const [internalSubmitting, setInternalSubmitting] = useState(false);

  useEffect(() => {
    if (!defaultValues) {
      setName('');
      setContent('');
      return;
    }

    setName(defaultValues.name);
    setContent(defaultValues.content);
  }, [defaultValues]);

  const submitting = isSubmitting ?? internalSubmitting;

  const resetErrors = useCallback(() => {
    setErrors({});
  }, []);

  const validate = useCallback(
    (values: PromptFormValues): PromptFormErrors => {
      const nextErrors: PromptFormErrors = {};
      const trimmedName = values.name.trim();
      const trimmedContent = values.content.trim();

      if (trimmedName.length === 0) {
        nextErrors.name = t('form.nameRequired');
      } else if (trimmedName.length > 50) {
        nextErrors.name = t('form.nameMaxLength', { max: 50 });
      } else if (!validateName(trimmedName, excludeId)) {
        nextErrors.name = t('form.nameDuplicate');
      }

      if (trimmedContent.length === 0) {
        nextErrors.content = t('form.contentRequired');
      }

      return nextErrors;
    },
    [excludeId, t, validateName]
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (submitting) return;

      const values: PromptFormValues = {
        name: name.trim(),
        content: content.trim()
      };

      const nextErrors = validate(values);
      if (Object.keys(nextErrors).length > 0) {
        setErrors(nextErrors);
        return;
      }

      setErrors({});
      setInternalSubmitting(true);

      try {
        await Promise.resolve(onSubmit(values));
      } finally {
        setInternalSubmitting(false);
      }
    },
    [content, name, onSubmit, submitting, validate]
  );

  const submitLabel = useMemo(() => (mode === 'create' ? t('form.submitCreate') : t('form.submitEdit')), [mode, t]);

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
      <div className='flex flex-col gap-2'>
        <Label htmlFor='prompt-name'>{t('form.nameLabel')}</Label>
        <Input
          id='prompt-name'
          value={name}
          maxLength={50}
          placeholder={t('form.namePlaceholder')}
          onChange={(event) => {
            if (errors.name) {
              resetErrors();
            }
            setName(event.target.value);
          }}
          aria-invalid={Boolean(errors.name)}
          disabled={submitting}
        />
        {errors.name ? (
          <p className='text-sm text-destructive' role='alert'>
            {errors.name}
          </p>
        ) : null}
      </div>

      <div className='flex flex-col gap-2'>
        <Label htmlFor='prompt-content'>{t('form.contentLabel')}</Label>
        <Textarea
          id='prompt-content'
          value={content}
          placeholder={t('form.contentPlaceholder')}
          onChange={(event) => {
            if (errors.content) {
              resetErrors();
            }
            setContent(event.target.value);
          }}
          aria-invalid={Boolean(errors.content)}
          disabled={submitting}
          rows={8}
        />
        {errors.content ? (
          <p className='text-sm text-destructive' role='alert'>
            {errors.content}
          </p>
        ) : null}
      </div>

      <div className='flex justify-end gap-3 pt-2'>
        <Button type='button' variant='outline' onClick={onCancel} disabled={submitting}>
          {t('form.cancel')}
        </Button>
        <Button type='submit' disabled={submitting}>
          {submitting ? t('form.submitting') : submitLabel}
        </Button>
      </div>
    </form>
  );
}
