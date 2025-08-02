
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
import { useTimerBarSpacing } from '@/hooks/useTimerBarSpacing';

export const ResponsiveSidebar = ({ currentPage, onNavigate }: ResponsiveSidebarProps) => {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const { spacingClasses } = useTimerBarSpacing();

  return (
    <Sidebar className={`backdrop-blur-2xl bg-white/10 border-r border-white/20 shadow-2xl shadow-black/10 ${spacingClasses}`}>
      <SidebarHeader className="p-4 border-b border-white/20 space-y-3">
        {/* Context Switcher - Shows User Name and Business */}
        <div className="w-full">
          <SidebarContextSwitcher onNavigate={onNavigate} isCollapsed={isCollapsed} />
        </div>
      </SidebarHeader>
      
      <NavigationRibbon 
        currentPage={currentPage}
        onNavigate={onNavigate}
        isCollapsed={isCollapsed}
      />

      <SidebarFooter isCollapsed={isCollapsed} onNavigate={onNavigate} />
    </Sidebar>
  );
};
