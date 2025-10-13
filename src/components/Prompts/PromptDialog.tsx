'use client';

import { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/src/components/ui/dialog';
import { PromptForm, PromptFormProps, PromptFormValues } from '@/src/form-control/PromptForm';

export type PromptDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  defaultValues?: PromptFormProps['defaultValues'];
  excludeId?: string;
  onClose: () => void;
  onSubmit: (values: PromptFormValues) => void | Promise<void>;
  validateName: PromptFormProps['validateName'];
};

export function PromptDialog({
  open,
  mode,
  defaultValues,
  excludeId,
  onClose,
  onSubmit,
  validateName
}: PromptDialogProps) {
  const t = useTranslations('PromptManager');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dialogTitle = useMemo(() => (mode === 'create' ? t('dialog.titleCreate') : t('dialog.titleEdit')), [mode, t]);

  const dialogDescription = useMemo(
    () => (mode === 'create' ? t('dialog.descriptionCreate') : t('dialog.descriptionEdit')),
    [mode, t]
  );

  const handleSubmit = useCallback(
    async (values: PromptFormValues) => {
      let isSuccess = false;
      setIsSubmitting(true);

      try {
        await Promise.resolve(onSubmit(values));
        isSuccess = true;
      } catch (error) {
        console.error('Failed to submit prompt dialog form', error);
      } finally {
        setIsSubmitting(false);
        if (isSuccess) {
          onClose();
        }
      }
    },
    [onClose, onSubmit]
  );

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        <PromptForm
          mode={mode}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={onClose}
          validateName={validateName}
          excludeId={excludeId}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
