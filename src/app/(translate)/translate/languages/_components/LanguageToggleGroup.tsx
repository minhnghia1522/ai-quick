import { Button } from '@/src/components/ui/button';
import type { FC } from 'react';

interface LanguageToggleOption {
  value: string;
  label: string;
  className?: string;
}

interface LanguageToggleGroupProps {
  selectedLanguage: string;
  options: LanguageToggleOption[];
  onSelect: (language: string) => void;
}

const LanguageToggleGroup: FC<LanguageToggleGroupProps> = ({ selectedLanguage, options, onSelect }) => (
  <div className='flex flex-nowrap gap-1 overflow-x-auto'>
    {options.map((option) => (
      <Button
        key={option.value}
        variant={selectedLanguage === option.value ? 'default' : 'link'}
        className={option.className}
        onClick={() => onSelect(option.value)}
      >
        {option.label}
      </Button>
    ))}
  </div>
);

export default LanguageToggleGroup;
