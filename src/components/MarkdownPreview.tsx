import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/src/lib/utils';

type MarkdownPreviewProps = {
  content: string;
  className?: string;
  useParentHorizontalScroll?: boolean;
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

const DEFAULT_COLUMN_WIDTH = 160;
const MIN_COLUMN_WIDTH = 96;
const MAX_AUTO_COLUMN_WIDTH = 520;

const areColumnWidthsEqual = (left: number[], right: number[]) =>
  left.length === right.length && left.every((width, index) => Math.abs(width - right[index]) < 1);

const measureAutoColumnWidths = (table: HTMLTableElement) => {
  const columnWidths: number[] = [];
  const probe = document.createElement('div');

  probe.style.position = 'absolute';
  probe.style.left = '-99999px';
  probe.style.top = '0';
  probe.style.visibility = 'hidden';
  probe.style.pointerEvents = 'none';
  probe.style.width = 'max-content';
  probe.style.maxWidth = 'none';
  probe.style.whiteSpace = 'nowrap';
  document.body.appendChild(probe);

  Array.from(table.rows).forEach((row) => {
    Array.from(row.cells).forEach((cell, columnIndex) => {
      const computedStyle = window.getComputedStyle(cell);
      const horizontalPadding =
        parseFloat(computedStyle.paddingLeft) +
        parseFloat(computedStyle.paddingRight) +
        parseFloat(computedStyle.borderLeftWidth) +
        parseFloat(computedStyle.borderRightWidth);

      probe.replaceChildren(
        ...Array.from(cell.childNodes)
          .filter((node) => !(node instanceof HTMLButtonElement))
          .map((node) => node.cloneNode(true))
      );
      probe.style.font = computedStyle.font;
      probe.style.letterSpacing = computedStyle.letterSpacing;
      probe.style.textTransform = computedStyle.textTransform;

      const measuredWidth = Math.ceil(probe.getBoundingClientRect().width + horizontalPadding + 2);
      const clampedWidth = Math.min(Math.max(measuredWidth, MIN_COLUMN_WIDTH), MAX_AUTO_COLUMN_WIDTH);
      columnWidths[columnIndex] = Math.max(columnWidths[columnIndex] ?? 0, clampedWidth);
    });
  });

  probe.remove();

  return columnWidths;
};

const MarkdownTableContext = React.createContext<MarkdownTableContextValue | null>(null);

const ResizableMarkdownTable = ({
  children,
  useParentHorizontalScroll = false
}: {
  children: React.ReactNode;
  useParentHorizontalScroll?: boolean;
}) => {
  const [widths, setWidths] = useState<number[]>([]);
  const activeResizeCleanupRef = useRef<(() => void) | null>(null);
  const hasUserResizedRef = useRef(false);
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
      if (count < prevWidths.length && !hasUserResizedRef.current) {
        return prevWidths.slice(0, count);
      }

      if (count <= prevWidths.length) return prevWidths;
      if (!hasUserResizedRef.current) return prevWidths;

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
    hasUserResizedRef.current = true;

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

  useEffect(() => {
    if (hasUserResizedRef.current) return;

    const table = tableRef.current;
    if (!table) return;

    const measureColumns = () => {
      const measuredWidths = measureAutoColumnWidths(table);
      if (measuredWidths.length === 0) return;

      setWidths((prevWidths) =>
        areColumnWidthsEqual(prevWidths, measuredWidths) ? prevWidths : measuredWidths
      );
    };

    const animationFrameId = window.requestAnimationFrame(measureColumns);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [children]);

  const tableWidth = useMemo(
    () => widths.reduce((total, width) => total + width, 0),
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
    <div
      className={cn(
        'mb-3 rounded-md border last:mb-0',
        useParentHorizontalScroll
          ? 'w-max min-w-full max-w-none'
          : 'w-full max-w-full overflow-x-auto'
      )}
    >
      <MarkdownTableContext.Provider value={contextValue}>
        <table
          ref={tableRef}
          className={cn(
            'border-collapse text-left',
            widths.length > 0 ? 'table-fixed' : 'w-max min-w-full table-auto'
          )}
          style={widths.length > 0 ? { width: tableWidth } : undefined}
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

const renderTableCellContent = (children: React.ReactNode) =>
  React.Children.toArray(children).flatMap((child, childIndex) => {
    if (typeof child !== 'string') return child;

    const parts = child.split(/<br\s*\/?>/i);

    return parts.flatMap((part, partIndex) =>
      partIndex === 0 ? part : [<br key={`br-${childIndex}-${partIndex}`} />, part]
    );
  });

const MarkdownTableHeaderCell = ({ children, columnIndex, className, ...props }: MarkdownTableCellProps) => {
  const context = React.useContext(MarkdownTableContext);
  const isResizable = context && typeof columnIndex === 'number' && columnIndex < context.widths.length - 1;

  return (
    <th
      className={cn('relative break-words border-b px-3 py-2 pr-5 text-xs font-semibold uppercase', className)}
      {...props}
    >
      {renderTableCellContent(children)}
      {isResizable ? (
        <button
          type='button'
          aria-label='Resize column'
          title='Resize column'
          className='absolute inset-y-0 right-0 z-10 w-3 translate-x-1/2 touch-none cursor-col-resize rounded-sm focus:outline-none before:absolute before:inset-y-1 before:left-1/2 before:w-px before:-translate-x-1/2 before:bg-slate-500 before:transition-colors hover:before:bg-blue-400 focus:before:bg-blue-500'
          onPointerDown={(event) => context.startColumnResize(columnIndex, event)}
        />
      ) : undefined}
    </th>
  );
};

const MarkdownTableCell = ({ children, columnIndex: _columnIndex, className, ...props }: MarkdownTableCellProps) => (
  <td className={cn('break-words border-t px-3 py-2 align-top', className)} {...props}>
    {renderTableCellContent(children)}
  </td>
);

const MarkdownPreview = ({ content, className, useParentHorizontalScroll = false }: MarkdownPreviewProps) => (
  <div
    className={cn(
      'w-full max-w-full min-w-0 text-sm leading-relaxed text-foreground',
      !useParentHorizontalScroll && 'overflow-x-auto',
      className
    )}
  >
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <h1 className='mb-3 mt-0 text-xl font-semibold leading-tight'>{children}</h1>,
        h2: ({ children }) => <h2 className='mb-2 mt-4 text-lg font-semibold leading-tight'>{children}</h2>,
        h3: ({ children }) => <h3 className='mb-2 mt-3 text-base font-semibold leading-tight'>{children}</h3>,
        p: ({ children }) => <p className='mb-3 max-w-full whitespace-pre-wrap break-words last:mb-0'>{children}</p>,
        ul: ({ children }) => <ul className='mb-3 list-disc space-y-1 pl-5 last:mb-0'>{children}</ul>,
        ol: ({ children }) => <ol className='mb-3 list-decimal space-y-1 pl-5 last:mb-0'>{children}</ol>,
        li: ({ children }) => <li className='max-w-full break-words pl-1'>{children}</li>,
        blockquote: ({ children }) => (
          <blockquote className='mb-3 max-w-full break-words border-l-4 border-border pl-3 text-muted-foreground last:mb-0'>
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
        table: ({ children }) => (
          <ResizableMarkdownTable useParentHorizontalScroll={useParentHorizontalScroll}>
            {children}
          </ResizableMarkdownTable>
        ),
        thead: ({ children }) => <thead className='bg-muted/70'>{children}</thead>,
        tr: ({ children }) => <MarkdownTableRow>{children}</MarkdownTableRow>,
        th: ({ children, ...props }) => <MarkdownTableHeaderCell {...props}>{children}</MarkdownTableHeaderCell>,
        td: ({ children, ...props }) => <MarkdownTableCell {...props}>{children}</MarkdownTableCell>,
        pre: ({ children }) => (
          <pre
            className={cn(
              'mb-3 rounded-md bg-slate-950 p-3 text-slate-50 last:mb-0',
              useParentHorizontalScroll
                ? 'w-max min-w-full max-w-none overflow-visible'
                : 'max-w-full overflow-x-auto'
            )}
          >
            {children}
          </pre>
        ),
        code: ({ children, className }) => {
          const isCodeBlock = className?.startsWith('language-');

          return (
            <code
              className={cn(
                'rounded font-mono text-[0.85em]',
                isCodeBlock ? 'bg-transparent p-0 text-inherit' : 'break-words bg-muted px-1 py-0.5'
              )}
            >
              {children}
            </code>
          );
        }
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
);

export default MarkdownPreview;
