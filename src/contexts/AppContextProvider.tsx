import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ContextType = 'personal' | 'company';

interface AppContextState {
  activeContext: ContextType;
  setActiveContext: (context: ContextType) => void;
  getContextRoute: (context: ContextType) => string;
}

const AppContext = createContext<AppContextState | undefined>(undefined);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [activeContext, setActiveContextState] = useState<ContextType>('company');

  // Load saved context from localStorage on mount
  useEffect(() => {
    const savedContext = localStorage.getItem('activeContext') as ContextType;
    if (savedContext && (savedContext === 'personal' || savedContext === 'company')) {
      setActiveContextState(savedContext);
    }
  }, []);

  const setActiveContext = (context: ContextType) => {
    setActiveContextState(context);
    localStorage.setItem('activeContext', context);
  };

  const getContextRoute = (context: ContextType): string => {
    switch (context) {
      case 'personal':
        return 'personal-dashboard';
      case 'company':
        return 'home';
      default:
        return 'home';
    }
  };

  return (
    <AppContext.Provider value={{
      activeContext,
      setActiveContext,
      getContextRoute
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};