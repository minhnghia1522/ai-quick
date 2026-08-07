'use client';

import { ChangeEvent } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/src/components/ui/select';
import { CSV_ENCODINGS } from '@/src/types/csv';
import type { CsvImportOptions } from '@/src/types/csv';

interface CsvImportOptionsLabels {
  title: string;
  encoding: string;
  delimiter: string;
  delimiterHint: string;
  header: string;
  headerHint: string;
  apply: string;
  pendingHint: string;
}

interface CsvImportOptionsProps {
  options: CsvImportOptions;
  hasFile: boolean;
  isParsing: boolean;
  onChange: (options: CsvImportOptions) => void;
  onApply: () => void;
  labels: CsvImportOptionsLabels;
}

const CsvImportOptions = ({ options, hasFile, isParsing, onChange, onApply, labels }: CsvImportOptionsProps) => {
  const handleDelimiterChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...options, delimiter: event.target.value });
  };

  return (
    <section className='rounded-xl border bg-card p-4 shadow-sm'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h2 className='text-sm font-semibold'>{labels.title}</h2>
          <p className='mt-1 text-xs text-muted-foreground'>{labels.pendingHint}</p>
        </div>
        {hasFile ? (
          <Button type='button' variant='outline' size='sm' onClick={onApply} disabled={isParsing}>
            <RotateCcw className='mr-2 size-4' />
            {labels.apply}
          </Button>
        ) : null}
      </div>

      <div className='mt-4 grid gap-4 md:grid-cols-[minmax(180px,1fr)_minmax(150px,0.7fr)_minmax(240px,1.4fr)]'>
        <div className='space-y-2'>
          <Label htmlFor='csv-encoding'>{labels.encoding}</Label>
          <Select value={options.encoding} onValueChange={(encoding) => onChange({ ...options, encoding })}>
            <SelectTrigger id='csv-encoding' className='w-full'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CSV_ENCODINGS.map((encoding) => (
                <SelectItem key={encoding.value} value={encoding.value}>
                  {encoding.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='csv-delimiter'>{labels.delimiter}</Label>
          <Input
            id='csv-delimiter'
            value={options.delimiter}
            onChange={handleDelimiterChange}
            maxLength={3}
            placeholder=','
            aria-describedby='csv-delimiter-hint'
          />
          <p id='csv-delimiter-hint' className='text-xs text-muted-foreground'>
            {labels.delimiterHint}
          </p>
        </div>

        <div className='flex items-start gap-3 rounded-lg border bg-muted/20 p-3'>
          <input
            id='csv-header'
            type='checkbox'
            checked={options.hasHeader}
            onChange={(event) => onChange({ ...options, hasHeader: event.target.checked })}
            className='mt-0.5 size-4 shrink-0 accent-primary'
          />
          <div className='space-y-1'>
            <Label htmlFor='csv-header' className='cursor-pointer'>
              {labels.header}
            </Label>
            <p className='text-xs text-muted-foreground'>{labels.headerHint}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CsvImportOptions;
