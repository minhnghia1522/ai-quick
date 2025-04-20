'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ChatWithPDFRedirect() {
  const router = useRouter();

  useEffect(() => {
    const newId = crypto.randomUUID();
    router.replace(`/chat-with-pdf/${newId}`);
  }, [router]);

  return (
    <div className='h-[calc(100vh-56px)] flex items-center justify-center'>
      <div className='text-center'>
        <h2 className='text-lg font-medium mb-2'>Đang tạo phiên chat mới...</h2>
        <p className='text-sm text-gray-500'>Vui lòng đợi trong giây lát</p>
      </div>
    </div>
  );
}
