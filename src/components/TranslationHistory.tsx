import React, { forwardRef, Ref, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { History, Search } from 'lucide-react';
import { isEmpty } from 'lodash';
import { useTranslations } from 'next-intl';
// import { LANGUAGES } from '../types/model';
import { toast } from 'sonner';
import { Input } from './ui/input';
import HistoryItem from './HistoryItem';

export interface ITranslationHistory {
  id: string;
  sourceText: string;
  translatedText: string;
  inputLanguage: string;
  outputLanguage: string;
  timestamp: number;
}

const HISTORY_KEY = 'translationHistory';

export interface ITranslationHistoryRefHandle {
  add: (data: ITranslationHistory) => void;
}

interface TranslationHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReuse: (item: ITranslationHistory) => void;
}

const groupHistoryByDate = (history: ITranslationHistory[], t: (key: string) => string) => {
  const groups: { [key: string]: ITranslationHistory[] } = {};
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  history.forEach((item) => {
    const itemDate = new Date(item.timestamp);
    let key = '';

    if (itemDate >= today) {
      key = t('today');
    } else if (itemDate >= yesterday) {
      key = t('yesterday');
    } else if (itemDate >= sevenDaysAgo) {
      key = t('previous7Days');
    } else {
      key = t('older');
    }

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
  });

  return groups;
};

const TranslationHistory = (props: TranslationHistoryProps, ref: Ref<ITranslationHistoryRefHandle>) => {
  const { open, onOpenChange, onReuse } = props;
  const t = useTranslations('TranslatePage');
  const [translationHistory, setTranslationHistory] = useState<ITranslationHistory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(HISTORY_KEY);
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory) as ITranslationHistory[];
        // Sort by timestamp descending to ensure newest are first
        parsedHistory.sort((a, b) => b.timestamp - a.timestamp);
        setTranslationHistory(parsedHistory);
      }
    } catch (error) {
      console.error('Failed to load translation history from localStorage', error);
    }
  }, []);

  const handleClearHistory = () => {
    setTranslationHistory([]);
    localStorage.removeItem(HISTORY_KEY);
    toast.success(t('historyCleared'));
  };

  const handleOnAddHistory = (data: ITranslationHistory) => {
    setTranslationHistory((prevHistory) => {
      const newHistory = [data, ...prevHistory];
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      } catch (error) {
        console.error('Failed to save translation history to localStorage', error);
      }
      return newHistory;
    });
  };

  const handleDeleteItem = (id: string) => {
    setTranslationHistory((prevHistory) => {
      const newHistory = prevHistory.filter((item) => item.id !== id);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      toast.success(t('historyItemDeleted'));
      return newHistory;
    });
  };

  const handleCopyItem = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t('copied'));
  };

  useImperativeHandle(ref, () => ({
    add: handleOnAddHistory
  }));

  const filteredAndGroupedHistory = useMemo(() => {
    const filtered = translationHistory.filter(
      (item) =>
        item.sourceText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.translatedText.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return groupHistoryByDate(filtered, t);
  }, [translationHistory, searchQuery, t]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <div
          className='text-center mt-8 flex flex-col items-center cursor-pointer'
          onClick={() => onOpenChange(true)}
        >
          <div className='rounded-full h-16 w-16 flex items-center justify-center border bg-gray-50 hover:bg-gray-100 transition-colors'>
            <History className='h-8 w-8 text-gray-500' />
          </div>
          <p className='text-sm text-gray-600 mt-2'>{t('translationsMade')}</p>
        </div>
      </SheetTrigger>
      <SheetContent className='w-full sm:max-w-md md:max-w-xl flex flex-col p-4'>
        <SheetHeader>
          <SheetTitle>{t('historyTitle')}</SheetTitle>
        </SheetHeader>
        <div className='relative my-1'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder={t('searchHistory')}
            className='pl-10'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className='flex-1 overflow-y-auto flex flex-col'>
          {isEmpty(translationHistory) ? (
            <p className='text-gray-500 text-center mt-10'>{t('noHistory')}</p>
          ) : Object.keys(filteredAndGroupedHistory).length === 0 ? (
            <p className='text-gray-500 text-center mt-10'>{t('noResultsFound')}</p>
          ) : (
            <ul className='flex-1 space-y-3'>
              {Object.entries(filteredAndGroupedHistory).map(([groupTitle, items]) => (
                <React.Fragment key={groupTitle}>
                  <li className='sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2'>
                    <h3 className='text-sm font-semibold text-slate-800'>{groupTitle}</h3>
                  </li>
                  {items.map((item) => (
                    <HistoryItem
                      key={item.id}
                      item={item}
                      onCopy={handleCopyItem}
                      onDelete={handleDeleteItem}
                      onReuse={onReuse}
                    />
                  ))}
                </React.Fragment>
              ))}
            </ul>
          )}
        </div>
        {!isEmpty(translationHistory) && (
          <div className='pt-4 border-t'>
            <Button variant='link' onClick={handleClearHistory} className='text-blue-600 self-start px-0 h-auto py-1'>
              {t('clearHistory')}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default forwardRef<ITranslationHistoryRefHandle, TranslationHistoryProps>(TranslationHistory);
