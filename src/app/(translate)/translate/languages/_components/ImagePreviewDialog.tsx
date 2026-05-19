import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/src/components/ui/dialog';
import { useTranslations } from 'next-intl';

interface ImagePreviewDialogProps {
  open: boolean;
  image: File | null;
  imagePreview: string;
  onOpenChange: (open: boolean) => void;
}

const ImagePreviewDialog = ({ open, image, imagePreview, onOpenChange }: ImagePreviewDialogProps) => {
  const t = useTranslations();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex w-[min(96vw,1280px)] max-w-[calc(100vw-2rem)] flex-col overflow-hidden p-4 sm:max-w-[min(96vw,1280px)] sm:p-6'>
        <DialogHeader className='pr-8'>
          <DialogTitle>{t('TranslatePage.previewImage')}</DialogTitle>
          <DialogDescription>
            {image
              ? t('TranslatePage.previewImageDescription', { name: image.name })
              : t('TranslatePage.previewImage')}
          </DialogDescription>
        </DialogHeader>
        {image && imagePreview ? (
          <div className='flex h-[min(72vh,720px)] w-full items-center justify-center overflow-hidden rounded border bg-gray-50 p-2'>
            <img
              src={imagePreview}
              alt={image.name}
              className='max-h-full max-w-full object-contain'
            />
          </div>
        ) : undefined}
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreviewDialog;
