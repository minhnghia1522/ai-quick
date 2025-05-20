'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { STORAGE_KEY_MODEL } from '@/src/types/model';

type OpenAIModel = 'gpt-4o' | 'gpt-4o-mini' | 'o1-mini';

const ModelSelect = () => {
  const t = useTranslations();
  const [model, setModel] = useState<OpenAIModel>('gpt-4o');

  useEffect(() => {
    const modelLocalStorage = localStorage.getItem(STORAGE_KEY_MODEL);

    if (modelLocalStorage) {
      setModel(modelLocalStorage as OpenAIModel);
    } else {
      localStorage.setItem(STORAGE_KEY_MODEL, 'gpt-4o');
    }
  }, []);

  const handleValueChange = (value: string) => {
    setModel(value as OpenAIModel);
    localStorage.setItem(STORAGE_KEY_MODEL, value);
  };

  return (
    <Select onValueChange={handleValueChange} value={model}>
      <SelectTrigger className='w-[200px] h-[40px] bg-white font-medium text-black'>
        <SelectValue placeholder={t('ModelSelect.placeholder')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='gpt-4o'>{t('ModelSelect.models.gpt-4o', { default: 'gpt-4o' })}</SelectItem>
        <SelectItem value='gpt-4o-mini'>{t('ModelSelect.models.gpt-4o-mini', { default: 'gpt-4o-mini' })}</SelectItem>
        <SelectItem value='o1-mini'>{t('ModelSelect.models.o1-mini', { default: 'o1-mini' })}</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default ModelSelect;
