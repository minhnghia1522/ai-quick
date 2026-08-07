import { useMemo } from 'react';
import { CsvColumn, CsvGridRow } from '@/src/types/csv';

export const useCsvSearch = (rows: CsvGridRow[], columns: CsvColumn[], query: string, revision: number): Set<string> => {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  return useMemo(() => {
    if (!normalizedQuery) return new Set<string>();

    const matchingRowIds = new Set<string>();
    rows.forEach((row) => {
      const matches = columns.some((column) => row[column.field].toLocaleLowerCase().includes(normalizedQuery));
      if (matches) matchingRowIds.add(row.__csvRowId);
    });
    return matchingRowIds;
  // The revision invalidates this memo when edited row values are mutated in place.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns, normalizedQuery, revision, rows]);
};
