import React from 'react';
import { Search } from 'lucide-react';
import { Input } from './ui/input';
import { LANGUAGES } from '../types/model';

interface TranslationHistoryFilterProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  searchDate: string;
  setSearchDate: (value: string) => void;
  searchInputLang: string;
  setSearchInputLang: (value: string) => void;
  searchOutputLang: string;
  setSearchOutputLang: (value: string) => void;
  t: (key: string) => string;
}

const TranslationHistoryFilter: React.FC<TranslationHistoryFilterProps> = ({
  searchQuery,
  setSearchQuery,
  searchDate,
  setSearchDate,
  searchInputLang,
  setSearchInputLang,
  searchOutputLang,
  setSearchOutputLang,
  t
}) => {
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
  return (
    <div className='my-2 p-3 rounded-lg border bg-gray-50'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {/* Search */}
        <div>
          <label className='block text-xs font-medium text-gray-700 mb-1'>{t('searchLabel')}</label>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder={t('searchHistory')}
              className='pl-10'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        {/* Date */}
        <div>
          <label className='block text-xs font-medium text-gray-700 mb-1'>{t('dateLabel')}</label>
          <input
            type='date'
            className='w-full border rounded px-2 py-1 text-sm'
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            title={t('filterByDate')}
          />
        </div>
        {/* Input Language */}
        <div>
          <label className='block text-xs font-medium text-gray-700 mb-1'>{t('inputLangLabel')}</label>
          <select
            className='w-full border rounded px-2 py-1 text-sm'
            value={searchInputLang}
            onChange={(e) => setSearchInputLang(e.target.value)}
            title={t('filterByInputLanguage')}
          >
            <option value=''>{t('allInputLanguages')}</option>
            {Object.entries(LANGUAGES).map(([code, name]) => {
              return (
                <option key={code} value={name}>
                  {getLanguageName(name, t)}
                </option>
              );
            })}
          </select>
        </div>
        {/* Output Language */}
        <div>
          <label className='block text-xs font-medium text-gray-700 mb-1'>{t('outputLangLabel')}</label>
          <select
            className='w-full border rounded px-2 py-1 text-sm'
            value={searchOutputLang}
            onChange={(e) => setSearchOutputLang(e.target.value)}
            title={t('filterByOutputLanguage')}
          >
            <option value=''>{t('allOutputLanguages')}</option>
            {Object.entries(LANGUAGES).map(([code, name]) => {
              return (
                <option key={code} value={name}>
                  {getLanguageName(name, t)}
                </option>
              );
            })}
          </select>
        </div>
      </div>
    </div>
  );
};

export default TranslationHistoryFilter;
