import React from 'react';
import { useGlobalSidebar } from '@/contexts/GlobalSidebarContext';
import { AppSidebar } from './AppSidebar';

interface GlobalSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const GlobalSidebar = ({ currentPage, onNavigate }: GlobalSidebarProps) => {
  const { isOpen, closeSidebar } = useGlobalSidebar();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={closeSidebar}
      />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 z-50 w-80">
        <AppSidebar currentPage={currentPage} onNavigate={onNavigate}>
          <></>
        </AppSidebar>
      </div>
    </>
  );
};