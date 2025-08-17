import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { ResponsiveSidebar } from './ResponsiveSidebar';
import { MobileHeader } from './MobileHeader';
import { useIsMobile } from '@/hooks/use-mobile';

interface AppSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  children: React.ReactNode;
}

export const AppSidebar = ({
  currentPage,
  onNavigate,
  children
}: AppSidebarProps) => {
  const isMobile = useIsMobile();
  
  return (
    <SidebarProvider>
      <div className="h-full min-h-0 flex flex-col w-full">
        {/* Mobile Header - only shown on mobile */}
        {isMobile && (
          <MobileHeader onNavigate={onNavigate} />
        )}
        
        {/* Main Content Area */}
        <div className="flex flex-1 min-h-0 w-full">
          <ResponsiveSidebar currentPage={currentPage} onNavigate={onNavigate} />
          
          {/* Content area for children */}
          <main className="flex-1 min-h-0">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};