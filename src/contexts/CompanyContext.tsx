import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useCompanies } from '@/hooks/useCompanies';
import { UserCompany } from '@/types/company';
import { useAuth } from '@/contexts/AuthContext';

interface CompanyContextType {
  currentCompany: UserCompany | null;
  companies: UserCompany[];
  switchCompany: (companyId: string) => void;
  loading: boolean;
  error: string | null;
  refreshCompanies: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider = ({ children }: { children: ReactNode }) => {
  const [currentCompany, setCurrentCompany] = useState<UserCompany | null>(null);
  const [companies, setCompanies] = useState<UserCompany[]>([]);
  const { getUserCompanies, loading, error } = useCompanies();
  const { user, isAuthenticated } = useAuth();

  const refreshCompanies = async () => {
    try {
      const userCompanies = await getUserCompanies();
      setCompanies(userCompanies);
      
      // Check if there's a saved company ID in localStorage
      const savedCompanyId = localStorage.getItem('currentCompanyId');
      
      if (savedCompanyId) {
        // Try to restore the saved company
        const savedCompany = userCompanies.find(c => c.id === savedCompanyId);
        if (savedCompany) {
          setCurrentCompany(savedCompany);
          return;
        }
      }
      
      // If no saved company or saved company not found, auto-select first company if none is selected
      if (userCompanies.length > 0 && !currentCompany) {
        setCurrentCompany(userCompanies[0]);
        localStorage.setItem('currentCompanyId', userCompanies[0].id);
      } else if (currentCompany) {
        // Update the current company with fresh data but keep the same company selected
        const updatedCurrentCompany = userCompanies.find(c => c.id === currentCompany.id);
        if (updatedCurrentCompany) {
          setCurrentCompany(updatedCurrentCompany);
          localStorage.setItem('currentCompanyId', updatedCurrentCompany.id);
        }
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  };

  const switchCompany = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    if (company) {
      setCurrentCompany(company);
      localStorage.setItem('currentCompanyId', companyId);
    }
  };

  useEffect(() => {
    // Load companies and restore selected company from localStorage
    const loadCompanies = async () => {
      if (!isAuthenticated) {
        return;
      }
      
      await refreshCompanies();
    };

    loadCompanies();
  }, [isAuthenticated]);

  // Update current company when companies list changes
  useEffect(() => {
    if (currentCompany && companies.length > 0) {
      const updatedCompany = companies.find(c => c.id === currentCompany.id);
      if (updatedCompany) {
        setCurrentCompany(updatedCompany);
      }
    }
  }, [companies, currentCompany]);

  return (
    <CompanyContext.Provider value={{
      currentCompany,
      companies,
      switchCompany,
      loading,
      error,
      refreshCompanies
    }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};