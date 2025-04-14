'use client';
import { Code, Languages } from 'lucide-react';
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

// Menu items.
const items = [
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
];

const AppSidebar = () => {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

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
              <span className='text-xl font-bold px-2 hover:bg-muted rounded-md cursor-pointer'>AI QUICK</span>
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
      </SidebarContent>
      <SidebarFooter>
        <SidebarSetting />
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
