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
  return <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <ResponsiveSidebar currentPage={currentPage} onNavigate={onNavigate} />
        
        
      </div>
    </SidebarProvider>;
};