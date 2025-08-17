
import React from 'react';
import { 
  Sidebar,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { NavigationRibbon } from './home/NavigationRibbon';
import { SidebarFooter } from './sidebar/SidebarFooter';
import { ResponsiveSidebarProps } from './sidebar/types';
import { SidebarContextSwitcher } from '@/components/SidebarContextSwitcher';
import { useMenuBarSpacing } from '@/hooks/useMenuBarSpacing';

export const ResponsiveSidebar = ({ currentPage, onNavigate }: ResponsiveSidebarProps) => {
  const { state, setOpen, isMobile, setOpenMobile, open } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const { spacingClasses } = useMenuBarSpacing();

  return (
    <Sidebar 
      collapsible="offcanvas" 
      className={`
        ${open ? 'bg-white/95 border-r border-white/20 shadow-lg' : 'bg-transparent border-0 shadow-none'} 
        ${!isMobile ? spacingClasses : ''} 
        group-data-[collapsible=offcanvas]:bg-white/95 
        group-data-[collapsible=offcanvas]:border-r 
        group-data-[collapsible=offcanvas]:border-white/20 
        group-data-[collapsible=offcanvas]:shadow-xl
        group-data-[collapsible=offcanvas]:backdrop-blur-sm
      `}
    >
      <SidebarHeader className="p-4 border-b border-white/20 space-y-3">
        {/* Context Switcher - Shows User Name and Business */}
        <div className="w-full">
          <SidebarContextSwitcher onNavigate={onNavigate} isCollapsed={isCollapsed} />
        </div>
      </SidebarHeader>
      
      <NavigationRibbon 
        currentPage={currentPage}
        onNavigate={(page) => {
          // Close sidebar on mobile when navigating
          if (isMobile) {
            setOpenMobile(false);
          }
          onNavigate(page);
        }}
        isCollapsed={isCollapsed}
        onCollapse={() => {
          if (isMobile) setOpenMobile(false);
          else setOpen(false);
        }}
      />

      <SidebarFooter isCollapsed={isCollapsed} onNavigate={onNavigate} />
    </Sidebar>
  );
};
