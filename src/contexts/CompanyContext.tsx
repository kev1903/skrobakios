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
    console.log('🔵 refreshCompanies called, user?.id:', user?.id);
    if (!user?.id) {
      console.log('⚠️ No user ID available for refreshCompanies');
      return;
    }
    
    try {
      console.log('🏢 Fetching companies for user:', user.id);
      const userCompanies = await getUserCompanies({ bypassCache: true });
      console.log('✅ Fetched companies:', userCompanies);
      
      setCompanies(userCompanies);
      
      // Get saved company ID to maintain selection
      const savedCompanyId = localStorage.getItem('currentCompanyId');
      
      // Find the current company if it exists and is still active, otherwise find first active company
      let activeCompany = savedCompanyId 
        ? userCompanies.find(c => c.id === savedCompanyId && c.status === 'active')
        : null;
      
      // If saved company not found or not active, find the first active company
      if (!activeCompany) {
        activeCompany = userCompanies.find(c => c.status === 'active');
      }
      
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
        setCurrentCompany(prevCompany => {
          // Only update if the company actually changed to prevent unnecessary re-renders
          if (prevCompany?.id !== activeCompany.id) {
            localStorage.setItem('currentCompanyId', activeCompany.id);
            return activeCompany;
          }
          return prevCompany;
        });
      } else {
        console.log('⚠️ No businesses found');
        setCurrentCompany(null);
        localStorage.removeItem('currentCompanyId');
      }
      
    } catch (err) {
      console.error('Error fetching businesses:', err);
      // On error, try to fallback to any saved company ID
      const savedCompanyId = localStorage.getItem('currentCompanyId');
      if (savedCompanyId && companies.length > 0) {
        const fallbackCompany = companies.find(c => c.id === savedCompanyId);
        if (fallbackCompany) {
          console.log('Using fallback company:', fallbackCompany.name);
          setCurrentCompany(fallbackCompany);
        }
      }
    }
  }, [getUserCompanies, user?.id, isAuthenticated]);

  const switchCompany = async (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    if (company && user && user.id) {
      try {
        console.log('🔄 Switching to company:', company.name, companyId);
        console.log('👤 User ID:', user.id);
        
        // Use the new safe atomic switching function
        const { data, error } = await supabase.rpc('switch_user_company', {
          target_user_id: user.id,
          target_company_id: companyId
        });

        if (error) {
          console.error('Error switching company:', error);
          throw error;
        }

        const result = data as { success: boolean; error?: string; company_id?: string };
        if (!result?.success) {
          console.error('Company switch failed:', result?.error);
          throw new Error(result?.error || 'Company switch failed');
        }

        console.log('✅ Successfully switched to company:', company.name);
        
        // Update the company to show active status
        const updatedCompany = { ...company, status: 'active' as const };
        setCurrentCompany(updatedCompany);
        localStorage.setItem('currentCompanyId', companyId);
        
        // Clear cache to force fresh data fetch
        localStorage.removeItem('projects_cache');
        
        // Update companies list with the selected company as active
        // Note: Don't deactivate other companies - user can have multiple active memberships
        const updatedCompanies = companies.map(c => 
          c.id === companyId ? { ...c, status: 'active' as const } : c
        );
        setCompanies(updatedCompanies);
        
        // Emit company changed event for other contexts
        window.dispatchEvent(new CustomEvent('companyChanged', { 
          detail: { companyId, companyName: company.name } 
        }));
      } catch (error) {
        console.error('Failed to switch company:', error);
        // Fallback to local state update only if we have valid user
        if (user && user.id) {
          setCurrentCompany(company);
          localStorage.setItem('currentCompanyId', companyId);
        }
      }
    } else {
      console.error('❌ Cannot switch company: missing company, user, or user.id', {
        company: !!company,
        user: !!user,
        userId: user?.id
      });
    }
  };

  // Load companies when auth state changes
  useEffect(() => {
    console.log('🔵 CompanyContext useEffect triggered:', { isAuthenticated, userId: user?.id });
    
    if (isAuthenticated && user?.id) {
      console.log('🔄 Calling refreshCompanies for user:', user.id);
      refreshCompanies();
    } else {
      console.log('⚠️ Not authenticated, clearing companies');
      setCompanies([]);
      setCurrentCompany(null);
    }
  }, [isAuthenticated, user?.id, refreshCompanies]);

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