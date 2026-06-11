import MarkdownPreview from '@/src/components/MarkdownPreview';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/src/components/ui/dialog';
import { japaneseLearningStore } from '@/src/lib/database/japaneseLearningDB';
import { createPromptLanguageLearning } from '@/src/prompt/languageTranslatePrompt';
import { modelCallWithStreaming } from '@/src/service/translateService';
import { areAnyApiKeysAvailable } from '@/src/utils/getProvider';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface JapaneseLearningDialogProps {
  open: boolean;
  selectedText: string;
  onOpenChange: (open: boolean) => void;
}

const dialogContentClassName = [
  'grid h-[85vh] w-[calc(100vw-1rem)] max-w-[1100px] min-w-0 overflow-hidden',
  'grid-rows-[auto_auto_minmax(0,1fr)] gap-3 p-4 sm:w-[92vw] sm:max-w-[1100px]'
].join(' ');

const selectedTextClassName = [
  'max-h-36 overflow-auto whitespace-pre-wrap break-words rounded-md border bg-muted/40 p-3',
  'font-sans text-sm leading-6'
].join(' ');

const JapaneseLearningDialog = ({ open, selectedText, onOpenChange }: JapaneseLearningDialogProps) => {
  const t = useTranslations();
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFromCache, setIsFromCache] = useState(false);

  useEffect(() => {
    if (!open || !selectedText.trim()) return;

    const abortController = new AbortController();

    const loadLearningContent = async () => {
      setContent('');
      setError('');
      setIsLoading(true);
      setIsFromCache(false);

      try {
        const cachedEntry = await japaneseLearningStore.getEntry(selectedText);

        if (cachedEntry) {
          setContent(cachedEntry.content);
          setIsFromCache(true);
          setIsLoading(false);
          return;
        }
      } catch (cacheError) {
        console.warn('Failed to load Japanese learning cache:', cacheError);
      }

      if (!areAnyApiKeysAvailable()) {
        toast.error(t('TranslatePage.apiKeyError'));
        setError(t('TranslatePage.japaneseLearningApiKeyRequired'));
        setIsLoading(false);
        return;
      }

      try {
        const promptConfig = createPromptLanguageLearning(selectedText);
        const stream = await modelCallWithStreaming(
          {
            system: promptConfig.system,
            prompt: promptConfig.prompt,
            taskType: 'language-learning'
          },
          abortController.signal
        );
        let streamedContent = '';

        for await (const textPart of stream.textStream) {
          streamedContent += textPart;
          setContent((prevData) => prevData + textPart);
        }

        if (streamedContent.trim()) {
          try {
            await japaneseLearningStore.saveEntry(selectedText, streamedContent);
          } catch (cacheError) {
            console.warn('Failed to save Japanese learning cache:', cacheError);
          }
        }
      } catch (loadError) {
        if (loadError instanceof Error) {
          if (['AbortError', 'aborted'].some((term) => loadError.message.includes(term))) return;
          setError(loadError.message);
          toast.error(loadError.message);
        } else {
          setError(t('TranslatePage.unexpectedError'));
          toast.error(t('TranslatePage.unexpectedError'));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadLearningContent();

    return () => {
      abortController.abort();
    };
  }, [open, selectedText, t]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={dialogContentClassName}>
        <DialogHeader className='pr-8'>
          <DialogTitle>{t('TranslatePage.japaneseLearningDialogTitle')}</DialogTitle>
          <DialogDescription>{t('TranslatePage.japaneseLearningDialogDescription')}</DialogDescription>
        </DialogHeader>
        <div className={selectedTextClassName}>{selectedText}</div>
        <div
          className='min-h-0 overflow-auto rounded-md border bg-gray-50 p-4'
          data-japanese-learning-selection-root='true'
        >
          {isLoading && !content ? (
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Loader2 className='h-4 w-4 animate-spin' />
              {t('TranslatePage.japaneseLearningLoading')}
            </div>
          ) : undefined}
          {error ? <div className='text-sm text-destructive'>{error}</div> : undefined}
          {isFromCache ? (
            <div className='mb-3 text-xs text-muted-foreground'>{t('TranslatePage.japaneseLearningLoadedFromCache')}</div>
          ) : undefined}
          {content ? <MarkdownPreview content={content} useParentHorizontalScroll /> : undefined}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JapaneseLearningDialog;
