
import React from 'react';
import { 
  Sidebar,
  useSidebar,
} from '@/components/ui/sidebar';
import { SidebarHeader } from './sidebar/SidebarHeader';
import { SidebarMainContent } from './sidebar/SidebarMainContent';
import { SidebarFooter } from './sidebar/SidebarFooter';
import { ResponsiveSidebarProps } from './sidebar/types';

export const ResponsiveSidebar = ({ currentPage, onNavigate }: ResponsiveSidebarProps) => {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar className="backdrop-blur-2xl bg-white/10 border-r border-white/20 shadow-2xl shadow-black/10">
      <SidebarHeader isCollapsed={isCollapsed} />
      
      <SidebarMainContent 
        currentPage={currentPage}
        onNavigate={onNavigate}
        isCollapsed={isCollapsed}
      />

      <SidebarFooter isCollapsed={isCollapsed} onNavigate={onNavigate} />
    </Sidebar>
  );
};
