'use client';
import { SidebarToggle } from './SidebarToggle';
import { ModelSelector } from './ModelSelector';

export function AppHeader() {
  // const { width: windowWidth } = useWindowSize();

  return (
    <header className='flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2'>
      <SidebarToggle />
      <ModelSelector className='order-1 md:order-2' />
    </header>
  );
}
