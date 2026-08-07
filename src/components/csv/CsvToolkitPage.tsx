'use client';

import { ChangeEvent, RefObject, useCallback, useMemo, useRef, useState } from 'react';
import { GridApi } from 'ag-grid-community';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import CsvGrid from '@/src/components/csv/CsvGrid';
import CsvImportOptionsPanel from '@/src/components/csv/CsvImportOptions';
import CsvSummary from '@/src/components/csv/CsvSummary';
import CsvToolbar from '@/src/components/csv/CsvToolbar';
import ColumnStatistics from '@/src/components/csv/ColumnStatistics';
import CsvUploadZone from '@/src/components/csv/CsvUploadZone';
import { useColumnStatistics } from '@/src/hooks/csv/useColumnStatistics';
import { exportCsv } from '@/src/service/csv/csvExporter';
import { parseCsvFile } from '@/src/service/csv/csvParser';
import { DEFAULT_CSV_IMPORT_OPTIONS, CsvColumn, CsvDataset, CsvGridRow, CsvImportOptions, CsvSummary as CsvSummaryData, CsvValidationError } from '@/src/types/csv';
import { createEmptyCsvRow, getCsvRowSignature, isEmptyCsvRow } from '@/src/utils/csv/csvRows';

const CsvToolkitPage = () => {
  const t = useTranslations('CsvToolkit');
  const [dataset, setDataset] = useState<CsvDataset | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<CsvColumn | null>(null);
  const [selectedRows, setSelectedRows] = useState<CsvGridRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [revision, setRevision] = useState(0);
  const [isParsing, setIsParsing] = useState(false);
  const [importOptions, setImportOptions] = useState<CsvImportOptions>(DEFAULT_CSV_IMPORT_OPTIONS);
  const gridApiRef = useRef<GridApi<CsvGridRow> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sourceFileRef = useRef<File | null>(null);
  const rowsRef = useRef<CsvGridRow[]>([]);
  const summaryRef = useRef<HTMLDivElement>(null);
  const statisticsRef = useRef<HTMLDivElement>(null);

  const labels = useMemo(
    () => ({
      toolbar: {
        open: t('toolbar.open'),
        download: t('toolbar.download'),
        addRow: t('toolbar.addRow'),
        deleteRows: t('toolbar.deleteRows'),
        duplicateRows: t('toolbar.duplicateRows'),
        search: t('toolbar.search'),
        removeEmptyRows: t('toolbar.removeEmptyRows'),
        removeDuplicateRows: t('toolbar.removeDuplicateRows'),
        statistics: t('toolbar.statistics'),
        summary: t('toolbar.summary'),
        compare: t('toolbar.compare')
      },
      summary: {
        title: t('summary.title'),
        fileName: t('summary.fileName'),
        totalRows: t('summary.totalRows'),
        totalColumns: t('summary.totalColumns'),
        delimiter: t('summary.delimiter'),
        encoding: t('summary.encoding'),
        headerDetected: t('summary.headerDetected'),
        fileSize: t('summary.fileSize'),
        noFile: t('summary.noFile')
      },
      statistics: {
        title: t('statistics.title'),
        columnName: t('statistics.columnName'),
        detectedType: t('statistics.detectedType'),
        emptyValues: t('statistics.emptyValues'),
        uniqueValues: t('statistics.uniqueValues'),
        maximumLength: t('statistics.maximumLength'),
        minimumLength: t('statistics.minimumLength'),
        noColumn: t('statistics.noColumn')
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
      }
    }),
    [t]
  );

  const currentSummary = useMemo<CsvSummaryData | null>(() => {
    if (!dataset) return null;
    return {
      ...dataset.metadata,
      totalRows: rowsRef.current.length,
      totalColumns: dataset.columns.length
    };
  // The revision invalidates this memo when rows are mutated through the grid API.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataset, revision]);

  const statistics = useColumnStatistics(selectedColumn, rowsRef.current, revision);

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
    async (file: File, options: CsvImportOptions) => {
      setIsParsing(true);
      try {
        const result = await parseCsvFile(file, options);
        sourceFileRef.current = file;
        rowsRef.current = result.dataset.rows;
        setDataset(result.dataset);
        setImportOptions(options);
        setSelectedRows([]);
        setSelectedColumn(result.dataset.columns[0] ?? null);
        setSearchQuery('');
        setRevision((value) => value + 1);
        toast.success(t('messages.loaded', { rows: result.dataset.rows.length }));
      } catch (error) {
        notifyError(error);
      } finally {
        setIsParsing(false);
      }
    },
    [notifyError, t]
  );

  const handleApplyImportOptions = () => {
    if (sourceFileRef.current) void handleFileSelected(sourceFileRef.current, importOptions);
  };

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.item(0);
    if (file) void handleFileSelected(file, importOptions);
    event.target.value = '';
  };

  const getExportColumns = useCallback((): CsvColumn[] => {
    if (!dataset || !gridApiRef.current) return dataset?.columns ?? [];
    const currentColumns = gridApiRef.current.getAllGridColumns();
    return currentColumns
      .map((column) => dataset.columns.find((item) => item.field === column.getColDef().field))
      .filter((column): column is CsvColumn => Boolean(column));
  }, [dataset]);

  const handleDownload = useCallback(() => {
    if (!dataset) return;
    exportCsv(
      getExportColumns(),
      rowsRef.current,
      dataset.metadata.fileName,
      dataset.metadata.delimiter,
      dataset.metadata.headerDetected
    );
    toast.success(t('messages.downloaded'));
  }, [dataset, getExportColumns, t]);

  const bumpRevision = () => setRevision((value) => value + 1);

  const replaceRowsInPlace = (nextRows: CsvGridRow[]) => {
    rowsRef.current.length = 0;
    nextRows.forEach((row) => rowsRef.current.push(row));
  };

  const handleAddRow = () => {
    if (!dataset || !gridApiRef.current) return;
    const row = createEmptyCsvRow(dataset.columns);
    rowsRef.current.push(row);
    gridApiRef.current.applyTransaction({ add: [row] });
    bumpRevision();
  };

  const handleDeleteRows = () => {
    if (!gridApiRef.current || selectedRows.length === 0) {
      toast.info(t('messages.noRowsSelected'));
      return;
    }
    const selectedIds = new Set(selectedRows.map((row) => row.__csvRowId));
    const rowsToRemove = rowsRef.current.filter((row) => selectedIds.has(row.__csvRowId));
    gridApiRef.current.applyTransaction({ remove: rowsToRemove });
    replaceRowsInPlace(rowsRef.current.filter((row) => !selectedIds.has(row.__csvRowId)));
    setSelectedRows([]);
    bumpRevision();
  };

  const handleDuplicateRows = () => {
    if (!dataset || !gridApiRef.current || selectedRows.length === 0) {
      toast.info(t('messages.noRowsSelected'));
      return;
    }
    const duplicates = selectedRows.map((row) => ({ ...row, __csvRowId: crypto.randomUUID() }));
    duplicates.forEach((row) => rowsRef.current.push(row));
    gridApiRef.current.applyTransaction({ add: duplicates });
    bumpRevision();
  };

  const removeRows = (rowsToRemove: CsvGridRow[]) => {
    if (!gridApiRef.current || rowsToRemove.length === 0) return;
    const ids = new Set(rowsToRemove.map((row) => row.__csvRowId));
    gridApiRef.current.applyTransaction({ remove: rowsToRemove });
    replaceRowsInPlace(rowsRef.current.filter((row) => !ids.has(row.__csvRowId)));
    setSelectedRows([]);
    bumpRevision();
  };

  const handleRemoveEmptyRows = () => {
    if (!dataset) return;
    const rowsToRemove = rowsRef.current.filter((row) => isEmptyCsvRow(row, dataset.columns));
    removeRows(rowsToRemove);
    toast.success(t('messages.rowsRemoved', { count: rowsToRemove.length }));
  };

  const handleRemoveDuplicateRows = () => {
    if (!dataset) return;
    const seen = new Set<string>();
    const duplicates = rowsRef.current.filter((row) => {
      const signature = getCsvRowSignature(row, dataset.columns);
      if (seen.has(signature)) return true;
      seen.add(signature);
      return false;
    });
    removeRows(duplicates);
    toast.success(t('messages.rowsRemoved', { count: duplicates.length }));
  };

  const handleCellValueChanged = (row: CsvGridRow, field: string, value: string) => {
    row[field] = value;
    bumpRevision();
  };

  const scrollTo = (ref: RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  return (
    <main className='flex min-h-[calc(100vh-3.5rem)] min-w-0 flex-col gap-4 bg-background p-4 md:p-6'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight'>{t('title')}</h1>
        <p className='mt-1 text-sm text-muted-foreground'>{t('description')}</p>
      </div>

      <input ref={fileInputRef} type='file' accept='.csv,text/csv' className='hidden' onChange={handleFileInputChange} />
      <CsvToolbar
        hasData={Boolean(dataset)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpen={() => fileInputRef.current?.click()}
        onDownload={handleDownload}
        onAddRow={handleAddRow}
        onDeleteRows={handleDeleteRows}
        onDuplicateRows={handleDuplicateRows}
        onRemoveEmptyRows={handleRemoveEmptyRows}
        onRemoveDuplicateRows={handleRemoveDuplicateRows}
        onShowStatistics={() => scrollTo(statisticsRef)}
        onShowSummary={() => scrollTo(summaryRef)}
        labels={labels.toolbar}
      />
      <CsvImportOptionsPanel
        options={importOptions}
        hasFile={Boolean(sourceFileRef.current)}
        isParsing={isParsing}
        onChange={setImportOptions}
        onApply={handleApplyImportOptions}
        labels={labels.importOptions}
      />

      {dataset ? (
        <div className='grid min-h-0 grid-cols-1 gap-4 xl:grid-cols-[220px_minmax(0,1fr)_220px]'>
          <aside ref={summaryRef} className='order-2 xl:order-1'>
            <CsvSummary summary={currentSummary} labels={labels.summary} />
          </aside>
          <section className='order-1 min-w-0 xl:order-2'>
            <CsvGrid
              columns={dataset.columns}
              rows={rowsRef.current}
              searchQuery={searchQuery}
              revision={revision}
              onGridReady={(api) => {
                gridApiRef.current = api;
              }}
              onCellValueChanged={handleCellValueChanged}
              onSelectionChanged={setSelectedRows}
              onColumnSelected={setSelectedColumn}
            />
          </section>
          <aside ref={statisticsRef} className='order-3'>
            <ColumnStatistics statistics={statistics} labels={labels.statistics} />
          </aside>
        </div>
      ) : (
        <section className='mx-auto flex w-full max-w-2xl flex-1 items-center justify-center'>
          <div className='w-full'>
            {isParsing ? (
              <div className='rounded-xl border bg-card p-12 text-center text-muted-foreground'>{t('messages.parsing')}</div>
            ) : (
              <CsvUploadZone
                onFileSelected={(file) => void handleFileSelected(file, importOptions)}
                labels={{
                  title: t('upload.title'),
                  hint: t('upload.hint'),
                  selectFile: t('upload.selectFile')
                }}
              />
            )}
            <p className='mt-4 text-center text-xs text-muted-foreground'>{t('privacyNote')}</p>
          </div>
        </section>
      )}
    </main>
  );
};

export default CsvToolkitPage;
