import React from 'react';
import { useGlobalSidebar } from '@/contexts/GlobalSidebarContext';
import { ResponsiveSidebar } from './ResponsiveSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GlobalSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const GlobalSidebar = ({ currentPage, onNavigate }: GlobalSidebarProps) => {
  const { isOpen, closeSidebar } = useGlobalSidebar();
  const isMobile = useIsMobile();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={closeSidebar}
      />
      
      {/* Sidebar Container */}
      <div className={`fixed left-0 top-0 bottom-0 z-50 transform transition-transform duration-300 ease-in-out ${
        isMobile ? 'w-full max-w-sm' : 'w-80'
      }`}>
        <div className="h-full bg-background/95 backdrop-blur-xl border-r border-border shadow-xl">
          {/* Close Button */}
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={closeSidebar}
              className="w-8 h-8 p-0 hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Sidebar Content with Provider */}
          <SidebarProvider>
            <ResponsiveSidebar 
              currentPage={currentPage} 
              onNavigate={(page) => {
                onNavigate(page);
                closeSidebar(); // Close sidebar after navigation
              }} 
            />
          </SidebarProvider>
        </div>
      </div>
    </>
  );
};