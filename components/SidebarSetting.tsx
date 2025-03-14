import React from 'react';
import ButtonSetting from './ButtonSetting';
import { SidebarMenu, SidebarMenuItem } from './ui/sidebar';

export default function SidebarSetting() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <span className='flex p-2 gap-2 items-center'>
          {/* <ModelSelect /> */}
          <ButtonSetting />
        </span>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
