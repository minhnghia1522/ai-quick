'use client';
import { useEffect, useState } from 'react';
import { FileText, Trash } from 'lucide-react';
import Link from 'next/link';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import { chatHistoryStore, ChatHistory } from '@/src/lib/database/chatHistoryDB';
import { FileStore } from '@/src/lib/database/fileDataDB';

interface ChatSidebarGroupProps {
  pathname: string;
  onCloseSidebarMobile: () => void;
}

const ChatSidebarGroup = ({ pathname, onCloseSidebarMobile }: ChatSidebarGroupProps) => {
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);

  useEffect(() => {
    let isMounted = true;
    chatHistoryStore.getAllChatHistories().then((histories) => {
      if (isMounted)
        setChatHistories(histories.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    });
    return () => {
      isMounted = false;
    };
  }, [pathname]);

  const handleDeleteHistory = async (id: string) => {
    await chatHistoryStore.deleteChatHistory(id);
    await FileStore.deleteFileByChatId(id);
    setChatHistories((prev) => prev.filter((h) => h.id !== id));
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Chat</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {/* Menu chính */}
          <SidebarMenuItem key='Chat with PDF'>
            <SidebarMenuButton asChild isActive={'/chat-with-pdf' === pathname}>
              <Link href='/chat-with-pdf' onClick={onCloseSidebarMobile}>
                <FileText />
                <span>Chat with PDF</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Danh sách lịch sử tách riêng */}
          {chatHistories.length > 0 && (
            <div className='ml-6'>
              {chatHistories.map((history) => (
                <div key={history.id} className='flex items-center justify-between group pr-2'>
                  <SidebarMenuItem className='flex-1 min-w-0'>
                    <SidebarMenuButton asChild isActive={pathname === `/chat-with-pdf/${history.id}`}>
                      <Link
                        href={`/chat-with-pdf/${history.id}`}
                        onClick={onCloseSidebarMobile}
                        className='flex-1 min-w-0 truncate'
                      >
                        <span>{history.messages[0]?.content?.slice(0, 20) || 'Chat history'}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {pathname !== `/chat-with-pdf/${history.id}` && (
                    <button
                      className='ml-2 text-muted-foreground hover:text-destructive opacity-70 hover:opacity-100 transition'
                      title='Xóa lịch sử'
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleDeleteHistory(history.id);
                      }}
                    >
                      <Trash size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default ChatSidebarGroup;
