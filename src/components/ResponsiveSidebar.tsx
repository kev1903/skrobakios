
import React from 'react';
import { 
  Sidebar,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { NavigationRibbon } from './home/NavigationRibbon';
import { SidebarFooter } from './sidebar/SidebarFooter';
import { ResponsiveSidebarProps } from './sidebar/types';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarContextSwitcher } from '@/components/SidebarContextSwitcher';

export const ResponsiveSidebar = ({ currentPage, onNavigate }: ResponsiveSidebarProps) => {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const handleRibbonClick = () => {
    // This navigation button is for main navigation, not for toggling sidebar
    onNavigate('home');
  };

  return (
    <Sidebar className="backdrop-blur-2xl bg-white/10 border-r border-white/20 shadow-2xl shadow-black/10">
      <SidebarHeader className="p-4 border-b border-white/20 space-y-3">
        {/* Context Switcher - Shows User Name and Business */}
        <div className="w-full">
          <SidebarContextSwitcher onNavigate={onNavigate} isCollapsed={isCollapsed} />
        </div>
        
        {/* Navigation Button */}
        <Button
          onClick={handleRibbonClick}
          variant="ghost"
          size="sm"
          className="w-full justify-start text-white hover:bg-white/20 hover:text-white"
        >
          <Menu className="w-4 h-4 mr-2" />
          {!isCollapsed && <span>Navigation</span>}
        </Button>
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
