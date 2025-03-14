'use client';
import { SearchCode, Languages } from 'lucide-react';
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

// Menu items.
const items = [
  {
    title: 'Code Translate',
    url: '/translate/code',
    icon: SearchCode
  },
  {
    title: 'Language Translate',
    url: '/translate/languages',
    icon: Languages
  }
];

const AppSidebar = () => {
  const { setOpenMobile } = useSidebar();
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <div className='flex flex-row justify-between items-center'>
            <Link
              href='/'
              onClick={() => {
                setOpenMobile(false);
              }}
              className='flex flex-row gap-3 items-center'
            >
              <span className='text-xl font-bold px-2 hover:bg-muted rounded-md cursor-pointer'>OpenAI</span>
            </Link>
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>AI Translator</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarSetting />
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
