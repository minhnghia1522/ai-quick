import Papa, { ParseError, ParseResult } from 'papaparse';
import {
  CsvColumn,
  CsvDataset,
  CsvGridRow,
  CsvImportOptions,
  CsvParserResult,
  CsvValidationError
} from '@/src/types/csv';
import { createCsvRowId } from '@/src/utils/csv/csvRows';
import { validateCsvFile, validateCsvHeaders } from './csvValidation';

const createUniqueHeader = (rawHeader: string, index: number, usedHeaders: Set<string>): string => {
  const baseHeader = rawHeader.trim() || `Column ${index + 1}`;
  let header = baseHeader;
  let suffix = 2;

  while (usedHeaders.has(header)) {
    header = `${baseHeader} ${suffix}`;
    suffix += 1;
  }

  usedHeaders.add(header);
  return header;
};

const createFieldName = (index: number): string => `column_${index + 1}`;

const normalizeRows = (rawRows: string[][], columns: CsvColumn[]): CsvGridRow[] =>
  rawRows.map((rawRow) => {
    const row: Record<string, string> = { __csvRowId: createCsvRowId() };
    columns.forEach((column, index) => {
      row[column.field] = rawRow[index] ?? '';
    });
    return row as CsvGridRow;
  });

const getParseErrorMessage = (errors: ParseError[]): string => {
  const firstError = errors[0];
  return firstError?.message || 'The CSV file could not be parsed.';
};

const normalizeDelimiter = (delimiter: string): string => (delimiter === '\\t' ? '\t' : delimiter);

const getColumnCount = (rows: string[][]): number => rows.reduce((max, row) => Math.max(max, row.length), 0);

export const parseCsvFile = (file: File, options: CsvImportOptions): Promise<CsvParserResult> => {
  validateCsvFile(file);

  const delimiter = normalizeDelimiter(options.delimiter);
  if (!delimiter) {
    throw new CsvValidationError('invalid-delimiter', 'A delimiter is required.');
  }

  return new Promise((resolve, reject) => {
    Papa.parse<string[]>(file, {
      header: false,
      delimiter,
      encoding: options.encoding,
      // Do not turn the newline at the end of a CSV file into an extra data row.
      // Rows containing delimiters such as `,,` are still preserved for editing.
      skipEmptyLines: true,
      dynamicTyping: false,
      worker: true,
      complete: (results: ParseResult<string[]>) => {
        try {
          if (results.errors.length > 0) {
            throw new CsvValidationError('parse-failed', getParseErrorMessage(results.errors));
          }

          const [firstRow, ...remainingRows] = results.data;
          const rawRows = options.hasHeader ? remainingRows : results.data;
          const columnCount = options.hasHeader ? firstRow?.length ?? 0 : getColumnCount(rawRows);
          const headers = options.hasHeader
            ? firstRow ?? []
            : Array.from({ length: columnCount }, (_, index) => `Column ${index + 1}`);

          validateCsvHeaders(headers);

          const usedHeaders = new Set<string>();
          const columns = headers.map((header, index) => ({
            field: createFieldName(index),
            headerName: createUniqueHeader(header, index, usedHeaders)
          }));

          const dataset: CsvDataset = {
            columns,
            rows: normalizeRows(rawRows, columns),
            metadata: {
              fileName: file.name,
              fileSize: file.size,
              delimiter: results.meta.delimiter || delimiter,
              encoding: options.encoding,
              headerDetected: options.hasHeader
            }
          };

          resolve({ dataset, warnings: [] });
        } catch (error) {
          reject(error);
        }
      },
      error: (error: Error) => {
        reject(new CsvValidationError('parse-failed', error.message || 'The CSV file could not be parsed.'));
      }
    });
  });
};
