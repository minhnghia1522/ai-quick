import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/src/lib/utils';

type MarkdownPreviewProps = {
  content: string;
  className?: string;
};

type MarkdownTableContextValue = {
  widths: number[];
  registerColumnCount: (count: number) => void;
  startColumnResize: (columnIndex: number, event: React.PointerEvent<HTMLButtonElement>) => void;
};

type MarkdownTableCellProps = React.ThHTMLAttributes<HTMLTableCellElement> &
  React.TdHTMLAttributes<HTMLTableCellElement> & {
    columnIndex?: number;
  };

const MIN_TABLE_WIDTH = 520;
const DEFAULT_COLUMN_WIDTH = 160;
const MIN_COLUMN_WIDTH = 96;

const MarkdownTableContext = React.createContext<MarkdownTableContextValue | null>(null);

const ResizableMarkdownTable = ({ children }: { children: React.ReactNode }) => {
  const [widths, setWidths] = useState<number[]>([]);
  const activeResizeCleanupRef = useRef<(() => void) | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const widthsRef = useRef(widths);

  useEffect(() => {
    widthsRef.current = widths;
  }, [widths]);

  useEffect(() => {
    return () => {
      activeResizeCleanupRef.current?.();
    };
  }, []);

  const registerColumnCount = useCallback((count: number) => {
    setWidths((prevWidths) => {
      if (count <= prevWidths.length) return prevWidths;

      return [
        ...prevWidths,
        ...Array.from({ length: count - prevWidths.length }, () => DEFAULT_COLUMN_WIDTH)
      ];
    });
  }, []);

  const startColumnResize = useCallback((columnIndex: number, event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    activeResizeCleanupRef.current?.();

    const startX = event.clientX;
    const resizeHandle = event.currentTarget;
    const firstRow = tableRef.current?.querySelector('tr');
    const measuredWidths = firstRow
      ? Array.from(firstRow.children).map((cell) => cell.getBoundingClientRect().width)
      : [];
    const baseWidths = measuredWidths.length > 0 ? measuredWidths : widthsRef.current;
    const startWidth = baseWidths[columnIndex] ?? DEFAULT_COLUMN_WIDTH;
    const nextColumnIndex = columnIndex + 1;
    const nextStartWidth = baseWidths[nextColumnIndex];
    const previousUserSelect = document.body.style.userSelect;
    const previousCursor = document.body.style.cursor;

    if (typeof nextStartWidth !== 'number') return;

    if (measuredWidths.length > 0) {
      widthsRef.current = measuredWidths;
      setWidths(measuredWidths);
    }

    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    resizeHandle.setPointerCapture(event.pointerId);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const delta = moveEvent.clientX - startX;
      const clampedDelta = Math.min(
        Math.max(delta, MIN_COLUMN_WIDTH - startWidth),
        nextStartWidth - MIN_COLUMN_WIDTH
      );

      setWidths((prevWidths) => {
        const nextWidths = [...(prevWidths.length > 0 ? prevWidths : baseWidths)];
        nextWidths[columnIndex] = startWidth + clampedDelta;
        nextWidths[nextColumnIndex] = nextStartWidth - clampedDelta;
        return nextWidths;
      });
    };

    const cleanupResize = () => {
      if (resizeHandle.hasPointerCapture(event.pointerId)) {
        resizeHandle.releasePointerCapture(event.pointerId);
      }

      document.body.style.userSelect = previousUserSelect;
      document.body.style.cursor = previousCursor;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', cleanupResize);
      window.removeEventListener('pointercancel', cleanupResize);
      window.removeEventListener('blur', cleanupResize);
      activeResizeCleanupRef.current = null;
    };

    activeResizeCleanupRef.current = cleanupResize;
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', cleanupResize);
    window.addEventListener('pointercancel', cleanupResize);
    window.addEventListener('blur', cleanupResize);
  }, []);

  const tableMinWidth = useMemo(
    () => Math.max(MIN_TABLE_WIDTH, widths.reduce((total, width) => total + width, 0)),
    [widths]
  );

  const contextValue = useMemo(
    () => ({
      widths,
      registerColumnCount,
      startColumnResize
    }),
    [registerColumnCount, startColumnResize, widths]
  );

  return (
    <div className='mb-3 w-full max-w-full overflow-x-auto rounded-md border last:mb-0'>
      <MarkdownTableContext.Provider value={contextValue}>
        <table
          ref={tableRef}
          className='w-full table-fixed border-collapse text-left'
          style={{ minWidth: tableMinWidth }}
        >
          {widths.length > 0 ? (
            <colgroup>
              {widths.map((width, index) => (
                <col key={index} style={{ width }} />
              ))}
            </colgroup>
          ) : undefined}
          {children}
        </table>
      </MarkdownTableContext.Provider>
    </div>
  );
};

