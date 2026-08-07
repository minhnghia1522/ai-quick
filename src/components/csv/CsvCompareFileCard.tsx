'use client';

import { ChangeEvent, useRef } from 'react';
import { FileText, RefreshCw } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { CsvDataset } from '@/src/types/csv';
import CsvUploadZone from './CsvUploadZone';

interface CsvCompareFileCardProps {
  dataset: CsvDataset | null;
  isParsing: boolean;
  labels: {
    title: string;
    uploadTitle: string;
    uploadHint: string;
    selectFile: string;
    replace: string;
    rows: string;
    columns: string;
  };
  onFileSelected: (file: File) => void;
}

const CsvCompareFileCard = ({ dataset, isParsing, labels, onFileSelected }: CsvCompareFileCardProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.item(0);
    if (file) onFileSelected(file);
    event.target.value = '';
  };

  return (
    <section className='rounded-xl border bg-card p-4 shadow-sm'>
      <div className='mb-3 flex items-center gap-2'>
        <FileText className='size-4 text-muted-foreground' />
        <h2 className='text-sm font-semibold'>{labels.title}</h2>
      </div>
      {dataset ? (
        <div className='flex min-h-32 flex-col justify-between gap-4 rounded-lg border bg-muted/20 p-4'>
          <div className='min-w-0'>
            <p className='truncate font-medium' title={dataset.metadata.fileName}>
              {dataset.metadata.fileName}
            </p>
            <p className='mt-2 text-xs text-muted-foreground'>
              {dataset.rows.length.toLocaleString()} {labels.rows} · {dataset.columns.length.toLocaleString()} {labels.columns}
            </p>
          </div>
          <Button type='button' variant='outline' size='sm' onClick={() => inputRef.current?.click()} disabled={isParsing}>
            <RefreshCw className='mr-2 size-4' />
            {labels.replace}
          </Button>
          <input ref={inputRef} type='file' accept='.csv,text/csv' className='hidden' onChange={handleInputChange} />
        </div>
      ) : (
        <CsvUploadZone
          onFileSelected={onFileSelected}
          labels={{ title: labels.uploadTitle, hint: labels.uploadHint, selectFile: labels.selectFile }}
        />
      )}
    </section>
  );
};

export default CsvCompareFileCard;
