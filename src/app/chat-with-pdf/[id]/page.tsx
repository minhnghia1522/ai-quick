'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Upload, FileText, Trash2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { PDFViewer } from '@/components/PDFViewer';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChatInterface } from '@/components/ChatInterface';
import { getEmbedding } from '@/service/embeddingService';
import { type PDFFile } from '@/types/pdf';

import { useCustomChat } from '@/hooks/useCustomChat';
import { FileStore } from '@/src/lib/database/fileDataDB';
import { extractChunksFromPDF } from '@/src/utils/chunkDataPdf';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { toast } from 'sonner';

export default function ChatWithPDF() {
  const params = useParams();
  const router = useRouter();
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State cho dialog xác nhận xóa
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [fileIdToDelete, setFileIdToDelete] = useState<string | null>(null);
  const [isFileEmbedding, setIsFileEmbedding] = useState(false);

  const selectedFile: PDFFile | null = selectedFileId ? files.find((f) => f.id === selectedFileId) ?? null : null;

  // Lấy trạng thái notFound từ useCustomChat
  const { notFound } = useCustomChat(params.id as string);

  useEffect(() => {
    // Nếu không có id trong URL, tạo mới và redirect
    if (!params.id) {
      const newId = crypto.randomUUID();
      router.push(`/chat-with-pdf/${newId}`);
    }
  }, [params.id, router]);

  useEffect(() => {
    const loadFileStorage = async () => {
      try {
        const fileStorage = await FileStore.getFileByChatId(params.id as string);
        if (fileStorage.length > 0) {
          const fileData: PDFFile[] = fileStorage.map((data) => ({
            id: data.id,
            file: new File([data.blob!], data.filename, {
              type: data.type,
              lastModified: data.lastModified
            }),
            status: 'completed',
            progress: 100
          }));
          setFiles(fileData);
          setSelectedFileId(fileData[0].id);
          setIsFileEmbedding(true);
        }
      } catch (error) {
        console.error('Error loading embedding:', error);
      }
    };
    loadFileStorage();
  }, [params.id]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles: PDFFile[] = [];

      Array.from(e.target.files).forEach((file) => {
        if (file.type === 'application/pdf') {
          newFiles.push({
            id: crypto.randomUUID(),
            file,
            status: 'pending',
            progress: 0
          });
        } else {
          alert('Vui lòng chỉ chọn file PDF');
        }
      });

      if (newFiles.length > 0) {
        setFiles((prev) => [...prev, ...newFiles]);
        if (!selectedFileId) {
          setSelectedFileId(newFiles[0].id);
        }
      }
    }

    // Reset input để có thể chọn lại cùng một file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (selectedFileId === fileId) {
      const remainingFiles = files.filter((f) => f.id !== fileId);
      setSelectedFileId(remainingFiles.length > 0 ? remainingFiles[0].id : null);
    }
    FileStore.deleteFileByFileId(params.id as string, fileId);
  };

  interface PDFChunk {
    content: string;
    chunkIndex: number;
    page?: number;
    startLine?: number;
    endLine?: number;
    embedding?: number[];
  }

  const handleProcessFiles = async () => {
    setIsProcessing(true);

    // Lấy danh sách file đã embedding trong DB
    const storedFiles = await FileStore.getFileByChatId(params.id as string);

    // Lọc ra các file chưa từng embedding (theo tên, size, lastModified)
    const pendingFiles = files.filter((file) => {
      if (file.status !== 'pending') return false;
      const existed = storedFiles.some(
        (f) => f.filename === file.file.name && f.size === file.file.size && f.lastModified === file.file.lastModified
      );
      return !existed;
    });

    if (pendingFiles.length === 0) {
      setIsProcessing(false);
      return;
    }

    // Embedding chỉ cho file thực sự chưa từng xử lý
    const embeddingResults = await Promise.all(
      pendingFiles.map(async (file) => {
        try {
          const allChunks = await extractChunksFromPDF(file.file);
          const chunksWithEmbedding: PDFChunk[] = [];
          for (let i = 0; i < allChunks.length; i++) {
            const chunk = allChunks[i];
            // Embedding từng chunk một
            const embeddingArr = await getEmbedding({ values: [chunk.content] });
            chunksWithEmbedding.push({
              ...chunk,
              embedding: embeddingArr[0] as number[] | undefined
            });
            // Cập nhật progress cho file này
            setFiles((prevFiles) =>
              prevFiles.map((f) =>
                f.id === file.id
                  ? {
                      ...f,
                      status: 'processing' as const,
                      progress: Math.round(((i + 1) / allChunks.length) * 100)
                    }
                  : f
              )
            );
          }
          // Sau khi xong toàn bộ chunk, cập nhật trạng thái file thành completed
          setFiles((prevFiles) =>
            prevFiles.map((f) =>
              f.id === file.id
                ? {
                    ...f,
                    status: 'completed' as const,
                    progress: 100
                  }
                : f
            )
          );
          return {
            file,
            chunks: chunksWithEmbedding
          };
        } catch (error) {
          if (error instanceof Error) {
            toast.error(error.message);
          }
          return null;
        }
      })
    );

    // Lọc ra các file embedding thành công
    const processedFiles = embeddingResults.filter((result) => result !== null) as {
      file: PDFFile;
      chunks: PDFChunk[];
    }[];

    if (processedFiles.length > 0) {
      setIsFileEmbedding(true);
      // Chỉ lưu các file vừa embedding vào DB
      const fileValue = processedFiles.map(({ file, chunks }) => ({
        id: file.id,
        filename: file.file.name,
        type: file.file.type,
        size: file.file.size,
        lastModified: file.file.lastModified,
        blob: new Blob([file.file], { type: file.file.type }),
        embedding: chunks
      }));
      await FileStore.saveFile(params.id as string, fileValue);
    }

    // Đảm bảo kết thúc process sau khi tất cả file đã xử lý xong
    setIsProcessing(false);
  };

  const getStatusIcon = (status: PDFFile['status']) => {
    switch (status) {
      case 'pending':
        return <FileText className='h-4 w-4 text-gray-500' />;
      case 'processing':
        return <Loader2 className='h-4 w-4 text-blue-500 animate-spin' />;
      case 'completed':
        return <CheckCircle className='h-4 w-4 text-green-500' />;
      case 'error':
        return <AlertCircle className='h-4 w-4 text-red-500' />;
    }
  };

  if (notFound) {
    return (
      <div className='flex flex-col items-center justify-center h-[calc(100vh-56px)] w-full'>
        <AlertCircle className='h-16 w-16 text-red-400 mb-6' />
        <h2 className='text-2xl font-bold mb-2'>Cuộc trò chuyện không tồn tại</h2>
        <p className='text-base text-gray-500 mb-4'>
          Đường dẫn hoặc mã cuộc trò chuyện này không tồn tại trong hệ thống.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className='flex h-[calc(100vh-56px)]'>
        {/* Left Panel - PDF Upload and Management */}
        <div className='w-1/2 border-r flex flex-col h-full'>
          {/* Upload Section */}
          <div className='p-2 border-b'>
            <div className='border border-dashed border-gray-300 rounded-lg p-1 flex flex-col items-center'>
              <Input
                type='file'
                accept='.pdf'
                onChange={handleFileUpload}
                className='hidden'
                id='pdf-upload'
                multiple
                ref={fileInputRef}
              />
              <label htmlFor='pdf-upload' className='cursor-pointer flex flex-col items-center w-full'>
                <Upload className='h-8 w-8 text-gray-400 mb-2' />
                <div className='text-sm font-medium mb-1'>Tải lên PDF</div>
                <p className='text-xs text-gray-500 mb-3'>Kéo thả hoặc click để chọn file</p>
                <Button variant='outline' size='sm' className='w-full' onClick={() => fileInputRef.current?.click()}>
                  Chọn tệp
                </Button>
              </label>
            </div>
          </div>
          {/* Files List - Horizontal */}
          <div className='p-2 border-b'>
            <h3 className='text-sm font-medium mb-1'>File đã tải lên</h3>
            {files.length === 0 ? (
              <div className='text-center text-gray-500 text-xs mb-2'>Chưa có file nào được tải lên</div>
            ) : (
              <div className='flex overflow-x-auto gap-2 pb-1 mb-2'>
                {files.map((file) => (
                  <Card
                    key={file.id}
                    className={`p-1.5 cursor-pointer flex-shrink-0 w-40 border ${
                      selectedFileId === file.id ? 'border-blue-500 border-2' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedFileId(file.id)}
                  >
                    <div className='flex items-start gap-1'>
                      <div className='mt-0.5'>{getStatusIcon(file.status)}</div>
                      <div className='flex-1 min-w-0'>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className='text-xs font-medium truncate'>{file.file.name}</div>
                            </TooltipTrigger>
                            <TooltipContent side='bottom' align='start'>
                              <p className='text-xs'>{file.file.name}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <div className='text-[10px] text-gray-500'>{(file.file.size / 1024 / 1024).toFixed(2)} MB</div>
                      </div>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-5 w-5 -mt-0.5 -mr-0.5'
                        onClick={(e) => {
                          e.stopPropagation();
                          if (file.status === 'completed' || file.status === 'processing') {
                            setFileIdToDelete(file.id);
                            setConfirmDialogOpen(true);
                          } else {
                            handleRemoveFile(file.id);
                          }
                        }}
                      >
                        <Trash2 className='h-3 w-3 text-red-500' />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            <Button
              className='w-full'
              onClick={handleProcessFiles}
              disabled={isProcessing || files.length === 0 || files.every((f) => f.status === 'completed')}
            >
              {isProcessing ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Đang xử lý...
                </>
              ) : (
                'Xử lý PDF'
              )}
            </Button>
            {files.some((f) => f.status === 'processing') && (
              <div className='space-y-2 mt-3'>
                <div className='text-xs font-medium'>Tiến trình xử lý</div>
                {files
                  .filter((f) => f.status === 'processing')
                  .map((file) => (
                    <div key={file.id} className='space-y-1'>
                      <div className='flex justify-between text-xs'>
                        <span className='truncate'>{file.file.name}</span>
                        <span>{file.progress}%</span>
                      </div>
                      <Progress value={file.progress} className='h-1' />
                    </div>
                  ))}
              </div>
            )}
          </div>
          {/* PDF Viewer */}
          <div className='flex-1 overflow-auto'>
            {selectedFile ? (
              <PDFViewer file={selectedFile.file} />
            ) : (
              <div className='h-full flex flex-col justify-center p-6 text-center'>
                <FileText className='h-10 w-12 text-gray-300 mx-auto mb-4' />
                <h3 className='text-lg font-medium mb-2'>Không có file nào được chọn</h3>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Chat Interface */}
        <ChatInterface isFileEmbedding={isFileEmbedding} chatId={params.id as string} />
      </div>
      {/* Dialog xác nhận xóa file */}
      <ConfirmDialog
        open={confirmDialogOpen}
        title='Xác nhận xóa file'
        description='Bạn có chắc chắn muốn xóa file này không?'
        confirmText='Xóa'
        cancelText='Hủy'
        onConfirm={() => {
          if (fileIdToDelete) {
            handleRemoveFile(fileIdToDelete);
          }
          setConfirmDialogOpen(false);
          setFileIdToDelete(null);
        }}
        onCancel={() => {
          setConfirmDialogOpen(false);
          setFileIdToDelete(null);
        }}
      />
    </>
  );
}
