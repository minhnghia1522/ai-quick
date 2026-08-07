import { useMemo } from 'react';
import { calculateColumnStatistics } from '@/src/service/csv/csvStatistics';
import { ColumnStatistics, CsvColumn, CsvGridRow } from '@/src/types/csv';

export const useColumnStatistics = (
  column: CsvColumn | null,
  rows: CsvGridRow[],
  revision: number
): ColumnStatistics | null =>
  // The revision invalidates this memo when rows are mutated through the grid API.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => (column ? calculateColumnStatistics(column, rows) : null), [column, revision, rows]);
