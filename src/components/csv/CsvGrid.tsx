'use client';

import { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  AllCommunityModule,
  CellKeyDownEvent,
  CellValueChangedEvent,
  ColDef,
  ColumnHeaderClickedEvent,
  GridApi,
  GridReadyEvent,
  ModuleRegistry,
  SelectionChangedEvent
} from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import './csvGridStyles.css';
import { useCsvSearch } from '@/src/hooks/csv/useCsvSearch';
import { CsvColumn, CsvGridRow } from '@/src/types/csv';

ModuleRegistry.registerModules([AllCommunityModule]);

interface CsvGridProps {
  columns: CsvColumn[];
  rows: CsvGridRow[];
  searchQuery: string;
  revision: number;
  onGridReady: (api: GridApi<CsvGridRow>) => void;
  onCellValueChanged: (row: CsvGridRow, field: string, value: string) => void;
  onSelectionChanged: (rows: CsvGridRow[]) => void;
  onColumnSelected: (column: CsvColumn) => void;
}

const CsvGrid = ({
  columns,
  rows,
  searchQuery,
  revision,
  onGridReady,
  onCellValueChanged,
  onSelectionChanged,
  onColumnSelected
}: CsvGridProps) => {
  const matchingRowIds = useCsvSearch(rows, columns, searchQuery, revision);
  const columnDefs = useMemo<ColDef<CsvGridRow>[]>(
    () =>
      columns.map((column) => ({
        field: column.field,
        headerName: column.headerName,
        editable: true,
        sortable: true,
        filter: 'agTextColumnFilter',
        resizable: true,
        minWidth: 120,
        flex: 1
      })),
    [columns]
  );

  const defaultColDef = useMemo<ColDef<CsvGridRow>>(
    () => ({
      editable: true,
      sortable: true,
      filter: true,
      resizable: true,
      suppressHeaderMenuButton: false
    }),
    []
  );

  const getRowClass = (params: { data?: CsvGridRow }): string | undefined => {
    return params.data && matchingRowIds.has(params.data.__csvRowId) ? 'csv-search-match' : undefined;
  };

  const handleGridReady = (event: GridReadyEvent<CsvGridRow>) => onGridReady(event.api);

  const handleCellValueChanged = (event: CellValueChangedEvent<CsvGridRow>) => {
    if (!event.data || !event.colDef.field) return;
    onCellValueChanged(event.data, event.colDef.field, String(event.newValue ?? ''));
  };

  const handleSelectionChanged = (event: SelectionChangedEvent<CsvGridRow>) => {
    onSelectionChanged(event.api.getSelectedRows());
  };

  const handleColumnHeaderClicked = (event: ColumnHeaderClickedEvent<CsvGridRow>) => {
    const field = event.column && 'getColDef' in event.column ? event.column.getColDef().field : undefined;
    const column = columns.find((item) => item.field === field);
    if (column) onColumnSelected(column);
  };

  const handleCellKeyDown = (event: CellKeyDownEvent<CsvGridRow>) => {
    const keyboardEvent = event.event;
    if (!(keyboardEvent instanceof KeyboardEvent)) return;
    if (!['Delete', 'Backspace'].includes(keyboardEvent.key) || !event.data || !event.colDef.field) return;
    event.node.setDataValue(event.colDef.field, '');
    keyboardEvent.preventDefault();
  };

  return (
    <div className='ag-theme-quartz h-[min(68vh,720px)] min-h-[420px] w-full overflow-hidden rounded-lg border'>
      <AgGridReact<CsvGridRow>
        theme='legacy'
        rowData={rows}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        getRowId={(params) => params.data.__csvRowId}
        getRowClass={getRowClass}
        rowSelection={{
          mode: 'multiRow',
          checkboxes: true,
          headerCheckbox: true,
          enableClickSelection: true,
          copySelectedRows: true
        }}
        pagination={true}
        paginationPageSize={100}
        paginationPageSizeSelector={[50, 100, 250, 500]}
        animateRows={false}
        enableCellTextSelection={true}
        onGridReady={handleGridReady}
        onCellValueChanged={handleCellValueChanged}
        onSelectionChanged={handleSelectionChanged}
        onColumnHeaderClicked={handleColumnHeaderClicked}
        onCellKeyDown={handleCellKeyDown}
      />
    </div>
  );
};

export default CsvGrid;
