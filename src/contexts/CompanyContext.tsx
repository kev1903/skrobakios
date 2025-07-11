import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useCompanies } from '@/hooks/useCompanies';
import { UserCompany } from '@/types/company';

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

  const refreshCompanies = async () => {
    try {
      const userCompanies = await getUserCompanies();
      setCompanies(userCompanies);
      
      // Auto-select first company if none is selected
      if (userCompanies.length > 0 && !currentCompany) {
        setCurrentCompany(userCompanies[0]);
        localStorage.setItem('currentCompanyId', userCompanies[0].id);
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
      await refreshCompanies();
      
      const savedCompanyId = localStorage.getItem('currentCompanyId');
      if (savedCompanyId) {
        const savedCompany = companies.find(c => c.id === savedCompanyId);
        if (savedCompany) {
          setCurrentCompany(savedCompany);
        }
      }
    };

    loadCompanies();
  }, []);

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