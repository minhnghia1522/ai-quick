import React from 'react';
import { ITranslationHistory } from './TranslationHistory';
import { useTranslations } from 'next-intl';
import { LANGUAGES } from '../types/model';
import { Button } from './ui/button';
import { Copy, RefreshCw, Trash2 } from 'lucide-react';

interface HistoryItemProps {
  item: ITranslationHistory;
  onCopy: (text: string) => void;
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

  return (
    <li className='group flex flex-col min-w-0 rounded-lg border bg-card text-card-foreground p-4 sm:p-5 shadow-sm hover:shadow transition-shadow'>
      <div className='flex justify-between items-center gap-3 text-xs text-muted-foreground mb-2'>
        <span>
          {getLanguageName(item.inputLanguage, t)} → {getLanguageName(item.outputLanguage, t)}
        </span>
        <span className='text-slate-400'>{new Date(item.timestamp).toLocaleTimeString()}</span>
      </div>
      <p className='text-sm text-muted-foreground line-clamp-3 mb-1 min-w-0 break-words whitespace-pre-wrap leading-relaxed'>
        {item.sourceText}
      </p>
      <p className='text-sm font-semibold text-foreground min-w-0 break-words whitespace-pre-wrap leading-relaxed'>
        {item.translatedText}
      </p>
      <div className='flex items-center justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity'>
        <Button
          variant='ghost'
          size='icon'
          aria-label={t('copyTranslation')}
          onClick={() => onCopy(item.translatedText)}
        >
          <Copy className='h-4 w-4' />
        </Button>
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
