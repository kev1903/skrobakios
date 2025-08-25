import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { ResponsiveSidebar } from './ResponsiveSidebar';
import { MobileHeader } from './MobileHeader';
import { MobileBottomBar } from './MobileBottomBar';
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
        {/* Mobile Header - only shown on mobile, inside SidebarProvider */}
        {isMobile && (
          <MobileHeader onNavigate={onNavigate} />
        )}
        
        {/* Main Content Area */}
        <div className="flex flex-1 min-h-0 w-full">
          <ResponsiveSidebar currentPage={currentPage} onNavigate={onNavigate} />
          
          {/* Content area for children - with bottom padding on mobile for bottom bar */}
          <main className={`flex-1 min-h-0 ${isMobile ? 'pb-20' : ''}`}>
            {children}
          </main>
        </div>
        
        {/* Mobile Bottom Navigation Bar */}
        {isMobile && (
          <MobileBottomBar onNavigate={onNavigate} />
        )}
      </div>
    </SidebarProvider>
  );
};