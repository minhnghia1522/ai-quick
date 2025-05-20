import React from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  onCancel
}) => {
  const t = useTranslations();
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title ?? t('ConfirmDialog.title')}</DialogTitle>
          <DialogDescription>{description ?? t('ConfirmDialog.description')}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={onCancel}>
            {cancelText ?? t('ConfirmDialog.cancelText')}
          </Button>
          <Button variant='destructive' onClick={onConfirm}>
            {confirmText ?? t('ConfirmDialog.confirmText')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
