import { AppHeader } from '@/src/components/AppHeader';
import AppSidebar from '@/src/components/AppSidebar';
import { SidebarProvider, SidebarInset } from '@/src/components/ui/sidebar';

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
