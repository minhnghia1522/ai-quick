export type CsvColumnType = 'Integer' | 'Decimal' | 'Boolean' | 'Date' | 'String';

export interface CsvImportOptions {
  encoding: string;
  delimiter: string;
  hasHeader: boolean;
}

export const DEFAULT_CSV_IMPORT_OPTIONS: CsvImportOptions = {
  encoding: 'UTF-8',
  delimiter: ',',
  hasHeader: true
};

export const CSV_ENCODINGS = [
  { value: 'UTF-8', label: 'UTF-8' },
  { value: 'UTF-16LE', label: 'UTF-16 LE' },
  { value: 'UTF-16BE', label: 'UTF-16 BE' },
  { value: 'windows-1252', label: 'Windows-1252' },
  { value: 'ISO-8859-1', label: 'ISO-8859-1' },
  { value: 'Shift_JIS', label: 'Shift_JIS' }
] as const;

export type CsvGridRow = Record<string, string> & {
  __csvRowId: string;
};

export interface CsvColumn {
  field: string;
  headerName: string;
}

export interface CsvFileMetadata {
  fileName: string;
  fileSize: number;
  delimiter: string;
  encoding: string;
  headerDetected: boolean;
}

export interface CsvDataset {
  columns: CsvColumn[];
  rows: CsvGridRow[];
  metadata: CsvFileMetadata;
}

export interface CsvSummary extends CsvFileMetadata {
  totalRows: number;
  totalColumns: number;
}

export interface ColumnStatistics {
  columnName: string;
  detectedType: CsvColumnType;
  emptyValues: number;
  uniqueValues: number;
  maximumLength: number;
  minimumLength: number;
}

export interface CsvParserResult {
  dataset: CsvDataset;
  warnings: string[];
}

export type CsvDifferenceStatus = 'added' | 'removed' | 'modified';

export type CsvCompareRowStatus = CsvDifferenceStatus | 'unchanged';

export interface CsvDifference {
  id: string;
  rowNumber: number;
  columnName: string;
  status: CsvDifferenceStatus;
  leftValue: string;
  rightValue: string;
}

export interface CsvCompareRow {
  id: string;
  rowNumber: number;
  leftValues: Record<string, string>;
  rightValues: Record<string, string>;
  changedColumns: string[];
  status: CsvCompareRowStatus;
}

export interface CsvCompareResult {
  rows: CsvCompareRow[];
  columns: string[];
  differences: CsvDifference[];
  totalRows: number;
  totalColumns: number;
  addedRows: number;
  removedRows: number;
  modifiedRows: number;
  unchangedRows: number;
  differentCells: number;
}

export type CsvValidationErrorCode = 'unsupported-file' | 'empty-file' | 'empty-header' | 'invalid-delimiter' | 'parse-failed';

export class CsvValidationError extends Error {
  readonly code: CsvValidationErrorCode;

  constructor(code: CsvValidationErrorCode, message: string) {
    super(message);
    this.name = 'CsvValidationError';
    this.code = code;
  }
}
