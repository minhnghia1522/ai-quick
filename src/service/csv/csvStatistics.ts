import { ColumnStatistics, CsvColumn, CsvColumnType, CsvGridRow } from '@/src/types/csv';

const INTEGER_PATTERN = /^[-+]?\d+$/;
const DECIMAL_PATTERN = /^[-+]?(?:\d+\.\d+|\d+\.?\d*|\.\d+)$/;
const BOOLEAN_PATTERN = /^(true|false)$/i;

const isDateValue = (value: string): boolean => {
  if (!/^\d{4}[-/]\d{1,2}[-/]\d{1,2}(?:[T ]\d{1,2}:\d{2}(?::\d{2})?)?$/.test(value)) {
    return false;
  }

  return !Number.isNaN(Date.parse(value));
};

export const detectColumnType = (values: string[]): CsvColumnType => {
  const nonEmptyValues = values.map((value) => value.trim()).filter(Boolean);
  if (nonEmptyValues.length === 0) return 'String';
  if (nonEmptyValues.every((value) => INTEGER_PATTERN.test(value))) return 'Integer';
  if (nonEmptyValues.every((value) => DECIMAL_PATTERN.test(value))) return 'Decimal';
  if (nonEmptyValues.every((value) => BOOLEAN_PATTERN.test(value))) return 'Boolean';
  if (nonEmptyValues.every(isDateValue)) return 'Date';
  return 'String';
};

export const calculateColumnStatistics = (
  column: CsvColumn,
  rows: CsvGridRow[]
): ColumnStatistics => {
  const values = rows.map((row) => row[column.field] ?? '');
  const nonEmptyValues = values.map((value) => value.trim()).filter(Boolean);
  const lengths = values.map((value) => value.length);
  const maximumLength = lengths.reduce((maximum, length) => Math.max(maximum, length), 0);
  const minimumLength = lengths.reduce(
    (minimum, length) => Math.min(minimum, length),
    lengths.length > 0 ? lengths[0] : 0
  );

  return {
    columnName: column.headerName,
    detectedType: detectColumnType(values),
    emptyValues: values.length - nonEmptyValues.length,
    uniqueValues: new Set(nonEmptyValues).size,
    maximumLength,
    minimumLength
  };
};
