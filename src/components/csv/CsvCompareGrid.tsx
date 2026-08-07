'use client';

import { useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  AllCommunityModule,
  BodyScrollEvent,
  ColDef,
  GridApi,
  GridReadyEvent,
  ModuleRegistry,
  PaginationChangedEvent
} from 'ag-grid-community';
import type { CsvCompareRow, CsvCompareRowStatus } from '@/src/types/csv';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import './csvGridStyles.css';

ModuleRegistry.registerModules([AllCommunityModule]);

interface CsvCompareGridProps {
  rows: CsvCompareRow[];
  columns: string[];
  labels: {
    row: string;
    status: string;
    leftTitle: string;
    rightTitle: string;
    horizontalScroll: string;
    statuses: Record<CsvCompareRowStatus, string>;
  };
}

const createColumnDefs = (
  columns: string[],
  side: 'left' | 'right',
  labels: CsvCompareGridProps['labels']
): ColDef<CsvCompareRow>[] => [
  {
    field: 'rowNumber',
    headerName: labels.row,
    pinned: 'left',
    width: 76,
    sortable: true,
    filter: 'agNumberColumnFilter',
    resizable: true
  },
  {
    field: 'status',
    headerName: labels.status,
    pinned: 'left',
    width: 112,
    sortable: true,
    filter: 'agTextColumnFilter',
    resizable: true,
    valueFormatter: (params) => labels.statuses[params.value as CsvCompareRowStatus] ?? String(params.value ?? ''),
    cellClass: (params) => `csv-difference-${String(params.value ?? '')}`
  },
  ...columns.map((column) => ({
    colId: column,
    headerName: column,
    width: 180,
    sortable: true,
    filter: 'agTextColumnFilter',
    resizable: true,
    valueGetter: (params: { data?: CsvCompareRow }) =>
      params.data?.[side === 'left' ? 'leftValues' : 'rightValues'][column] ?? '',
    cellClass: (params: { data?: CsvCompareRow }) =>
      params.data?.changedColumns.includes(column)
        ? `csv-difference-cell csv-difference-${side}`
        : undefined
  }))
];

const getScrollViewport = (root: HTMLDivElement | null, selector: string): HTMLElement | null =>
  root?.querySelector<HTMLElement>(selector) ?? null;

