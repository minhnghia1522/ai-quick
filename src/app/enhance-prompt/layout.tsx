import { AppHeader } from '@/components/AppHeader';
import AppSidebar from '@/components/AppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

export const metadata = {
  title: 'Cải thiện prompt',
  description: 'Tối ưu hóa và cải thiện prompt của bạn bằng AI.'
};

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
