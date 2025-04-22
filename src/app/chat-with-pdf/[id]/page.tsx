/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { extractTextFromPdf, getMetaData } from '@/actions/chunkPdfAction';
import { getEmbedding } from '@/service/embeddingService';
import { StoredEmbedding, ValueEmbedding } from '@/types/chunk';
import { EmbeddingStore } from '@/src/utils/indexedDB';
import { type PDFFile } from '@/types/pdf';
import { chatHistoryStore } from '@/src/utils/chatHistoryDB';

export default function ChatWithPDF() {
  const params = useParams();
  const router = useRouter();
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedFile: PDFFile | null = selectedFileId ? files.find((f) => f.id === selectedFileId) ?? null : null;

  useEffect(() => {
    // Nếu không có id trong URL, tạo mới và redirect
    if (!params.id) {
      const newId = crypto.randomUUID();
      router.push(`/chat-with-pdf/${newId}`);
    }
  }, [params.id, router]);

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

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    if (selectedFileId === id) {
      const remainingFiles = files.filter((f) => f.id !== id);
      setSelectedFileId(remainingFiles.length > 0 ? remainingFiles[0].id : null);
    }
  };

  const handleProcessFiles = async () => {
    setIsProcessing(true);
    const embeddingData = await Promise.all(
      files.map(async (file) => {
        if (file.status === 'pending') {
          try {
            const chunkText = await extractTextFromPdf(file.file);
            // Lọc bỏ các trang trống
            const nonEmptyChunks = chunkText.filter((chunk) => chunk.trim().length > 0);
            const embeddingdata = await getEmbedding({ values: nonEmptyChunks });

            const data2 = nonEmptyChunks.map((chunk, index) => ({
              combined_sentence: chunk,
              combined_sentence_embedding: embeddingdata[index]
            }));

            return {
              embeddingId: crypto.randomUUID(),
              object: 'embedding',
              metadata: getMetaData(file.file),
              semantic_chunks: data2
            } as StoredEmbedding;
          } catch (error) {
            console.error('Error processing file:', error);
            return null;
          }
        }
        return null;
      })
    ).then((results) => results.filter((result) => result !== null));

    if (embeddingData.length > 0) {
      await EmbeddingStore.saveEmbedding({
        id: params.id as string,
        embeddingData
      });
    }

    // Giả lập xử lý file
    const updatedFiles = files.map((file) => {
      if (file.status === 'pending') {
        return { ...file, status: 'processing' as const, progress: 0 };
      }
      return file;
    });

    setFiles(updatedFiles);

    // Giả lập tiến trình xử lý
    updatedFiles.forEach((file) => {
      if (file.status === 'processing') {
        const interval = setInterval(() => {
          setFiles((prev) =>
            prev.map((f) => {
              if (f.id === file.id) {
                const newProgress = Math.min(f.progress + 10, 100);
                const newStatus = newProgress === 100 ? ('completed' as const) : ('processing' as const);

                if (newProgress === 100) {
                  clearInterval(interval);
                }

                return { ...f, progress: newProgress, status: newStatus };
              }
              return f;
            })
          );
        }, 500);
      }
    });

    // Kết thúc xử lý sau 5 giây
    setTimeout(() => {
      setIsProcessing(false);
    }, 5000);
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

  return (
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
                        handleRemoveFile(file.id);
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
            // disabled={isProcessing || files.length === 0 || files.every((f) => f.status === 'completed')}
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
      <ChatInterface selectedFile={selectedFile} chatId={params.id as string} />
    </div>
  );
}
