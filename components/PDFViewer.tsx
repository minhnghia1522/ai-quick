'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Maximize, Minimize, Plus, Minus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';

import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Dynamically import Document and Page components to avoid SSR issues
const Document = dynamic(() => import('react-pdf').then((mod) => mod.Document), { ssr: false });
const Page = dynamic(() => import('react-pdf').then((mod) => mod.Page), { ssr: false });
interface PDFViewerProps {
  file: File | null;
}

export function PDFViewer({ file }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Memoize options để tránh tạo lại đối tượng mới trong mỗi lần render
  const pdfOptions = useMemo(
    () => ({
      cMapUrl: 'https://unpkg.com/pdfjs-dist@2.16.105/cmaps/',
      cMapPacked: true,
      standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@2.16.105/standard_fonts/',
      disableAutoFetch: true,
      disableStream: false
    }),
    []
  );

  // Setup PDF.js only on client-side
  useEffect(() => {
    // Dynamically import pdfjs
    import('react-pdf').then((reactPdf) => {
      // Polyfill for Promise.withResolvers if not available
      type WithResolversReturn = {
        promise: Promise<unknown>;
        resolve: (value?: unknown) => void;
        reject: (reason?: unknown) => void;
      };

      type WithResolversFunction = () => WithResolversReturn;

      if (!(Promise as { withResolvers?: WithResolversFunction }).withResolvers) {
        (Promise as { withResolvers: WithResolversFunction }).withResolvers = function () {
          let resolve: (value?: unknown) => void = () => {};
          let reject: (reason?: unknown) => void = () => {};
          const promise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
          });
          return { promise, resolve, reject };
        };
      }
      // Set the workerSrc to resolve the fake worker error
      reactPdf.pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.mjs.js`;
    });
  }, []);

  useEffect(() => {
    // Chỉ thực hiện trên client-side
    if (typeof window === 'undefined') return;

    // Reset states when file changes
    setNumPages(null);
    setCurrentPage(1);
    setZoom(100);

    if (file) {
      // URL.createObjectURL chỉ hoạt động trên client
      const url = URL.createObjectURL(file);
      setFileUrl(url);

      return () => URL.revokeObjectURL(url);
    } else {
      setFileUrl(null);
    }
  }, [file]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handleNextPage = () => {
    if (numPages && currentPage < numPages) setCurrentPage((p) => p + 1);
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z + 10, 200));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 10, 50));
  const toggleFullscreen = () => setIsFullscreen((f) => !f);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    // Chỉ thực hiện trên client-side
    if (typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const handleDownload = () => {
    if (!fileUrl) return;
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = file!.name;
    link.click();
  };

  // Drag to scroll logic
  useEffect(() => {
    // Chỉ thực hiện trên client-side
    if (typeof window === 'undefined') return;

    const container = scrollRef.current;
    if (!container) return;

    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    };

    const onMouseLeave = () => {
      isDragging = false;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.5;
      container.scrollLeft = scrollLeft - walk;
    };

    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('mouseleave', onMouseLeave);
    container.addEventListener('mouseup', onMouseUp);
    container.addEventListener('mousemove', onMouseMove);

    return () => {
      container.removeEventListener('mousedown', onMouseDown);
      container.removeEventListener('mouseleave', onMouseLeave);
      container.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('mousemove', onMouseMove);
    };
  }, [fileUrl]); // Re-initialize drag to scroll when fileUrl changes

  if (!file) {
    return (
      <div className='flex items-center justify-center h-full bg-gray-100 rounded-lg'>
        <p className='text-gray-500'>Không có tệp PDF nào được chọn</p>
      </div>
    );
  }

  if (!fileUrl) {
    return (
      <div className='flex items-center justify-center h-full bg-gray-100 rounded-lg'>
        <p className='text-gray-500'>Đang tải tệp PDF...</p>
      </div>
    );
  }

  return (
    <div className={`flex h-full ${isFullscreen ? 'fixed inset-0 bg-white z-50' : ''}`}>
      {/* Sidebar thumbnail */}
      <div className='w-32 bg-gray-100 border-r overflow-auto py-2'>
        {numPages ? (
          Array.from({ length: numPages }).map((_, index) => (
            <div
              key={index}
              className={`cursor-pointer mb-2 mx-2 rounded ${currentPage === index + 1 ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setCurrentPage(index + 1)}
            >
              <div className='bg-white shadow-md'>
                <Document file={fileUrl} loading={null} error={null}>
                  <Page
                    pageNumber={index + 1}
                    width={100}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    loading={null}
                    error={null}
                  />
                </Document>
              </div>
            </div>
          ))
        ) : (
          <div className='p-2 text-xs text-center text-gray-500'>Đang tải...</div>
        )}
      </div>

      {/* Main PDF Viewer */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        <div className='flex items-center justify-between bg-gray-100 p-2 border-b'>
          <div className='flex items-center space-x-2'>
            <Button variant='ghost' size='icon' onClick={handlePrevPage} disabled={currentPage === 1}>
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <span className='text-sm'>
              {currentPage} / {numPages || '?'}
            </span>
            <Button variant='ghost' size='icon' onClick={handleNextPage} disabled={currentPage === numPages}>
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
          <div className='flex items-center space-x-2'>
            <Button variant='ghost' size='icon' onClick={handleZoomOut} disabled={zoom <= 50}>
              <Minus className='h-4 w-4' />
            </Button>
            <span className='text-sm'>{zoom}%</span>
            <Button variant='ghost' size='icon' onClick={handleZoomIn} disabled={zoom >= 200}>
              <Plus className='h-4 w-4' />
            </Button>
            {!isFullscreen && (
              <Button variant='ghost' size='icon' onClick={toggleFullscreen}>
                <Maximize className='h-4 w-4' />
              </Button>
            )}
            <Button variant='ghost' size='icon' onClick={handleDownload}>
              <Download className='h-4 w-4' />
            </Button>
            {isFullscreen && (
              <Button variant='outline' size='sm' onClick={() => setIsFullscreen(false)}>
                <Minimize className='h-4 w-4 mr-1' /> Thoát
              </Button>
            )}
          </div>
        </div>

        <div
          ref={scrollRef}
          className='flex-1 bg-gray-200 overflow-auto flex justify-center cursor-grab active:cursor-grabbing'
        >
          <div className='my-4'>
            <Document
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={(error) => {
                console.error('Lỗi khi tải PDF:', error);
                // Có thể thêm xử lý lỗi ở đây nếu cần
              }}
              loading={<p className='text-center'>Đang tải PDF...</p>}
              error={
                <div className='text-center p-4'>
                  <p className='text-red-500 font-medium mb-2'>Lỗi tải PDF</p>
                  <p className='text-sm text-gray-600'>Tệp PDF không thể được tải. Vui lòng kiểm tra lại tệp.</p>
                </div>
              }
              options={pdfOptions}
            >
              <Page
                pageNumber={currentPage}
                width={zoom * 5} // Sử dụng width thay vì transform để tránh chữ bị mờ
                renderTextLayer
                renderAnnotationLayer
                className='shadow-lg'
                loading={<p className='text-center'>Đang tải trang...</p>}
                error={<p className='text-center text-red-500'>Lỗi tải trang</p>}
              />
            </Document>
          </div>
        </div>
      </div>
    </div>
  );
}
