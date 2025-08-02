
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
    <Sidebar className="w-full h-full bg-transparent border-none shadow-none">
      <SidebarHeader className="p-6 space-y-4">
        {/* Context Switcher - Shows User Name and Business */}
        <div className="w-full">
          <SidebarContextSwitcher onNavigate={onNavigate} isCollapsed={isCollapsed} />
        </div>
        
        {/* Navigation Button */}
        <Button
          onClick={handleRibbonClick}
          variant="ghost"
          size="sm"
          className="w-full justify-start text-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Menu className="w-4 h-4 mr-2" />
          {!isCollapsed && <span>Navigation</span>}
        </Button>
      </SidebarHeader>
      
      <div className="flex-1 overflow-hidden">
        <NavigationRibbon 
          currentPage={currentPage}
          onNavigate={onNavigate}
          isCollapsed={isCollapsed}
        />
      </div>

      <SidebarFooter isCollapsed={isCollapsed} onNavigate={onNavigate} />
    </Sidebar>
  );
};
