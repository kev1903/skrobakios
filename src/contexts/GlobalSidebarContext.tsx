import React, { createContext, useContext, useState } from 'react';

interface GlobalSidebarContextType {
  isOpen: boolean;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
}

const GlobalSidebarContext = createContext<GlobalSidebarContextType | null>(null);

export const useGlobalSidebar = () => {
  const context = useContext(GlobalSidebarContext);
  if (!context) {
    throw new Error('useGlobalSidebar must be used within a GlobalSidebarProvider');
  }
  return context;
};

interface GlobalSidebarProviderProps {
  children: React.ReactNode;
}

export const GlobalSidebarProvider = ({ children }: GlobalSidebarProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    console.log('GlobalSidebar: toggleSidebar called, current isOpen:', isOpen);
    setIsOpen(prev => {
      console.log('GlobalSidebar: setting isOpen to:', !prev);
      return !prev;
    });
  };
  const openSidebar = () => {
    console.log('GlobalSidebar: openSidebar called');
    setIsOpen(true);
  };
  const closeSidebar = () => {
    console.log('GlobalSidebar: closeSidebar called');
    setIsOpen(false);
  };

  return (
    <GlobalSidebarContext.Provider value={{
      isOpen,
      toggleSidebar,
      openSidebar,
      closeSidebar
    }}>
      {children}
    </GlobalSidebarContext.Provider>
  );
};