import { ChangeEvent } from 'react';
import {
  BarChart3,
  Copy,
  Download,
  FilePlus2,
  FileUp,
  FilterX,
  GitCompareArrows,
  Plus,
  Search,
  Trash2,
  WandSparkles
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';

interface CsvToolbarProps {
  hasData: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onOpen: () => void;
  onDownload: () => void;
  onAddRow: () => void;
  onDeleteRows: () => void;
  onDuplicateRows: () => void;
  onRemoveEmptyRows: () => void;
  onRemoveDuplicateRows: () => void;
  onShowStatistics: () => void;
  onShowSummary: () => void;
  labels: {
    open: string;
    download: string;
    addRow: string;
    deleteRows: string;
    duplicateRows: string;
    search: string;
    removeEmptyRows: string;
    removeDuplicateRows: string;
    statistics: string;
    summary: string;
    compare: string;
  };
}

const CsvToolbar = ({
  hasData,
  searchQuery,
  onSearchChange,
  onOpen,
  onDownload,
  onAddRow,
  onDeleteRows,
  onDuplicateRows,
  onRemoveEmptyRows,
  onRemoveDuplicateRows,
  onShowStatistics,
  onShowSummary,
  labels
}: CsvToolbarProps) => {
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => onSearchChange(event.target.value);

  return (
    <div className='flex flex-col gap-3 rounded-xl border bg-card p-3 shadow-sm'>
      <div className='flex flex-wrap items-center gap-2'>
        <Button size='sm' variant='secondary' asChild>
          <Link href='/developer-toolkit/csv-compare'>
            <GitCompareArrows />
            {labels.compare}
          </Link>
        </Button>
        <span className='hidden h-6 w-px bg-border sm:block' />
        <Button size='sm' onClick={onOpen}>
          <FileUp />
          {labels.open}
        </Button>
        <Button size='sm' variant='outline' onClick={onDownload} disabled={!hasData}>
          <Download />
          {labels.download}
        </Button>
        <span className='hidden h-6 w-px bg-border sm:block' />
        <Button size='sm' variant='outline' onClick={onAddRow} disabled={!hasData}>
          <Plus />
          {labels.addRow}
        </Button>
        <Button size='sm' variant='outline' onClick={onDeleteRows} disabled={!hasData}>
          <Trash2 />
          {labels.deleteRows}
        </Button>
        <Button size='sm' variant='outline' onClick={onDuplicateRows} disabled={!hasData}>
          <Copy />
          {labels.duplicateRows}
        </Button>
        <Button size='sm' variant='outline' onClick={onRemoveEmptyRows} disabled={!hasData}>
          <FilterX />
          {labels.removeEmptyRows}
        </Button>
        <Button size='sm' variant='outline' onClick={onRemoveDuplicateRows} disabled={!hasData}>
          <WandSparkles />
          {labels.removeDuplicateRows}
        </Button>
        <Button size='sm' variant='ghost' onClick={onShowStatistics} disabled={!hasData}>
          <BarChart3 />
          {labels.statistics}
        </Button>
        <Button size='sm' variant='ghost' onClick={onShowSummary} disabled={!hasData}>
          <FilePlus2 />
          {labels.summary}
        </Button>
      </div>
      <div className='relative max-w-md'>
        <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder={labels.search}
          aria-label={labels.search}
          disabled={!hasData}
          className='pl-9'
        />
      </div>
    </div>
  );
};

export default CsvToolbar;
