import React from 'react';
import { useGlobalSidebar } from '@/contexts/GlobalSidebarContext';
import { NavigationRibbon } from '@/components/home/NavigationRibbon';
import { SidebarProvider } from '@/components/ui/sidebar';

interface GlobalSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const GlobalSidebar = ({ currentPage, onNavigate }: GlobalSidebarProps) => {
  const { isOpen, closeSidebar } = useGlobalSidebar();

  if (!isOpen) return null;

  const handleNavigateWithClose = (page: string) => {
    closeSidebar();
    onNavigate(page);
  };

  return (
    <>
      {/* Backdrop - transparent click-catcher (no blur so background stays unchanged) */}
      <div 
        className="fixed inset-0 z-[9995] bg-transparent"
        onClick={closeSidebar}
      />
      
      {/* Floating Navigation Ribbon (uses its own floating mode when onClose is provided) */}
      <SidebarProvider>
        <div className="fixed left-0 top-0 bottom-0 z-[10000] w-72 sm:w-80">
          <NavigationRibbon 
            currentPage={currentPage}
            onNavigate={handleNavigateWithClose}
            isCollapsed={false}
            onCollapse={closeSidebar}
            onClose={closeSidebar}
          />
        </div>
      </SidebarProvider>
    </>
  );
};