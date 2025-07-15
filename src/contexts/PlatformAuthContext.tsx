import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useUserRole } from '@/hooks/useUserRole';

interface PlatformAuthContextType {
  isPlatformAuthenticated: boolean;
  authenticatePlatform: () => void;
  clearPlatformAuth: () => void;
}

const PlatformAuthContext = createContext<PlatformAuthContextType | undefined>(undefined);

export const PlatformAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlatformAuthenticated, setIsPlatformAuthenticated] = useState(false);
  const { user } = useAuth();
  const { isSuperAdmin } = useUserRole();

  // Clear platform auth when user logs out or is not superadmin
  useEffect(() => {
    if (!user || !isSuperAdmin()) {
      setIsPlatformAuthenticated(false);
    }
  }, [user, isSuperAdmin]);

  // Clear platform auth on browser navigation away from platform
  useEffect(() => {
    const handlePopState = () => {
      if (!window.location.href.includes('platform')) {
        setIsPlatformAuthenticated(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Clear platform auth on page refresh (forces re-authentication)
  useEffect(() => {
    const handleBeforeUnload = () => {
      setIsPlatformAuthenticated(false);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const authenticatePlatform = () => {
    if (user && isSuperAdmin()) {
      setIsPlatformAuthenticated(true);
    }
  };

  const clearPlatformAuth = () => {
    setIsPlatformAuthenticated(false);
  };

  return (
    <PlatformAuthContext.Provider value={{
      isPlatformAuthenticated,
      authenticatePlatform,
      clearPlatformAuth
    }}>
      {children}
    </PlatformAuthContext.Provider>
  );
};

export const usePlatformAuth = () => {
  const context = useContext(PlatformAuthContext);
  if (context === undefined) {
    throw new Error('usePlatformAuth must be used within a PlatformAuthProvider');
  }
  return context;
};