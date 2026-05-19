import TextareaAutosize from '@/src/components/input/TextareaAutosize';
import { Button } from '@/src/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/components/ui/tooltip';
import { LANGUAGES } from '@/src/types/model';
import { ImagePlus, Maximize2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, type ClipboardEvent, type RefObject } from 'react';
import ImagePreviewDialog from './ImagePreviewDialog';
import LanguageToggleGroup from './LanguageToggleGroup';
import { ACCEPTED_IMAGE_TYPES, MAX_TEXT_LENGTH, formatFileSize } from './translationHelpers';
import type { SourceMode } from './translationHelpers';

interface SourceLanguagePanelProps {
  sourceText: string;
  sourceMode: SourceMode;
  sourceImage: File | null;
  sourceImagePreview: string;
  reusedImageSourceName: string;
  inputLanguage: string;
  sourceHeight: number;
  imageInputRef: RefObject<HTMLInputElement | null>;
  sourceTextareaRef: RefObject<HTMLTextAreaElement | null>;
  onInputLanguageChange: (language: string) => void;
  onSourceTextInput: (value: string) => void;
  onClearSource: () => void;
  onSelectImage: (file: File) => void;
  onSourceHeightChange: (height: number) => void;
}

const sourceTextareaClassName = [
  'w-full border-none outline-none bg-transparent',
  'focus:outline-none focus:ring-0 focus:ring-offset-0 focus:shadow-none',
  'focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
].join(' ');

const reusedImageClassName = [
  'pointer-events-none absolute inset-1 bottom-8 z-10 flex items-center justify-center rounded',
  'bg-gray-50 px-12 text-sm text-gray-600'
].join(' ');

const sourceMetaClassName = [
  'absolute bottom-0 right-3 z-20 max-w-[calc(100%-3.5rem)] truncate bg-white px-1',
  'text-right text-gray-500'
].join(' ');

const SourceLanguagePanel = ({
  sourceText,
  sourceMode,
  sourceImage,
  sourceImagePreview,
  reusedImageSourceName,
  inputLanguage,
  sourceHeight,
  imageInputRef,
  sourceTextareaRef,
  onInputLanguageChange,
  onSourceTextInput,
  onClearSource,
  onSelectImage,
  onSourceHeightChange
}: SourceLanguagePanelProps) => {
  const t = useTranslations();
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);

  const sourceLanguageOptions = [
    { value: LANGUAGES.ja, label: t('TranslatePage.japanese') },
    {
      value: LANGUAGES.en,
      label: t('TranslatePage.english'),
      className: 'hidden block xs:block md:hidden lg:block xl:block'
    },
    { value: LANGUAGES.vn, label: t('TranslatePage.vietnamese') },
    { value: LANGUAGES.natural, label: t('TranslatePage.detectLanguage') }
  ];

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const imageItem = Array.from(e.clipboardData?.items ?? []).find((item) => item.type.startsWith('image/'));

    if (imageItem) {
      const file = imageItem.getAsFile();
      if (file) {
        e.preventDefault();
        onSelectImage(file);
      }
      return;
    }

    const text = e.clipboardData?.getData('text') ?? '';
    const trimmed = text.trim();
    if (trimmed === text) return;

    e.preventDefault();
    const el = sourceTextareaRef.current;
    if (!el) return;

    const { selectionStart, selectionEnd } = el;
    const nextValue = sourceText.slice(0, selectionStart) + trimmed + sourceText.slice(selectionEnd);
    onSourceTextInput(nextValue);
    requestAnimationFrame(() => {
      const pos = selectionStart + trimmed.length;
      try {
        el.setSelectionRange(pos, pos);
      } catch {}
    });
  };

  return (
    <div className='flex flex-col gap-1 w-full md:w-1/2'>
      <LanguageToggleGroup
        selectedLanguage={inputLanguage}
        options={sourceLanguageOptions}
        onSelect={onInputLanguageChange}
      />
      <div className='relative w-full flex rounded-md border border-input bg-background px-1 pt-1 pb-8'>
        <input
          ref={imageInputRef}
          type='file'
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
          className='hidden'
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onSelectImage(file);
            }
          }}
        />
        <TextareaAutosize
          ref={sourceTextareaRef}
          value={sourceText}
          className={sourceTextareaClassName}
          placeholder={t('TranslatePage.sourcePlaceholder')}
          onChange={(e) => onSourceTextInput(e.target.value)}
          onPaste={handlePaste}
          forcedHeight={sourceHeight}
          onHeightChange={onSourceHeightChange}
        />
        {sourceImage && sourceImagePreview ? (
          <div className='pointer-events-none absolute inset-1 bottom-8 z-10 bg-background pr-10'>
            <div className='h-full w-full overflow-hidden rounded border bg-gray-50'>
              <img
                src={sourceImagePreview}
                alt={sourceImage.name}
                className='h-full w-full object-contain'
              />
            </div>
          </div>
        ) : reusedImageSourceName ? (
          <div className={reusedImageClassName}>
            <span className='truncate'>
              {t('TranslatePage.reusedImageHistorySource', { name: reusedImageSourceName })}
            </span>
          </div>
        ) : undefined}
        {sourceMode === 'image' && (sourceImage || reusedImageSourceName) ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='absolute right-1 top-1 z-20 bg-background/90 hover:bg-background'
                aria-label={t('TranslatePage.clearSource')}
                onClick={onClearSource}
              >
                <X />
              </Button>
            </TooltipTrigger>
            <TooltipContent side='left'>{t('TranslatePage.clearSource')}</TooltipContent>
          </Tooltip>
        ) : undefined}
        {sourceImage && sourceImagePreview ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='absolute right-1 top-11 z-20 bg-background/90 hover:bg-background'
                aria-label={t('TranslatePage.previewImage')}
                onClick={() => setIsImagePreviewOpen(true)}
              >
                <Maximize2 className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent side='left'>{t('TranslatePage.previewImage')}</TooltipContent>
          </Tooltip>
        ) : undefined}
        {sourceMode === 'text' && sourceText !== '' ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                aria-label={t('TranslatePage.clearSource')}
                onClick={onClearSource}
              >
              <X />
              </Button>
            </TooltipTrigger>
            <TooltipContent side='left'>{t('TranslatePage.clearSource')}</TooltipContent>
          </Tooltip>
        ) : undefined}
        <div className={sourceMetaClassName}>
          {sourceImage
            ? `${sourceImage.name} (${formatFileSize(sourceImage.size)})`
            : reusedImageSourceName
              ? t('TranslatePage.imageHistorySource', { name: reusedImageSourceName })
              : `${sourceText.length.toLocaleString()}/${MAX_TEXT_LENGTH.toLocaleString()}`}
        </div>
        <div className='absolute bottom-0 left-2 z-20 flex items-center gap-1 bg-white pr-1'>
          <Button
            variant='ghost'
            size='icon'
            aria-label={t('TranslatePage.uploadImage')}
            onClick={() => imageInputRef.current?.click()}
          >
            <ImagePlus className='h-4 w-4' />
          </Button>
        </div>
      </div>
      <ImagePreviewDialog
        open={isImagePreviewOpen}
        image={sourceImage}
        imagePreview={sourceImagePreview}
        onOpenChange={setIsImagePreviewOpen}
      />
    </div>
  );
};

export default SourceLanguagePanel;
