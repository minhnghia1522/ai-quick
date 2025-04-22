'use client';
import { Code, Languages, FileText, Trash } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';
import Link from 'next/link';
import SidebarSetting from './SidebarSetting';
import { usePathname } from 'next/navigation';

import { useEffect, useState } from 'react';
import { chatHistoryStore, ChatHistory } from '@/src/utils/chatHistoryDB';

// Menu items.
const menuItems = [
  {
    groupLabel: 'AI Translator',
    items: [
      {
        title: 'Language Translate',
        url: '/translate/languages',
        icon: Languages
      },
      {
        title: 'Code Translate',
        url: '/translate/code',
        icon: Code
      }
    ]
  },
  {
    groupLabel: 'Chat',
    items: [
      {
        title: 'Chat with PDF',
        url: '/chat-with-pdf',
        icon: FileText
      }
    ]
  }
];

const AppSidebar = () => {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

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

  const handleCloseSidebarOnMobile = () => {
    if (window.innerWidth < 768) {
      setOpenMobile(false);
    }
  };

  // Xử lý xóa lịch sử chat
  const handleDeleteHistory = async (id: string) => {
    await chatHistoryStore.deleteChatHistory(id);
    setChatHistories((prev) => prev.filter((h) => h.id !== id));
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <div className='flex flex-row justify-between items-center'>
            <Link
              href='/'
              onClick={() => {
                handleCloseSidebarOnMobile();
              }}
              className='flex flex-row gap-3 items-center'
            >
              <span className='text-xl font-bold px-2 hover:bg-muted rounded-md cursor-pointer'>AI QUICK</span>
            </Link>
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {menuItems.map(({ items, groupLabel }, index) => {
          // Nếu là group Chat thì render thêm lịch sử chat
          if (groupLabel === 'Chat') {
            return (
              <SidebarGroup key={index}>
                <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {items.map((item) => {
                      if (item.title === 'Chat with PDF') {
                        return (
                          <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild isActive={item.url == pathname}>
                              <Link href={item.url} onClick={handleCloseSidebarOnMobile}>
                                <item.icon />
                                <span>{item.title}</span>
                              </Link>
                            </SidebarMenuButton>
                            {/* Lịch sử chat là con của Chat with PDF */}
                            {chatHistories.length > 0 && (
                              <div className='ml-6'>
                                {chatHistories.map((history) => (
                                  <div key={history.id} className='flex items-center justify-between group pr-2'>
                                    <SidebarMenuItem className='flex-1 min-w-0'>
                                      <SidebarMenuButton asChild isActive={pathname === `/chat-with-pdf/${history.id}`}>
                                        <Link
                                          href={`/chat-with-pdf/${history.id}`}
                                          onClick={handleCloseSidebarOnMobile}
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
                          </SidebarMenuItem>
                        );
                      }
                      // Các item khác giữ nguyên
                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild isActive={item.url == pathname}>
                            <Link href={item.url} onClick={handleCloseSidebarOnMobile}>
                              <item.icon />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          }
          // Các group khác giữ nguyên
          return (
            <SidebarGroup key={index}>
              <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={item.url == pathname}>
                        <Link href={item.url} onClick={handleCloseSidebarOnMobile}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <SidebarFooter>
        <SidebarSetting />
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
