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
      
      // Find the first active company or default to first company
      let activeCompany = userCompanies.find(c => c.status === 'active');
      
      // If no active company found but we have companies, activate the first one
      if (!activeCompany && userCompanies.length > 0) {
        console.log('⚠️ No active company found, activating first company');
        const firstCompany = userCompanies[0];
        
        try {
          // Update database to activate the first company
          await supabase
            .from('company_members')
            .update({ status: 'active' })
            .eq('user_id', user?.id)
            .eq('company_id', firstCompany.id);
          
          // Update local state
          activeCompany = { ...firstCompany, status: 'active' };
          console.log('✅ Activated company:', activeCompany.name);
        } catch (error) {
          console.error('Failed to activate company:', error);
          activeCompany = firstCompany; // Fallback to local state
        }
      }
      
      if (activeCompany) {
        console.log('🎯 Setting active company:', activeCompany.name, activeCompany.status);
        setCurrentCompany(activeCompany);
        localStorage.setItem('currentCompanyId', activeCompany.id);
      } else {
        console.log('⚠️ No companies found');
        setCurrentCompany(null);
        localStorage.removeItem('currentCompanyId');
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
        console.log('🔄 Switching to company:', company.name, companyId);
        
        // Use a single transaction-like approach with RPC or multiple operations
        // First, deactivate all companies for this user
        const { error: deactivateError } = await supabase
          .from('company_members')
          .update({ status: 'inactive', updated_at: new Date().toISOString() })
          .eq('user_id', user.id);

        if (deactivateError) {
          console.error('Error deactivating companies:', deactivateError);
          throw deactivateError;
        }

        // Then activate the selected company
        const { error: activateError, data: activatedData } = await supabase
          .from('company_members')
          .update({ status: 'active', updated_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('company_id', companyId)
          .select();

        if (activateError) {
          console.error('Error activating company:', activateError);
          throw activateError;
        }

        if (!activatedData || activatedData.length === 0) {
          throw new Error('No company membership found to activate');
        }

        console.log('✅ Company activated:', activatedData[0]);

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