const CsvCompareGrid = ({ rows, columns, labels }: CsvCompareGridProps) => {
  const leftGridRef = useRef<HTMLDivElement>(null);
  const rightGridRef = useRef<HTMLDivElement>(null);
  const leftApiRef = useRef<GridApi<CsvCompareRow> | null>(null);
  const rightApiRef = useRef<GridApi<CsvCompareRow> | null>(null);
  const leftAlignedGridRef = useRef<{ api: GridApi<CsvCompareRow> | null }>({ api: null });
  const rightAlignedGridRef = useRef<{ api: GridApi<CsvCompareRow> | null }>({ api: null });
  const isSyncingVerticalScrollRef = useRef(false);
  const isSyncingPaginationRef = useRef(false);

  const leftColumnDefs = useMemo(() => createColumnDefs(columns, 'left', labels), [columns, labels]);
  const rightColumnDefs = useMemo(() => createColumnDefs(columns, 'right', labels), [columns, labels]);

  const finishVerticalSync = () => {
    window.requestAnimationFrame(() => {
      isSyncingVerticalScrollRef.current = false;
    });
  };

  const syncVerticalScroll = (event: BodyScrollEvent<CsvCompareRow>, targetGrid: HTMLDivElement | null) => {
    if (event.direction !== 'vertical' || isSyncingVerticalScrollRef.current) return;

    const targetViewport = getScrollViewport(targetGrid, '.ag-body-viewport');
    if (!targetViewport || targetViewport.scrollTop === event.top) return;

    isSyncingVerticalScrollRef.current = true;
    targetViewport.scrollTop = event.top;
    finishVerticalSync();
  };

  const handleLeftBodyScroll = (event: BodyScrollEvent<CsvCompareRow>) => {
    syncVerticalScroll(event, rightGridRef.current);
  };

  const handleRightBodyScroll = (event: BodyScrollEvent<CsvCompareRow>) => {
    syncVerticalScroll(event, leftGridRef.current);
  };

  const syncPagination = (source: GridApi<CsvCompareRow>, target: GridApi<CsvCompareRow>) => {
    if (isSyncingPaginationRef.current) return;
    const page = source.paginationGetCurrentPage();
    if (target.paginationGetCurrentPage() === page) return;

    isSyncingPaginationRef.current = true;
    target.paginationGoToPage(page);
    window.setTimeout(() => {
      isSyncingPaginationRef.current = false;
    }, 0);
  };

  const handleLeftPaginationChanged = (event: PaginationChangedEvent<CsvCompareRow>) => {
    if (rightApiRef.current) syncPagination(event.api, rightApiRef.current);
  };

  const handleRightPaginationChanged = (event: PaginationChangedEvent<CsvCompareRow>) => {
    if (leftApiRef.current) syncPagination(event.api, leftApiRef.current);
  };

  const handleLeftGridReady = (event: GridReadyEvent<CsvCompareRow>) => {
    leftApiRef.current = event.api;
    leftAlignedGridRef.current.api = event.api;
  };

  const handleRightGridReady = (event: GridReadyEvent<CsvCompareRow>) => {
    rightApiRef.current = event.api;
    rightAlignedGridRef.current.api = event.api;
  };

  return (
    <div className='csv-compare-shell'>
      <div className='csv-compare-split-grid'>
        <section ref={leftGridRef} className='csv-compare-pane min-w-0'>
          <div className='csv-compare-pane-title'>{labels.leftTitle}</div>
          <div className='ag-theme-quartz h-[min(68vh,720px)] min-h-[420px] w-full overflow-hidden rounded-lg border'>
            <AgGridReact<CsvCompareRow>
              theme='legacy'
              rowData={rows}
              columnDefs={leftColumnDefs}
              alignedGrids={() => [rightAlignedGridRef]}
              defaultColDef={{ sortable: true, filter: true, resizable: true }}
              getRowId={(params) => params.data.id}
              getRowClass={(params) =>
                params.data && params.data.status !== 'unchanged' ? `csv-compare-row-${params.data.status}` : undefined
              }
              pagination={true}
              paginationPageSize={100}
              paginationPageSizeSelector={[50, 100, 250, 500]}
              alwaysShowHorizontalScroll={true}
              animateRows={false}
              enableCellTextSelection={true}
              onBodyScroll={handleLeftBodyScroll}
              onGridReady={handleLeftGridReady}
              onPaginationChanged={handleLeftPaginationChanged}
            />
          </div>
        </section>
        <div className='csv-compare-split-divider' aria-hidden='true' />
        <section ref={rightGridRef} className='csv-compare-pane min-w-0'>
          <div className='csv-compare-pane-title'>{labels.rightTitle}</div>
          <div className='ag-theme-quartz h-[min(68vh,720px)] min-h-[420px] w-full overflow-hidden rounded-lg border'>
            <AgGridReact<CsvCompareRow>
              theme='legacy'
              rowData={rows}
              columnDefs={rightColumnDefs}
              alignedGrids={() => [leftAlignedGridRef]}
              defaultColDef={{ sortable: true, filter: true, resizable: true }}
              getRowId={(params) => params.data.id}
              getRowClass={(params) =>
                params.data && params.data.status !== 'unchanged' ? `csv-compare-row-${params.data.status}` : undefined
              }
              pagination={true}
              paginationPageSize={100}
              paginationPageSizeSelector={[50, 100, 250, 500]}
              alwaysShowHorizontalScroll={true}
              animateRows={false}
              enableCellTextSelection={true}
              onBodyScroll={handleRightBodyScroll}
              onGridReady={handleRightGridReady}
              onPaginationChanged={handleRightPaginationChanged}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default CsvCompareGrid;
