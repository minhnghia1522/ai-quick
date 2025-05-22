import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { SelectOption } from '../../types/components';
import { memo } from 'react';

interface Props extends Omit<React.ComponentProps<'select'>, 'onChange'> {
  value: string;
  onValueChange: (value: string) => void;
  options?: SelectOption[];
}

const SelectField = ({ value, onValueChange, options }: Props) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className='w-[180px]'>
        <SelectValue placeholder='' />
      </SelectTrigger>
      <SelectContent>
        {options?.map((option) => (
          <SelectItem key={option.value} value={String(option.value)}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default memo(SelectField);
