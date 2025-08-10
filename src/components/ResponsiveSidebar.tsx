
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
    <Sidebar collapsible="offcanvas" className={`${open ? 'backdrop-blur-2xl bg-white/10 border-r border-white/20 shadow-2xl shadow-black/10' : 'bg-transparent backdrop-blur-0 border-0 shadow-none'} ${spacingClasses} group-data-[collapsible=offcanvas]:backdrop-blur-0 group-data-[collapsible=offcanvas]:bg-transparent group-data-[collapsible=offcanvas]:border-0 group-data-[collapsible=offcanvas]:shadow-none`}>
      <SidebarHeader className="p-4 border-b border-white/20 space-y-3">
        {/* Context Switcher - Shows User Name and Business */}
        <div className="w-full">
          <SidebarContextSwitcher onNavigate={onNavigate} isCollapsed={isCollapsed} />
        </div>
      </SidebarHeader>
      
      <NavigationRibbon 
        currentPage={currentPage}
        onNavigate={(page) => {
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