const MarkdownTableRow = ({ children }: { children: React.ReactNode }) => {
  const context = React.useContext(MarkdownTableContext);
  const registerColumnCount = context?.registerColumnCount;
  let columnCount = 0;

  const indexedChildren = React.Children.toArray(children).map((child) => {
    if (!React.isValidElement<MarkdownTableCellProps>(child)) return child;

    const columnIndex = columnCount;
    columnCount += 1;

    return React.cloneElement(child, { columnIndex });
  });

  useEffect(() => {
    registerColumnCount?.(columnCount);
  }, [columnCount, registerColumnCount]);

  return <tr>{indexedChildren}</tr>;
};

const MarkdownTableHeaderCell = ({ children, columnIndex, className, ...props }: MarkdownTableCellProps) => {
  const context = React.useContext(MarkdownTableContext);
  const isResizable = context && typeof columnIndex === 'number' && columnIndex < context.widths.length - 1;

  return (
    <th
      className={cn('relative break-words border-b px-3 py-2 pr-5 text-xs font-semibold uppercase', className)}
      {...props}
    >
      {children}
      {isResizable ? (
        <button
          type='button'
          aria-label='Resize column'
          title='Resize column'
          className='absolute inset-y-1 right-0 w-2 touch-none cursor-col-resize rounded-sm border-r-2 border-transparent hover:border-blue-400 focus:border-blue-500 focus:outline-none'
          onPointerDown={(event) => context.startColumnResize(columnIndex, event)}
        />
      ) : undefined}
    </th>
  );
};

const MarkdownTableCell = ({ children, columnIndex: _columnIndex, className, ...props }: MarkdownTableCellProps) => (
  <td className={cn('break-words border-t px-3 py-2 align-top', className)} {...props}>
    {children}
  </td>
);

const MarkdownPreview = ({ content, className }: MarkdownPreviewProps) => (
  <div className={cn('w-full min-w-0 overflow-x-auto text-sm leading-relaxed text-foreground', className)}>
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <h1 className='mb-3 mt-0 text-xl font-semibold leading-tight'>{children}</h1>,
        h2: ({ children }) => <h2 className='mb-2 mt-4 text-lg font-semibold leading-tight'>{children}</h2>,
        h3: ({ children }) => <h3 className='mb-2 mt-3 text-base font-semibold leading-tight'>{children}</h3>,
        p: ({ children }) => <p className='mb-3 whitespace-pre-wrap last:mb-0'>{children}</p>,
        ul: ({ children }) => <ul className='mb-3 list-disc space-y-1 pl-5 last:mb-0'>{children}</ul>,
        ol: ({ children }) => <ol className='mb-3 list-decimal space-y-1 pl-5 last:mb-0'>{children}</ol>,
        li: ({ children }) => <li className='pl-1'>{children}</li>,
        blockquote: ({ children }) => (
          <blockquote className='mb-3 border-l-4 border-border pl-3 text-muted-foreground last:mb-0'>
            {children}
          </blockquote>
        ),
        a: ({ children, href }) => (
          <a
            className='text-blue-600 underline underline-offset-2 hover:text-blue-700'
            href={href}
            target='_blank'
            rel='noreferrer'
          >
            {children}
          </a>
        ),
        table: ({ children }) => <ResizableMarkdownTable>{children}</ResizableMarkdownTable>,
        thead: ({ children }) => <thead className='bg-muted/70'>{children}</thead>,
        tr: ({ children }) => <MarkdownTableRow>{children}</MarkdownTableRow>,
        th: ({ children, ...props }) => <MarkdownTableHeaderCell {...props}>{children}</MarkdownTableHeaderCell>,
        td: ({ children, ...props }) => <MarkdownTableCell {...props}>{children}</MarkdownTableCell>,
        pre: ({ children }) => (
          <pre className='mb-3 overflow-x-auto rounded-md bg-slate-950 p-3 text-slate-50 last:mb-0'>{children}</pre>
        ),
        code: ({ children, className }) => (
          <code
            className={cn(
              'rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]',
              className?.startsWith('language-') && 'bg-transparent p-0 text-inherit'
            )}
          >
            {children}
          </code>
        )
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
);

export default MarkdownPreview;
