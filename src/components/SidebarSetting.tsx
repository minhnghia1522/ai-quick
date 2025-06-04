import React from 'react';
import ButtonSetting from './ButtonSetting';
import { SidebarMenuItem } from './ui/sidebar';
import CreatedBy from './CreatedBy';

export default function SidebarSetting() {
  return (
    <SidebarMenuItem>
      <span className='flex p-2 gap-2 items-center'>
        <CreatedBy />
        <ButtonSetting />
      </span>
    </SidebarMenuItem>
  );
}
