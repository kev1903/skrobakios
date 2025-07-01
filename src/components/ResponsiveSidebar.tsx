
import React from 'react';
import { 
  Sidebar,
  SidebarContent,
  useSidebar,
} from '@/components/ui/sidebar';
import { SidebarHeader } from './sidebar/SidebarHeader';
import { NavigationSection } from './sidebar/NavigationSection';
import { SidebarFooter } from './sidebar/SidebarFooter';
import { generalNavigation, businessNavigation, supportNavigation } from './sidebar/navigationData';

interface ResponsiveSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const ResponsiveSidebar = ({ currentPage, onNavigate }: ResponsiveSidebarProps) => {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar className="backdrop-blur-xl bg-white/60 border-r border-white/20 shadow-xl">
      <SidebarHeader isCollapsed={isCollapsed} />

      <SidebarContent className="px-4 py-6 space-y-6">
        <NavigationSection
          title="General"
          items={generalNavigation}
          currentPage={currentPage}
          onNavigate={onNavigate}
          isCollapsed={isCollapsed}
        />

        <NavigationSection
          title="Business"
          items={businessNavigation}
          currentPage={currentPage}
          onNavigate={onNavigate}
          isCollapsed={isCollapsed}
        />

        <NavigationSection
          title="Support"
          items={supportNavigation}
          currentPage={currentPage}
          onNavigate={onNavigate}
          isCollapsed={isCollapsed}
        />
      </SidebarContent>

      <SidebarFooter isCollapsed={isCollapsed} onNavigate={onNavigate} />
    </Sidebar>
  );
};
