import { CsvColumn, CsvGridRow } from '@/src/types/csv';

export const INTERNAL_ROW_ID_FIELD = '__csvRowId';

export const createCsvRowId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const createEmptyCsvRow = (columns: CsvColumn[]): CsvGridRow => {
  const row: Record<string, string> = {
    [INTERNAL_ROW_ID_FIELD]: createCsvRowId()
  };

  columns.forEach((column) => {
    row[column.field] = '';
  });

  return row as CsvGridRow;
};

export const isEmptyCsvRow = (row: CsvGridRow, columns: CsvColumn[]): boolean =>
  columns.every((column) => row[column.field].trim() === '');

export const getCsvRowSignature = (row: CsvGridRow, columns: CsvColumn[]): string =>
  columns.map((column) => row[column.field]).join('\u001f');

export const stripInternalRowId = (row: CsvGridRow, columns: CsvColumn[]): Record<string, string> => {
  const values: Record<string, string> = {};
  columns.forEach((column) => {
    values[column.headerName] = row[column.field] ?? '';
  });
  return values;
};
