import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { useCompany } from '@/contexts/CompanyContext';

export type OperatingMode = 'platform' | 'company';

interface RoleContextType {
  operatingMode: OperatingMode;
  setOperatingMode: (mode: OperatingMode) => void;
  canSwitchMode: boolean;
  effectiveRole: string;
  isPlatformMode: boolean;
  isCompanyMode: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [operatingMode, setOperatingMode] = useState<OperatingMode>('company');
  const { role, isSuperAdmin, isOwner } = useUserRole();
  const { currentCompany } = useCompany();

  console.log('RoleContext Debug:', { role, isSuperAdmin: isSuperAdmin(), isOwner: isOwner(), operatingMode });

  // SuperAdmins can switch between platform and company modes
  const canSwitchMode = isSuperAdmin();

  // Automatically switch to company mode if user is not superadmin
  useEffect(() => {
    if (!isSuperAdmin()) {
      setOperatingMode('company');
    }
  }, [isSuperAdmin]);

  // Determine effective role based on operating mode
  const getEffectiveRole = () => {
    if (operatingMode === 'platform' && isSuperAdmin()) {
      return 'superadmin';
    }
    
    if (operatingMode === 'company') {
      if (isSuperAdmin()) {
        return 'owner'; // Act as company owner when in company mode
      }
      return role || 'user';
    }
    
    return role || 'user';
  };

  const handleSetOperatingMode = (mode: OperatingMode) => {
    // Only allow switching if user is superadmin
    if (canSwitchMode) {
      setOperatingMode(mode);
      // Store preference in localStorage
      localStorage.setItem('operatingMode', mode);
    }
  };

  // Load operating mode preference on mount
  useEffect(() => {
    if (canSwitchMode) {
      const savedMode = localStorage.getItem('operatingMode') as OperatingMode;
      if (savedMode && (savedMode === 'platform' || savedMode === 'company')) {
        setOperatingMode(savedMode);
      }
    }
  }, [canSwitchMode]);

  const isPlatformMode = operatingMode === 'platform';
  const isCompanyMode = operatingMode === 'company';

  return (
    <RoleContext.Provider value={{
      operatingMode,
      setOperatingMode: handleSetOperatingMode,
      canSwitchMode,
      effectiveRole: getEffectiveRole(),
      isPlatformMode,
      isCompanyMode
    }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRoleContext = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRoleContext must be used within a RoleProvider');
  }
  return context;
};