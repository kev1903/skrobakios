import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';

interface ActiveBusinessState {
  activeBusinessId: string | null;
  setActiveBusiness: (businessId: string) => void;
  loading: boolean;
}

export const useActiveBusiness = (): ActiveBusinessState => {
  const { currentCompany, switchCompany, loading: companyLoading } = useCompany();
  const [loading, setLoading] = useState(false);

  const setActiveBusiness = useCallback(async (businessId: string) => {
    setLoading(true);
    try {
      // Switch to the business using existing context
      await switchCompany(businessId);
      
      // Store in localStorage for persistence
      localStorage.setItem('activeBusinessId', businessId);
      
      // Update user preferences for future enhancement
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // For now, just store in localStorage
          // Later this could be enhanced with user preferences table
          console.log('User selected business:', businessId);
        }
      } catch (error) {
        console.warn('Could not update user business preference:', error);
      }
    } catch (error) {
      console.error('Failed to set active business:', error);
    } finally {
      setLoading(false);
    }
  }, [switchCompany]);

  // Initialize active business from localStorage or current company
  useEffect(() => {
    const storedBusinessId = localStorage.getItem('activeBusinessId');
    if (storedBusinessId && !currentCompany) {
      setActiveBusiness(storedBusinessId);
    }
  }, [currentCompany, setActiveBusiness]);

  return {
    activeBusinessId: currentCompany?.id || null,
    setActiveBusiness,
    loading: loading || companyLoading
  };
};