import React, { createContext, useContext, useEffect } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { useCompanyModules } from '@/hooks/useCompanyModules';

interface CompanyModulesContextType {
  loading: boolean;
  isModuleEnabled: (companyId: string, moduleName: string) => boolean;
  getEnabledModules: (companyId: string) => string[];
  refreshModules: (companyId: string) => Promise<void>;
}

const CompanyModulesContext = createContext<CompanyModulesContextType | undefined>(undefined);

export const useCompanyModulesContext = () => {
  const context = useContext(CompanyModulesContext);
  if (!context) {
    throw new Error('useCompanyModulesContext must be used within a CompanyModulesProvider');
  }
  return context;
};

interface CompanyModulesProviderProps {
  children: React.ReactNode;
}

export const CompanyModulesProvider = ({ children }: CompanyModulesProviderProps) => {
  const { currentCompany } = useCompany();
  const { 
    loading, 
    isModuleEnabled, 
    getEnabledModules, 
    fetchCompanyModules 
  } = useCompanyModules();

  // Auto-fetch modules when company changes
  useEffect(() => {
    if (currentCompany?.id) {
      fetchCompanyModules(currentCompany.id);
    }
  }, [currentCompany?.id, fetchCompanyModules]);

  const refreshModules = async (companyId: string) => {
    await fetchCompanyModules(companyId);
  };

  const value = {
    loading,
    isModuleEnabled,
    getEnabledModules,
    refreshModules
  };

  return (
    <CompanyModulesContext.Provider value={value}>
      {children}
    </CompanyModulesContext.Provider>
  );
};