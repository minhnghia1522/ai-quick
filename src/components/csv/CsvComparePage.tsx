'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, GitCompareArrows, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/src/components/ui/button';
import CsvCompareFileCard from '@/src/components/csv/CsvCompareFileCard';
import CsvCompareGrid from '@/src/components/csv/CsvCompareGrid';
import CsvImportOptionsPanel from '@/src/components/csv/CsvImportOptions';
import { compareCsvDatasets } from '@/src/service/csv/csvComparator';
import { parseCsvFile } from '@/src/service/csv/csvParser';
import {
  DEFAULT_CSV_IMPORT_OPTIONS,
  CsvCompareResult,
  CsvDataset,
  CsvImportOptions,
  CsvValidationError
} from '@/src/types/csv';

type CompareSide = 'left' | 'right';

const CsvComparePage = () => {
  const t = useTranslations('CsvCompare');
  const [leftDataset, setLeftDataset] = useState<CsvDataset | null>(null);
  const [rightDataset, setRightDataset] = useState<CsvDataset | null>(null);
  const [importOptions, setImportOptions] = useState<CsvImportOptions>(DEFAULT_CSV_IMPORT_OPTIONS);
  const [parsingSide, setParsingSide] = useState<CompareSide | 'both' | null>(null);
  const leftFileRef = useRef<File | null>(null);
  const rightFileRef = useRef<File | null>(null);

  const labels = useMemo(
    () => ({
      left: {
        title: t('files.leftTitle'),
        uploadTitle: t('files.uploadTitle'),
        uploadHint: t('files.uploadHint'),
        selectFile: t('files.selectFile'),
        replace: t('files.replace'),
        rows: t('files.rows'),
        columns: t('files.columns')
      },
      right: {
        title: t('files.rightTitle'),
        uploadTitle: t('files.uploadTitle'),
        uploadHint: t('files.uploadHint'),
        selectFile: t('files.selectFile'),
        replace: t('files.replace'),
        rows: t('files.rows'),
        columns: t('files.columns')
      },
      importOptions: {
        title: t('importOptions.title'),
        encoding: t('importOptions.encoding'),
        delimiter: t('importOptions.delimiter'),
        delimiterHint: t('importOptions.delimiterHint'),
        header: t('importOptions.header'),
        headerHint: t('importOptions.headerHint'),
        apply: t('importOptions.apply'),
        pendingHint: t('importOptions.pendingHint')
      },
      grid: {
        row: t('grid.row'),
        status: t('grid.status'),
        leftTitle: t('files.leftTitle'),
        rightTitle: t('files.rightTitle'),
        horizontalScroll: t('grid.horizontalScroll'),
        statuses: {
          added: t('grid.added'),
          removed: t('grid.removed'),
          modified: t('grid.modified'),
          unchanged: t('grid.unchanged')
        }
      }
    }),
    [t]
  );

  const notifyError = useCallback(
    (error: unknown) => {
      if (error instanceof CsvValidationError) {
        if (error.code === 'unsupported-file') toast.error(t('errors.unsupportedFile'));
        else if (error.code === 'empty-file') toast.error(t('errors.emptyFile'));
        else if (error.code === 'empty-header') toast.error(t('errors.emptyHeader'));
        else if (error.code === 'invalid-delimiter') toast.error(t('errors.invalidDelimiter'));
        else toast.error(t('errors.parsingFailed'));
        return;
      }
      toast.error(t('errors.parsingFailed'));
    },
    [t]
  );

  const handleFileSelected = useCallback(
    async (side: CompareSide, file: File, options: CsvImportOptions) => {
      setParsingSide(side);
      try {
        const result = await parseCsvFile(file, options);
        if (side === 'left') {
          leftFileRef.current = file;
          setLeftDataset(result.dataset);
        } else {
          rightFileRef.current = file;
          setRightDataset(result.dataset);
        }
        toast.success(t('messages.fileLoaded', { fileName: file.name }));
      } catch (error) {
        notifyError(error);
      } finally {
        setParsingSide(null);
      }
    },
    [notifyError, t]
  );

  const handleReparse = useCallback(async () => {
    const leftFile = leftFileRef.current;
    const rightFile = rightFileRef.current;
    if (!leftFile || !rightFile) return;

    setParsingSide('both');
    try {
      const [leftResult, rightResult] = await Promise.all([
        parseCsvFile(leftFile, importOptions),
        parseCsvFile(rightFile, importOptions)
      ]);
      setLeftDataset(leftResult.dataset);
      setRightDataset(rightResult.dataset);
      toast.success(t('messages.reparsed'));
    } catch (error) {
      notifyError(error);
    } finally {
      setParsingSide(null);
    }
  }, [importOptions, notifyError, t]);

  const compareResult = useMemo<CsvCompareResult | null>(() => {
    if (!leftDataset || !rightDataset) return null;
    return compareCsvDatasets(leftDataset, rightDataset);
  }, [leftDataset, rightDataset]);

  return (
    <main className='flex min-h-[calc(100vh-3.5rem)] min-w-0 flex-col gap-4 bg-background p-4 md:p-6'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h1 className='flex items-center gap-2 text-2xl font-semibold tracking-tight'>
            <GitCompareArrows className='size-6' />
            {t('title')}
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>{t('description')}</p>
        </div>
        <Button variant='outline' size='sm' asChild>
          <Link href='/developer-toolkit/csv-toolkit'>
            <ArrowLeft />
            {t('backToEditor')}
          </Link>
        </Button>
      </div>

      <CsvImportOptionsPanel
        options={importOptions}
        hasFile={Boolean(leftFileRef.current && rightFileRef.current)}
        isParsing={parsingSide !== null}
        onChange={setImportOptions}
        onApply={() => void handleReparse()}
        labels={labels.importOptions}
      />

      <div className='grid gap-4 xl:grid-cols-2'>
        <CsvCompareFileCard
          dataset={leftDataset}
          isParsing={parsingSide === 'left' || parsingSide === 'both'}
          labels={labels.left}
          onFileSelected={(file) => void handleFileSelected('left', file, importOptions)}
        />
        <CsvCompareFileCard
          dataset={rightDataset}
          isParsing={parsingSide === 'right' || parsingSide === 'both'}
          labels={labels.right}
          onFileSelected={(file) => void handleFileSelected('right', file, importOptions)}
        />
      </div>

      {parsingSide ? (
        <div className='flex items-center justify-center gap-2 rounded-xl border bg-card p-8 text-sm text-muted-foreground'>
          <Loader2 className='size-4 animate-spin' />
          {t('messages.parsing')}
        </div>
      ) : null}

      {compareResult ? (
        <section className='space-y-4'>
          <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-5'>
            {[
              [t('summary.addedRows'), compareResult.addedRows, 'text-emerald-700'],
              [t('summary.removedRows'), compareResult.removedRows, 'text-red-700'],
              [t('summary.modifiedRows'), compareResult.modifiedRows, 'text-amber-700'],
              [t('summary.unchangedRows'), compareResult.unchangedRows, 'text-muted-foreground'],
              [t('summary.differentCells'), compareResult.differentCells, 'text-primary']
            ].map(([label, value, color]) => (
              <div key={String(label)} className='rounded-xl border bg-card p-4 shadow-sm'>
                <p className='text-xs text-muted-foreground'>{label}</p>
                <p className={`mt-2 text-2xl font-semibold ${color}`}>{Number(value).toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div className='rounded-xl border bg-card p-3 shadow-sm'>
            <div className='mb-3 flex items-center justify-between gap-3 px-1'>
              <div>
                <h2 className='text-base font-semibold'>{t('differences.title')}</h2>
                <p className='text-xs text-muted-foreground'>{t('differences.description')}</p>
              </div>
              <span className='text-sm text-muted-foreground'>
                {compareResult.differences.length.toLocaleString()} {t('differences.cells')}
              </span>
            </div>
            <CsvCompareGrid rows={compareResult.rows} columns={compareResult.columns} labels={labels.grid} />
          </div>
          {compareResult.differences.length === 0 ? (
            <div className='flex flex-col items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 p-12 text-center dark:border-emerald-900 dark:bg-emerald-950/20'>
              <CheckCircle2 className='size-10 text-emerald-600' />
              <h2 className='mt-3 text-lg font-semibold'>{t('differences.noDifferences')}</h2>
              <p className='mt-1 text-sm text-muted-foreground'>{t('differences.noDifferencesDescription')}</p>
            </div>
          ) : null}
        </section>
      ) : (
        <div className='rounded-xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground'>
          {t('messages.selectBoth')}
        </div>
      )}
    </main>
  );
};

export default CsvComparePage;
