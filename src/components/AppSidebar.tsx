'use client';
import { Code, Languages, FileText, Sparkles, Database } from 'lucide-react';
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
} from '@/src/components/ui/sidebar';
import Link from 'next/link';
import SidebarSetting from './SidebarSetting';
import { usePathname } from 'next/navigation';
import ChatSidebarGroup from './ChatSidebarGroup';
import { useTranslations } from 'next-intl';

const AppSidebar = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  // Menu items chuyển vào trong function để dùng hook
  const menuItems = [
    {
      groupLabel: t('Sidebar.groupLabel.aiTranslator'),
      items: [
        {
          title: t('Sidebar.menu.languageTranslate'),
          url: '/translate/languages',
          icon: Languages
        },
        {
          title: t('Sidebar.menu.codeTranslate'),
          url: '/translate/code',
          icon: Code
        }
      ]
    },
    {
      groupLabel: t('Sidebar.groupLabel.other'),
      items: [
        {
          title: t('Sidebar.menu.enhancePrompt'),
          url: '/enhance-prompt',
          icon: Sparkles
        },
        {
          title: t('Sidebar.menu.generateData'),
          url: '/generate-data',
          icon: Database
        }
      ]
    },
    {
      groupLabel: t('Sidebar.groupLabel.chat'),
      items: [
        {
          title: t('Sidebar.menu.chatWithPdf'),
          url: '/chat-with-pdf',
          icon: FileText
        }
      ]
    }
  ];

  const handleCloseSidebarOnMobile = () => {
    if (window.innerWidth < 768) {
      setOpenMobile(false);
    }
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
              <span className='text-xl font-bold px-2 hover:bg-muted rounded-md cursor-pointer'>
                {t('Sidebar.brand')}
              </span>
            </Link>
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {menuItems.map(({ items, groupLabel }, index) => {
          if (groupLabel === t('Sidebar.groupLabel.chat')) {
            return (
              <ChatSidebarGroup key={index} pathname={pathname} onCloseSidebarMobile={handleCloseSidebarOnMobile} />
            );
          }
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
        <SidebarMenu>
          <SidebarSetting />
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
