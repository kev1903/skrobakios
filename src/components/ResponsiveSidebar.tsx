
import React from 'react';
import { 
  Sidebar,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { SidebarMainContent } from './sidebar/SidebarMainContent';
import { SidebarFooter } from './sidebar/SidebarFooter';
import { ResponsiveSidebarProps } from './sidebar/types';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CompanySwitcher } from '@/components/CompanySwitcher';

export const ResponsiveSidebar = ({ currentPage, onNavigate }: ResponsiveSidebarProps) => {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const handleRibbonClick = () => {
    // Navigate to home page (closes current page) and keep sidebar open for navigation
    onNavigate('home');
  };

  return (
    <Sidebar className="backdrop-blur-2xl bg-white/10 border-r border-white/20 shadow-2xl shadow-black/10">
      <SidebarHeader className="p-4 border-b border-white/20 space-y-2">
        <Button
          onClick={handleRibbonClick}
          variant="ghost"
          size="sm"
          className="w-full justify-start text-white hover:bg-white/20 hover:text-white"
        >
          <Menu className="w-4 h-4 mr-2" />
          {!isCollapsed && <span>Navigation</span>}
        </Button>
        {!isCollapsed && <CompanySwitcher />}
      </SidebarHeader>
      
      <SidebarMainContent 
        currentPage={currentPage}
        onNavigate={onNavigate}
        isCollapsed={isCollapsed}
      />

      <SidebarFooter isCollapsed={isCollapsed} onNavigate={onNavigate} />
    </Sidebar>
  );
};
