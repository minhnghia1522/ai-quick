import { CsvCompareResult, CsvCompareRow, CsvDataset, CsvDifference, CsvGridRow } from '@/src/types/csv';

interface ComparisonColumn {
  name: string;
  leftField?: string;
  rightField?: string;
}

const getColumnsByName = (dataset: CsvDataset): Map<string, string> =>
  new Map(dataset.columns.map((column) => [column.headerName, column.field]));

const createComparisonColumns = (left: CsvDataset, right: CsvDataset): ComparisonColumn[] => {
  const leftColumns = getColumnsByName(left);
  const rightColumns = getColumnsByName(right);
  const names = [...left.columns.map((column) => column.headerName)];

  right.columns.forEach((column) => {
    if (!leftColumns.has(column.headerName)) names.push(column.headerName);
  });

  return names.map((name) => ({
    name,
    leftField: leftColumns.get(name),
    rightField: rightColumns.get(name)
  }));
};

const getCellValue = (row: CsvGridRow | undefined, field: string | undefined): string => {
  if (!row || !field) return '';
  return row[field] ?? '';
};

const createDifference = (
  rowNumber: number,
  columnName: string,
  status: CsvDifference['status'],
  leftValue: string,
  rightValue: string,
  index: number
): CsvDifference => ({
  id: `difference-${rowNumber}-${index}`,
  rowNumber,
  columnName,
  status,
  leftValue,
  rightValue
});

const createValues = (
  row: CsvGridRow | undefined,
  columns: ComparisonColumn[],
  side: 'left' | 'right'
): Record<string, string> =>
  Object.fromEntries(
    columns.map((column) => [column.name, getCellValue(row, side === 'left' ? column.leftField : column.rightField)])
  );

const createDifferenceRows = (
  rowNumber: number,
  status: CsvDifference['status'],
  leftRow: CsvGridRow | undefined,
  rightRow: CsvGridRow | undefined,
  columns: ComparisonColumn[],
  differences: CsvDifference[]
): string[] => {
  const changedColumns: string[] = [];

  columns.forEach((column, columnIndex) => {
    const leftValue = getCellValue(leftRow, column.leftField);
    const rightValue = getCellValue(rightRow, column.rightField);
    if (status === 'modified' && leftValue === rightValue) return;

    changedColumns.push(column.name);
    differences.push(
      createDifference(rowNumber, column.name, status, leftValue, rightValue, differences.length + columnIndex)
    );
  });

  return changedColumns;
};

export const compareCsvDatasets = (left: CsvDataset, right: CsvDataset): CsvCompareResult => {
  const comparisonColumns = createComparisonColumns(left, right);
  const totalRows = Math.max(left.rows.length, right.rows.length);
  const rows: CsvCompareRow[] = [];
  const differences: CsvDifference[] = [];
  let addedRows = 0;
  let removedRows = 0;
  let modifiedRows = 0;
  let unchangedRows = 0;

  for (let rowIndex = 0; rowIndex < totalRows; rowIndex += 1) {
    const leftRow = left.rows[rowIndex];
    const rightRow = right.rows[rowIndex];

    if (!leftRow && rightRow) {
      addedRows += 1;
      const changedColumns = createDifferenceRows(rowIndex + 1, 'added', leftRow, rightRow, comparisonColumns, differences);
      rows.push({
        id: `compare-row-${rowIndex + 1}`,
        rowNumber: rowIndex + 1,
        leftValues: createValues(leftRow, comparisonColumns, 'left'),
        rightValues: createValues(rightRow, comparisonColumns, 'right'),
        changedColumns,
        status: 'added'
      });
      continue;
    }

    if (leftRow && !rightRow) {
      removedRows += 1;
      const changedColumns = createDifferenceRows(rowIndex + 1, 'removed', leftRow, rightRow, comparisonColumns, differences);
      rows.push({
        id: `compare-row-${rowIndex + 1}`,
        rowNumber: rowIndex + 1,
        leftValues: createValues(leftRow, comparisonColumns, 'left'),
        rightValues: createValues(rightRow, comparisonColumns, 'right'),
        changedColumns,
        status: 'removed'
      });
      continue;
    }

    const rowDifferences = comparisonColumns.filter(
      (column) => getCellValue(leftRow, column.leftField) !== getCellValue(rightRow, column.rightField)
    );

    if (rowDifferences.length === 0) {
      unchangedRows += 1;
      rows.push({
        id: `compare-row-${rowIndex + 1}`,
        rowNumber: rowIndex + 1,
        leftValues: createValues(leftRow, comparisonColumns, 'left'),
        rightValues: createValues(rightRow, comparisonColumns, 'right'),
        changedColumns: [],
        status: 'unchanged'
      });
      continue;
    }

    modifiedRows += 1;
    const changedColumns = createDifferenceRows(rowIndex + 1, 'modified', leftRow, rightRow, comparisonColumns, differences);
    rows.push({
      id: `compare-row-${rowIndex + 1}`,
      rowNumber: rowIndex + 1,
      leftValues: createValues(leftRow, comparisonColumns, 'left'),
      rightValues: createValues(rightRow, comparisonColumns, 'right'),
      changedColumns,
      status: 'modified'
    });
  }

  return {
    rows,
    columns: comparisonColumns.map((column) => column.name),
    differences,
    totalRows,
    totalColumns: comparisonColumns.length,
    addedRows,
    removedRows,
    modifiedRows,
    unchangedRows,
    differentCells: differences.length
  };
};
