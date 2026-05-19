import MarkdownPreview from '@/src/components/MarkdownPreview';
import { Button } from '@/src/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/src/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Copy, FileText, Type } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { TranslationViewMode } from './translationHelpers';

interface ExpandedOutputDialogProps {
  open: boolean;
  translatedText: string;
  plainTranslatedText: string;
  translationViewMode: TranslationViewMode;
  onOpenChange: (open: boolean) => void;
  onTranslationViewModeChange: (mode: TranslationViewMode) => void;
  onCopyTranslation: (format?: TranslationViewMode) => void;
}

const dialogContentClassName = [
  'grid h-[85vh] w-[calc(100vw-2rem)] max-w-[1200px]',
  'grid-rows-[auto_minmax(0,1fr)] gap-3 p-4 sm:max-w-[1200px]'
].join(' ');

const expandedTextClassName = [
  'h-full overflow-auto whitespace-pre-wrap break-words rounded-md border bg-gray-50 p-4',
  'font-sans text-sm leading-6'
].join(' ');

const ExpandedOutputDialog = ({
  open,
  translatedText,
  plainTranslatedText,
  translationViewMode,
  onOpenChange,
  onTranslationViewModeChange,
  onCopyTranslation
}: ExpandedOutputDialogProps) => {
  const t = useTranslations();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={dialogContentClassName}>
        <DialogHeader className='pr-8'>
          <DialogTitle>{t('TranslatePage.expandedOutputTitle')}</DialogTitle>
          <DialogDescription>{t('TranslatePage.expandedOutputDescription')}</DialogDescription>
        </DialogHeader>
        <Tabs
          value={translationViewMode}
          onValueChange={(value) => onTranslationViewModeChange(value as TranslationViewMode)}
          className='grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-3'
        >
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <TabsList className='shadow-sm'>
              <TabsTrigger value='text' aria-label={t('TranslatePage.textView')}>
                <Type className='mr-2 h-4 w-4' />
                {t('TranslatePage.textView')}
              </TabsTrigger>
              <TabsTrigger value='markdown' aria-label={t('TranslatePage.markdownView')}>
                <FileText className='mr-2 h-4 w-4' />
                {t('TranslatePage.markdownView')}
              </TabsTrigger>
            </TabsList>
            <div className='flex flex-wrap items-center justify-end gap-2'>
              <Button
                variant='outline'
                size='sm'
                aria-label={t('TranslatePage.copyTranslation')}
                onClick={() => onCopyTranslation('text')}
              >
                <Copy className='mr-2 h-4 w-4' />
                {t('TranslatePage.copyAsText')}
              </Button>
              <Button
                variant='outline'
                size='sm'
                aria-label={t('TranslatePage.copyAsMarkdown')}
                onClick={() => onCopyTranslation('markdown')}
              >
                <Copy className='mr-2 h-4 w-4' />
                {t('TranslatePage.copyAsMarkdown')}
              </Button>
            </div>
          </div>
          <TabsContent value='text' className='m-0 min-h-0'>
            <pre className={expandedTextClassName}>{plainTranslatedText}</pre>
          </TabsContent>
          <TabsContent value='markdown' className='m-0 min-h-0'>
            <div className='h-full overflow-auto rounded-md border bg-gray-50 p-4'>
              <MarkdownPreview content={translatedText} />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ExpandedOutputDialog;
