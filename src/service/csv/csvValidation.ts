import { CsvValidationError } from '@/src/types/csv';

export const validateCsvFile = (file: File): void => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension !== 'csv') {
    throw new CsvValidationError('unsupported-file', 'Only CSV files are supported.');
  }

  if (file.size === 0) {
    throw new CsvValidationError('empty-file', 'The selected CSV file is empty.');
  }
};

export const validateCsvHeaders = (headers: string[]): void => {
  if (headers.length === 0 || headers.every((header) => header.trim() === '')) {
    throw new CsvValidationError('empty-header', 'The CSV file does not contain a valid header row.');
  }
};
