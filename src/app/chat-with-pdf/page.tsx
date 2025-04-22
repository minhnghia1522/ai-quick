'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { chatHistoryStore, ChatHistory } from '@/src/utils/chatHistoryDB';
import { Button } from '@/components/ui/button';

export default function ChatWithPDFWelcome() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStartChat = async () => {
    setLoading(true);
    const newId = crypto.randomUUID();
    const now = new Date();
    const newHistory: ChatHistory = {
      id: newId,
      messages: [],
      createdAt: now,
      updatedAt: now
    };
    await chatHistoryStore.saveChatHistory(newHistory);
    router.replace(`/chat-with-pdf/${newId}`);
  };

  return (
    <div className='w-screen h-screen min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-100 p-4 md:p-0'>
      <div className='w-full max-w-5xl mx-auto rounded-xl md:rounded-2xl shadow-2xl bg-white/95 p-6 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-16 transform transition-all duration-300 hover:scale-[1.01] hover:shadow-3xl'>
        {/* Hình minh họa */}
        <div className='hidden md:block flex-shrink-0 animate-float'>
          <img
            src='/file.svg'
            alt='PDF Chatbot'
            className='w-48 h-48 object-contain drop-shadow-2xl'
            draggable={false}
          />
        </div>
        {/* Nội dung chính */}
        <div className='flex-1 text-center md:text-left space-y-4'>
          <h1 className='text-3xl md:text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 drop-shadow-md'>
            Chat với PDF bằng AI
          </h1>
          <p className='mb-4 text-gray-700 text-lg leading-relaxed'>
            <b className='text-blue-600'>RAG (Retrieval-Augmented Generation)</b> là kỹ thuật tiên tiến kết hợp truy
            xuất dữ liệu và sinh ngôn ngữ tự động. Hệ thống thông minh sẽ tìm kiếm và trích xuất thông tin chính xác từ
            tài liệu PDF của bạn, sau đó sử dụng AI để tạo ra các câu trả lời mạch lạc và chuyên sâu.
          </p>
          <ul className='mb-6 text-gray-600 text-base list-none space-y-2'>
            <li className='flex items-center'>
              <svg className='w-5 h-5 mr-2 text-blue-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
              Tải lên file PDF bất kỳ
            </li>
            <li className='flex items-center'>
              <svg className='w-5 h-5 mr-2 text-blue-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
              Đặt câu hỏi về nội dung tài liệu
            </li>
            <li className='flex items-center'>
              <svg className='w-5 h-5 mr-2 text-blue-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
              Nhận câu trả lời thông minh từ chính tài liệu
            </li>
          </ul>
          <div className='mb-6 flex flex-wrap justify-center md:justify-start gap-2'>
            <span className='inline-block bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium shadow-sm'>
              Hỗ trợ đa ngôn ngữ
            </span>
            <span className='inline-block bg-purple-50 text-purple-700 px-4 py-1.5 rounded-full text-sm font-medium shadow-sm'>
              Bảo mật dữ liệu cá nhân
            </span>
          </div>
          <Button
            className='w-full md:w-auto px-10 py-3.5 text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl
            shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300
            flex items-center justify-center gap-2 group'
            onClick={handleStartChat}
            disabled={loading}
          >
            {loading && (
              <svg className='animate-spin h-5 w-5 mr-2 text-white' viewBox='0 0 24 24'>
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                  fill='none'
                />
                <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z' />
              </svg>
            )}
            {loading ? (
              'Đang khởi tạo...'
            ) : (
              <>
                <svg
                  className='h-6 w-6 mr-2 group-hover:animate-bounce'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M8 17l4 4 4-4m0-5V3m-8 9v6a2 2 0 002 2h4a2 2 0 002-2v-6'
                  />
                </svg>
                Bắt đầu chat
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
