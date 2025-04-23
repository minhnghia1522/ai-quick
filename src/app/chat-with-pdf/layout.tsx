export const metadata = {
  title: 'Chat with PDF',
  description: 'Trò chuyện với file PDF của bạn bằng AI.'
};

import { AppHeader } from '@/components/AppHeader';
import AppSidebar from '@/components/AppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

export default function Layout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
