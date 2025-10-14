import React, { forwardRef, Ref, useEffect, useImperativeHandle, useState } from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { History } from 'lucide-react';
import { isEmpty } from 'lodash';
import { useTranslations } from 'next-intl';
import { LANGUAGES } from '../types/model';
import { toast } from 'sonner';

export interface ITranslationHistory {
  id: string;
  sourceText: string;
  translatedText: string;
  inputLanguage: string;
  outputLanguage: string;
}

const HISTORY_KEY = 'translationHistory';

export interface ITranslationHistoryRefHandle {
  add: (data: ITranslationHistory) => void;
  getHistory: () => ITranslationHistory[];
}

const TranslationHistory = (_props: unknown, ref: Ref<ITranslationHistoryRefHandle>) => {
  const t = useTranslations('TranslatePage');
  const [translationHistory, setTranslationHistory] = useState<ITranslationHistory[]>([]);

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(HISTORY_KEY);
      if (savedHistory) {
        setTranslationHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Failed to load translation history from localStorage', error);
    }
  }, []);

  const getLanguageName = (lang: string) => {
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

  const handleClearHistory = () => {
    setTranslationHistory([]);
    toast.success(t('historyCleared'));
  };

  const handleOnAddHistory = (data: ITranslationHistory) => {
    setTranslationHistory((prevHistory) => {
      const newHistory = [data, ...prevHistory.slice(0, 49)];
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      } catch (error) {
        console.error('Failed to save translation history to localStorage', error);
      }
      return newHistory;
    });
  };

  useImperativeHandle(ref, () => ({
    add: handleOnAddHistory,
    getHistory: () => translationHistory
  }));

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className='text-center mt-8 flex flex-col items-center cursor-pointer'>
          <div className='rounded-full h-16 w-16 flex items-center justify-center border bg-gray-50 hover:bg-gray-100 transition-colors'>
            <History className='h-8 w-8 text-gray-500' />
          </div>
          <p className='text-sm text-gray-600 mt-2'>{t('translationsMade')}</p>
        </div>
      </SheetTrigger>
      <SheetContent className='w-full sm:max-w-md'>
        <SheetHeader>
          <SheetTitle>{t('historyTitle')}</SheetTitle>
        </SheetHeader>
        <div className='h-[calc(100%-4rem)] flex flex-col'>
          <Button variant='link' onClick={handleClearHistory} className='text-blue-600 self-start px-0 h-auto py-1'>
            {t('clearHistory')}
          </Button>
          <div className='flex-grow overflow-y-auto mt-4 pr-2'>
            {isEmpty(translationHistory) ? (
              <p className='text-gray-500 text-center mt-10'>{t('noHistory')}</p>
            ) : (
              <div className='flex flex-col gap-4'>
                {translationHistory.map((item) => (
                  <div key={item.id} className='border p-3 rounded-lg bg-white shadow-sm'>
                    <div className='flex justify-between items-center text-xs text-gray-500 mb-2'>
                      <span>
                        {getLanguageName(item.inputLanguage)} → {getLanguageName(item.outputLanguage)}
                      </span>
                    </div>
                    <p className='text-sm text-gray-600 line-clamp-3'>{item.sourceText}</p>
                    <p className='mt-1 text-sm font-semibold text-black'>{item.translatedText}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default forwardRef<ITranslationHistoryRefHandle, unknown>(TranslationHistory);
