import MarkdownPreview from '@/src/components/MarkdownPreview';
import TextareaAutosize from '@/src/components/input/TextareaAutosize';
import { Button } from '@/src/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/src/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/components/ui/tooltip';
import { LANGUAGES } from '@/src/types/model';
import { ChevronDown, Copy, FileText, Maximize2, Type } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { RefObject } from 'react';
import LanguageToggleGroup from './LanguageToggleGroup';
import type { TranslationViewMode } from './translationHelpers';

interface TranslationOutputPanelProps {
  outputLanguage: string;
  translatedText: string;
  plainTranslatedText: string;
  outputHeight: number;
  translationViewMode: TranslationViewMode;
  markdownOutputRef: RefObject<HTMLDivElement | null>;
  onOutputLanguageChange: (language: string) => void;
  onOutputHeightChange: (height: number) => void;
  onTranslationViewModeChange: (mode: TranslationViewMode) => void;
  onExpandOutput: () => void;
  onCopyTranslation: (format?: TranslationViewMode) => void;
}

const outputTextareaClassName = [
  'w-full border-none outline-none disabled:cursor-auto',
  'disabled:bg-gray-50 disabled:opacity-100'
].join(' ');

const outputToolbarClassName = [
  'absolute inset-y-1 right-1 z-20 flex w-9 flex-col items-center justify-start gap-1',
  'border-l border-border bg-gray-50 pl-1'
].join(' ');

const TranslationOutputPanel = ({
  outputLanguage,
  translatedText,
  plainTranslatedText,
  outputHeight,
  translationViewMode,
  markdownOutputRef,
  onOutputLanguageChange,
  onOutputHeightChange,
  onTranslationViewModeChange,
  onExpandOutput,
  onCopyTranslation
}: TranslationOutputPanelProps) => {
  const t = useTranslations();

  const outputLanguageOptions = [
    { value: LANGUAGES.vn, label: t('TranslatePage.vietnamese') },
    { value: LANGUAGES.en, label: t('TranslatePage.english') },
    { value: LANGUAGES.ja, label: t('TranslatePage.japanese') }
  ];

  return (
    <div className='flex flex-col gap-1 w-full md:w-1/2'>
      <LanguageToggleGroup
        selectedLanguage={outputLanguage}
        options={outputLanguageOptions}
        onSelect={onOutputLanguageChange}
      />
      <div>
        <div className='relative w-full flex rounded-md border border-input bg-gray-50 px-1 pt-1 pr-11 pb-8'>
          <Tabs
            value={translationViewMode}
            onValueChange={(value) => onTranslationViewModeChange(value as TranslationViewMode)}
            className='w-full min-w-0'
          >
            <TabsContent value='text' className='m-0'>
              <TextareaAutosize
                className={outputTextareaClassName}
                value={plainTranslatedText}
                disabled={true}
                forcedHeight={outputHeight}
                onHeightChange={onOutputHeightChange}
              />
            </TabsContent>
            <TabsContent value='markdown' className='m-0'>
              <div
                ref={markdownOutputRef}
                className='w-full min-w-0 overflow-auto rounded bg-gray-50 px-2 pb-2'
                style={{ height: outputHeight }}
              >
                <MarkdownPreview content={translatedText} useParentHorizontalScroll />
              </div>
            </TabsContent>
            <div className={outputToolbarClassName}>
              <TabsList className='h-auto w-7 flex-col p-0.5 shadow-sm'>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger
                      value='text'
                      aria-label={t('TranslatePage.textView')}
                      className={`h-7 w-7 px-0 py-0 ${
                        translationViewMode === 'text'
                          ? 'bg-blue-100 text-blue-700 shadow-sm hover:bg-blue-100'
                          : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      <Type className='h-4 w-4' />
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent side='left'>{t('TranslatePage.textView')}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger
                      value='markdown'
                      aria-label={t('TranslatePage.markdownView')}
                      className={`h-7 w-7 px-0 py-0 ${
                        translationViewMode === 'markdown'
                          ? 'bg-blue-100 text-blue-700 shadow-sm hover:bg-blue-100'
                          : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      <FileText className='h-4 w-4' />
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent side='left'>{t('TranslatePage.markdownView')}</TooltipContent>
                </Tooltip>
              </TabsList>
              {translatedText !== '' ? (
                <div className='flex shrink-0 flex-col items-center gap-1'>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-7 w-7'
                        aria-label={t('TranslatePage.expandOutput')}
                        onClick={onExpandOutput}
                      >
                        <Maximize2 className='h-4 w-4' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side='left'>{t('TranslatePage.expandOutput')}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-7 w-7'
                        aria-label={t('TranslatePage.copyTranslation')}
                        onClick={() => onCopyTranslation('text')}
                      >
                        <Copy className='h-4 w-4' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side='left'>{t('TranslatePage.copyTranslation')}</TooltipContent>
                  </Tooltip>
                  <DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-7 w-7'
                            aria-label={t('TranslatePage.copyOptions')}
                          >
                            <ChevronDown className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent side='left'>{t('TranslatePage.copyOptions')}</TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem onClick={() => onCopyTranslation('text')}>
                        {t('TranslatePage.copyAsText')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onCopyTranslation('markdown')}>
                        {t('TranslatePage.copyAsMarkdown')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : undefined}
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default TranslationOutputPanel;
