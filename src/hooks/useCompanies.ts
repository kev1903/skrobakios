import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Company, CreateCompanyData, UserCompany } from '@/types/company';

export const useCompanies = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUserCompanies = useCallback(async (): Promise<UserCompany[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .rpc('get_user_companies');

      if (fetchError) throw fetchError;
      return (data || []) as UserCompany[];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch companies';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCompany = useCallback(async (companyId: string): Promise<Company | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();

      if (fetchError) throw fetchError;
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch company';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCompany = useCallback(async (companyData: CreateCompanyData): Promise<Company | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      // Create company
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert([{ ...companyData, created_by: userData.user.id }])
        .select()
        .single();

      if (companyError) throw companyError;

      // Add user as owner
      const { error: memberError } = await supabase
        .from('company_members')
        .insert([{
          company_id: company.id,
          user_id: userData.user.id,
          role: 'owner',
          status: 'active'
        }]);

      if (memberError) throw memberError;

      return company;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create company';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCompany = useCallback(async (
    companyId: string, 
    updates: Partial<Omit<Company, 'id' | 'created_at' | 'updated_at' | 'created_by'>>
  ): Promise<Company | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: updateError } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', companyId)
        .select()
        .single();

      if (updateError) throw updateError;
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update company';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const inviteUserToCompany = useCallback(async (
    companyId: string, 
    userId: string, 
    role: 'admin' | 'member' = 'member'
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: inviteError } = await supabase
        .from('company_members')
        .insert([{
          company_id: companyId,
          user_id: userId,
          role,
          status: 'invited'
        }])
        .select()
        .single();

      if (inviteError) throw inviteError;
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to invite user';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getUserCompanies,
    getCompany,
    createCompany,
    updateCompany,
    inviteUserToCompany,
    loading,
    error
  };
};