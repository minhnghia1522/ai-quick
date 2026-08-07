import Papa from 'papaparse';
import { CsvColumn, CsvGridRow } from '@/src/types/csv';

export const exportCsv = (
  columns: CsvColumn[],
  rows: CsvGridRow[],
  fileName: string,
  delimiter = ',',
  includeHeader = true
): void => {
  const data = rows.map((row) => {
    const values: Record<string, string> = {};
    columns.forEach((column) => {
      values[column.headerName] = row[column.field] ?? '';
    });
    return values;
  });

  const csv = Papa.unparse(data, {
    delimiter,
    newline: '\r\n',
    header: includeHeader
  });
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName.toLowerCase().endsWith('.csv') ? fileName : `${fileName}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
};
