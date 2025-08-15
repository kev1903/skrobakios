import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useCompanies } from '@/hooks/useCompanies';
import { UserCompany } from '@/types/company';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface CompanyContextType {
  currentCompany: UserCompany | null;
  companies: UserCompany[];
  switchCompany: (companyId: string) => Promise<void>;
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

  const refreshCompanies = useCallback(async () => {
    try {
      console.log('🏢 Refreshing companies...');
      console.log('🔐 Current user:', user?.id, user?.email);
      console.log('✅ Is authenticated:', isAuthenticated);
      
      // Add a small delay to ensure auth is fully ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const userCompanies = await getUserCompanies();
      console.log('📊 Fetched user companies:', userCompanies);
      
      setCompanies(userCompanies);
      
      // Check if there's a saved company ID in localStorage
      const savedCompanyId = localStorage.getItem('currentCompanyId');
      console.log('Saved company ID from localStorage:', savedCompanyId);
      
      if (savedCompanyId) {
        // Try to restore the saved company
        const savedCompany = userCompanies.find(c => c.id === savedCompanyId);
        if (savedCompany) {
          console.log('Restoring saved company:', savedCompany.name);
          setCurrentCompany(savedCompany);
          return;
        } else {
          console.log('Saved company not found, clearing localStorage');
          localStorage.removeItem('currentCompanyId');
        }
      }
      
      // If no saved company or saved company not found, auto-select first company if none is selected
      if (userCompanies.length > 0 && !currentCompany) {
        console.log('Auto-selecting first company:', userCompanies[0].name);
        setCurrentCompany(userCompanies[0]);
        localStorage.setItem('currentCompanyId', userCompanies[0].id);
      } else if (currentCompany) {
        // Update the current company with fresh data but keep the same company selected
        const updatedCurrentCompany = userCompanies.find(c => c.id === currentCompany.id);
        if (updatedCurrentCompany) {
          console.log('Updating current company with fresh data:', updatedCurrentCompany.name);
          setCurrentCompany(updatedCurrentCompany);
          localStorage.setItem('currentCompanyId', updatedCurrentCompany.id);
        } else {
          console.log('Current company no longer exists, auto-selecting first available');
          if (userCompanies.length > 0) {
            setCurrentCompany(userCompanies[0]);
            localStorage.setItem('currentCompanyId', userCompanies[0].id);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
      // On error, try to fallback to any saved company ID
      const savedCompanyId = localStorage.getItem('currentCompanyId');
      if (savedCompanyId && companies.length > 0) {
        const fallbackCompany = companies.find(c => c.id === savedCompanyId);
        if (fallbackCompany && !currentCompany) {
          console.log('Using fallback company:', fallbackCompany.name);
          setCurrentCompany(fallbackCompany);
        }
      }
    }
  }, [getUserCompanies]);

  const switchCompany = async (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    if (company && user) {
      try {
        // First, deactivate all companies for this user
        await supabase
          .from('company_members')
          .update({ status: 'inactive' })
          .eq('user_id', user.id);

        // Then activate the selected company
        const { error } = await supabase
          .from('company_members')
          .update({ status: 'active' })
          .eq('user_id', user.id)
          .eq('company_id', companyId);

        if (error) {
          console.error('Error switching company:', error);
          throw error;
        }

        setCurrentCompany(company);
        localStorage.setItem('currentCompanyId', companyId);
        
        console.log('✅ Successfully switched to company:', company.name);
        
        // Clear cache to force fresh data fetch
        localStorage.removeItem('projects_cache');
        
        // Emit a custom event to notify components of company change
        window.dispatchEvent(new CustomEvent('companyChanged', { 
          detail: { companyId, companyName: company.name } 
        }));
      } catch (error) {
        console.error('Failed to switch company:', error);
        // Fallback to local state update only
        setCurrentCompany(company);
        localStorage.setItem('currentCompanyId', companyId);
      }
    }
  };

  useEffect(() => {
    // Load companies and restore selected company from localStorage
    const loadCompanies = async () => {
      if (!isAuthenticated || !user) {
        console.log('🚫 Not authenticated or no user, skipping company load');
        return;
      }
      
      console.log('👤 User authenticated, loading companies for user:', user.id);
      
      // Try loading companies with retry mechanism
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          await refreshCompanies();
          break; // Success, exit retry loop
        } catch (error) {
          retryCount++;
          console.log(`💔 Company load attempt ${retryCount} failed:`, error);
          
          if (retryCount < maxRetries) {
            // Wait longer for each retry
            await new Promise(resolve => setTimeout(resolve, 500 * retryCount));
          } else {
            console.error('💥 Failed to load companies after all retries');
            
            // As a last resort, try to refresh the page after a short delay
            // This can help resolve auth context issues
            setTimeout(() => {
              console.log('🔄 Refreshing page due to persistent company loading issues...');
              window.location.reload();
            }, 2000);
          }
        }
      }
    };

    loadCompanies();
  }, [isAuthenticated, user, refreshCompanies]);

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