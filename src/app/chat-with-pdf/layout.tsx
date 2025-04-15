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
        <header className='flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2'>
          <h1 className='text-xl font-semibold'>Chat with PDF</h1>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
