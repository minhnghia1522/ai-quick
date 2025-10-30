import React from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';

export interface AppDialogRefHandle {
  open: () => void;
  close: () => void;
}

interface Props {
  open: boolean;
  title: string;
  description?: string;
  bodyContent: React.ReactNode;
  btnSubmitName?: string;
  btnCloseName?: string;
  onOpenChange(open: boolean): void;
  submitCallback?(): void;
  closeCallback?(): void;
  contentClassName?: string;
  hideSubmitButton?: boolean;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
}
const AppDialog = ({
  open,
  title,
  description,
  bodyContent,
  btnSubmitName,
  btnCloseName,
  onOpenChange,
  closeCallback,
  submitCallback,
  contentClassName,
  hideSubmitButton = false,
  headerClassName,
  bodyClassName,
  footerClassName
}: Props) => {
  const t = useTranslations();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={contentClassName}>
        <DialogHeader className={headerClassName}>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className={bodyClassName}>{bodyContent}</div>
        <DialogFooter className={footerClassName}>
          <div className='flex justify-between w-full'>
            <Button
              onClick={() => {
                closeCallback?.();
              }}
            >
              {btnCloseName ?? t('Dialog.close')}
            </Button>
            {!hideSubmitButton && (
              <Button type='submit' onClick={submitCallback}>
                {btnSubmitName ?? t('Dialog.saveChanges')}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppDialog;
