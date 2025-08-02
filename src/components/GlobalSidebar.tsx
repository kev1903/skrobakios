import React from 'react';
import { useGlobalSidebar } from '@/contexts/GlobalSidebarContext';
import { AppSidebar } from './AppSidebar';
import { useIsMobile } from '@/hooks/use-mobile';

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
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={closeSidebar}
      />
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 bottom-0 z-50 transform transition-transform duration-300 ease-in-out ${
        isMobile ? 'w-full' : 'w-80'
      }`}>
        <div className="h-full bg-sidebar/95 backdrop-blur-sm border-r border-sidebar-border shadow-2xl">
          <AppSidebar currentPage={currentPage} onNavigate={(page) => {
            onNavigate(page);
            closeSidebar(); // Close sidebar after navigation
          }}>
            <div className="h-full" />
          </AppSidebar>
        </div>
      </div>
    </>
  );
};