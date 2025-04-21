'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { type PDFFile } from '@/types/pdf';
import { useCustomChat } from '@/hooks/useCustomChat';

import ReactMarkdown from 'react-markdown';

type ChatInterfaceProps = {
  selectedFile: PDFFile | null;
  chatId: string;
};

export const ChatInterface = ({ selectedFile, chatId }: ChatInterfaceProps) => {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useCustomChat(chatId);

  return (
    <div className='w-1/2 flex flex-col'>
      <div className='flex flex-col h-full'>
        <div className='flex-1 flex flex-col'>
          {/* Chat messages */}
          <div className='flex-1 p-4 overflow-auto'>
            {!selectedFile ? (
              <div className='h-full flex flex-col justify-center p-6 text-center'>
                <FileText className='h-12 w-12 text-gray-300 mx-auto mb-4' />
                <h3 className='text-lg font-medium mb-2'>Không có file nào được chọn</h3>
                <p className='text-sm text-gray-500 mb-4'>
                  Vui lòng tải lên hoặc chọn một file PDF từ danh sách bên trái để bắt đầu
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                {messages.map((message, index) => {
                  let content = '';

                  // Xử lý nội dung tin nhắn
                  if (typeof message === 'string') {
                    content = message;
                  } else if (message.content) {
                    if (Array.isArray(message.content)) {
                      content = message.content.join('');
                    } else if (typeof message.content === 'string') {
                      content = message.content;
                    }
                  }

                  // Loại bỏ các ký tự đặc biệt và metadata
                  content = content.replace(/[fd]:{.*?}/g, '').trim();
                  content = content.replace(/\d+:/g, '');

                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg ${
                        message.role === 'user' ? 'bg-blue-100 ml-12' : 'bg-gray-100 mr-12'
                      }`}
                    >
                      <ReactMarkdown>{content}</ReactMarkdown>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Input area */}
          <div className='p-4 border-t bg-white'>
            <form onSubmit={handleSubmit} className='flex gap-2'>
              <Input
                placeholder='Nhập câu hỏi của bạn về nội dung PDF...'
                value={input}
                onChange={handleInputChange}
                className='flex-1'
                disabled={!selectedFile}
              />
              <Button type='submit' disabled={!input.trim() || !selectedFile || isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Đang xử lý...
                  </>
                ) : (
                  'Gửi'
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
      {error && <div className='p-4 text-red-500 text-sm'>Có lỗi xảy ra: {error.message}</div>}
    </div>
  );
};
