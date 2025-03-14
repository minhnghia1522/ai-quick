import React from 'react';
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
}
const AppDialog = ({
  open,
  title,
  description,
  bodyContent,
  btnSubmitName = 'Save changes',
  btnCloseName = 'Close',
  onOpenChange,
  closeCallback,
  submitCallback
}: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div>{bodyContent}</div>
        <DialogFooter>
          <div className='flex justify-between w-full'>
            <Button
              onClick={() => {
                closeCallback?.();
              }}
            >
              {btnCloseName}
            </Button>
            <Button type='submit' onClick={submitCallback}>
              {btnSubmitName}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppDialog;
