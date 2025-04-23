'use client';

import { useEffect, useRef } from 'react'; // Thêm useEffect và useRef
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Loader2, AlertCircle } from 'lucide-react';
import { useCustomChat } from '@/hooks/useCustomChat';

import ReactMarkdown from 'react-markdown';

type ChatInterfaceProps = {
  isFileEmbedding: boolean;
  chatId: string;
};

export const ChatInterface = ({ isFileEmbedding, chatId }: ChatInterfaceProps) => {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, notFound } = useCustomChat(chatId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Tự động cuộn xuống dưới cùng khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (notFound) {
    return (
      <div className='w-1/2 flex flex-col items-center justify-center h-full'>
        <AlertCircle className='h-12 w-12 text-red-400 mb-4' />
        <h3 className='text-lg font-medium mb-2'>Cuộc trò chuyện không tồn tại</h3>
        <p className='text-sm text-gray-500 mb-4'>
          Đường dẫn hoặc mã cuộc trò chuyện này không tồn tại trong hệ thống.
        </p>
      </div>
    );
  }

  return (
    <div className='w-1/2 flex flex-col h-full overflow-hidden'>
      <div className='flex flex-col h-full min-h-0'>
        <div className='flex-1 flex flex-col min-h-0'>
          {/* Chat messages */}
          <div className='flex-1 min-h-0 p-2 overflow-auto'>
            {!isFileEmbedding ? (
              <div className='h-full flex flex-col justify-center p-6 text-center'>
                <FileText className='h-12 w-12 text-gray-300 mx-auto mb-4' />
                <h3 className='text-lg font-medium mb-2'>Không có file nào đã được xử lý</h3>
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
            <div ref={messagesEndRef} /> {/* Thêm div trống với ref để cuộn */}
          </div>

          {/* Input area */}
          <div className='p-2 border-t bg-white'>
            <form onSubmit={handleSubmit} className='flex gap-2'>
              <Input
                placeholder='Nhập câu hỏi của bạn về nội dung PDF...'
                value={input}
                onChange={handleInputChange}
                className='flex-1'
                disabled={!isFileEmbedding}
              />
              <Button type='submit' disabled={!input.trim() || !isFileEmbedding || isLoading}>
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
