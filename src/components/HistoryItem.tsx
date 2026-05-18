import React from 'react';
import { ITranslationHistory } from './TranslationHistory';
import { useTranslations } from 'next-intl';
import { LANGUAGES } from '../types/model';
import { Button } from './ui/button';
import { ChevronDown, Copy, ImageIcon, RefreshCw, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu';
import { markdownToPlainText } from '../lib/markdown';

interface HistoryItemProps {
  item: ITranslationHistory;
  onCopy: (item: ITranslationHistory, format: 'text' | 'markdown') => void;
  onDelete: (id: string) => void;
  onReuse: (item: ITranslationHistory) => void;
}

const getLanguageName = (lang: string, t: (key: string) => string) => {
  switch (lang) {
    case LANGUAGES.ja:
      return t('japanese');
    case LANGUAGES.en:
      return t('english');
    case LANGUAGES.vn:
      return t('vietnamese');
    case LANGUAGES.natural:
      return t('detectLanguage');
    default:
      return lang;
  }
};

const HistoryItem: React.FC<HistoryItemProps> = ({ item, onCopy, onDelete, onReuse }) => {
  const t = useTranslations('TranslatePage');
  const plainTranslatedText = markdownToPlainText(item.translatedText);

  return (
    <li className='group flex flex-col min-w-0 rounded-lg border bg-card text-card-foreground p-4 sm:p-3 shadow-sm hover:shadow transition-shadow'>
      <div className='flex justify-between items-center gap-3 text-xs text-slate-900 mb-2'>
        <span>
          {getLanguageName(item.inputLanguage, t)} → {getLanguageName(item.outputLanguage, t)}
        </span>
        <div className='flex items-center gap-2'>
          {item.cost !== undefined && <span className='text-slate-900 font-medium'>${item.cost.toFixed(6)}</span>}
          <span className='text-slate-900 font-medium'>{new Date(item.timestamp).toLocaleTimeString()}</span>
        </div>
      </div>
      {item.sourceType === 'image' ? (
        <div className='mb-1 flex min-w-0 items-center gap-2 text-sm text-gray-700'>
          <ImageIcon className='h-4 w-4 shrink-0' />
          <span className='truncate'>{t('imageHistorySource', { name: item.sourceName ?? item.sourceText })}</span>
        </div>
      ) : (
        <p className='text-sm text-gray-700 line-clamp-3 mb-1 min-w-0 break-words whitespace-pre-wrap leading-relaxed'>
          {item.sourceText}
        </p>
      )}
      <p className='text-sm font-semibold text-foreground min-w-0 break-words whitespace-pre-wrap leading-relaxed'>
        {plainTranslatedText}
      </p>
      <div className='flex items-center justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity'>
        <div className='flex items-center'>
          <Button
            variant='ghost'
            size='icon'
            className='rounded-r-none'
            aria-label={t('copyTranslation')}
            onClick={() => onCopy(item, 'text')}
          >
            <Copy className='h-4 w-4' />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='h-9 w-7 rounded-l-none border-l border-border'
                aria-label={t('copyOptions')}
              >
                <ChevronDown className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => onCopy(item, 'text')}>{t('copyAsText')}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCopy(item, 'markdown')}>{t('copyAsMarkdown')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button variant='ghost' size='icon' aria-label={t('reuseTranslation')} onClick={() => onReuse(item)}>
          <RefreshCw className='h-4 w-4' />
        </Button>
        <Button
          variant='ghost'
          size='icon'
          className='text-destructive hover:text-destructive/90'
          aria-label={t('deleteTranslation')}
          onClick={() => onDelete(item.id)}
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </div>
    </li>
  );
};

export default HistoryItem;
