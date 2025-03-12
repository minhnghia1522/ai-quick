'use client';
import { OpenAIModel } from '@/types/types';
import { useEffect, useState } from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from './ui/select';

const ModelSelect = () => {
  const [model, setModel] = useState<OpenAIModel>('gpt-4o');
  useEffect(() => {
    const modelLocalStorage = localStorage.getItem('model');

    if (modelLocalStorage) {
      setModel(modelLocalStorage as OpenAIModel);
    }
  }, []);

  const handleValueChange = (value: string) => {
    setModel(value as OpenAIModel);
    localStorage.setItem('model', value);
  };

  return (
    <Select onValueChange={handleValueChange} value={model}>
      <SelectTrigger className="w-[200px] h-[40px] bg-white font-medium text-black">
        <SelectValue placeholder="Select Model" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="gpt-4o">gpt-4o</SelectItem>
        <SelectItem value="gpt-4o-mini">gpt-4o-mini</SelectItem>
        <SelectItem value="o1-mini">o1-mini</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default ModelSelect;
