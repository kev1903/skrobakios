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
      console.log('🔍 Getting current user...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('❌ User Error:', userError);
        throw new Error('User not authenticated');
      }
      
      console.log('👤 Current user ID:', user.id, user.email);
      
      console.log('🏗 Using RPC get_user_companies...');
      let companies: UserCompany[] = [];
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_user_companies', { target_user_id: user.id });
      console.log('📞 RPC Response:', { data: rpcData, error: rpcError });

      if (!rpcError && rpcData) {
        companies = (rpcData as any[]).map((item: any) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          logo_url: item.logo_url,
          role: item.role,
          status: item.status,
        }));
      } else {
        console.warn('⚠️ RPC failed or returned no data, falling back to direct query', rpcError);
        const { data, error: fetchError } = await supabase
          .from('company_members')
          .select(`
            company_id,
            role,
            status,
            companies!company_members_company_id_fkey (
              id,
              name,
              slug,
              logo_url,
              business_type
            )
          `)
          .eq('user_id', user.id);

        console.log('📞 Direct Query Response:', { data, error: fetchError });

        if (fetchError) {
          console.error('❌ Query Error:', fetchError);
          throw fetchError;
        }
        
        companies = (data || []).map((item: any) => ({
          id: item.company_id,
          name: item.companies?.name || 'Unknown',
          slug: item.companies?.slug || '',
          logo_url: item.companies?.logo_url,
          role: item.role,
          status: item.status,
        }));
      }
      
      // Also include companies where the user is an active project member
      let projectDerivedCompanies: UserCompany[] = [];
      
      try {
        const { data: projectMemberships, error: pmError } = await supabase
          .from('project_members')
          .select('project_id, role, status')
          .eq('user_id', user.id)
          .eq('status', 'active');
        
        if (pmError) {
          console.warn('⚠️ Project memberships fetch error (non-fatal):', pmError);
        } else if (projectMemberships && projectMemberships.length > 0) {
          const projectIds = Array.from(new Set(projectMemberships.map(pm => pm.project_id).filter(Boolean)));
          
          if (projectIds.length > 0) {
            const { data: projects, error: projectsError } = await supabase
              .from('projects')
              .select('id, company_id')
              .in('id', projectIds);
            
            if (projectsError) {
              console.warn('⚠️ Projects fetch error (non-fatal):', projectsError);
            } else {
              const companyIds = Array.from(new Set((projects || []).map(p => p.company_id).filter(Boolean)));
              
              if (companyIds.length > 0) {
                const { data: companiesRows, error: companiesError } = await supabase
                  .from('companies')
                  .select('id, name, slug, logo_url, business_type')
                  .in('id', companyIds);
                  
                if (companiesError) {
                  console.warn('⚠️ Companies fetch error (non-fatal):', companiesError);
                } else {
                  projectDerivedCompanies = (companiesRows || []).map((c: any) => ({
                    id: c.id,
                    name: c.name,
                    slug: c.slug,
                    logo_url: c.logo_url,
                    role: 'member', // Company-level role unknown for project-only users; default to member
                    status: 'active',
                    business_type: c.business_type
                  }));
                }
              }
            }
          }
        }
      } catch (e) {
        console.warn('⚠️ Non-fatal error while augmenting companies from project memberships:', e);
      }
      
      // Merge and de-duplicate by company id
      const mergedMap = new Map<string, UserCompany>();
      [...(companies as UserCompany[]), ...projectDerivedCompanies].forEach(c => {
        if (!mergedMap.has(c.id)) mergedMap.set(c.id, c);
      });
      const mergedCompanies = Array.from(mergedMap.values());
      
      console.log('✅ Companies processed successfully (merged):', mergedCompanies);
      return mergedCompanies as UserCompany[];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch companies';
      console.error('💥 getUserCompanies error:', err);
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
        .insert([{ 
          name: companyData.name,
          slug: companyData.slug,
          logo_url: companyData.logo_url,
          website: companyData.website,
          address: companyData.address,
          phone: companyData.phone,
          abn: companyData.abn,
          slogan: companyData.slogan,
          created_by: userData.user.id 
        }])
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
      console.log('Updating company:', companyId, 'with updates:', updates);
      
      const { data, error: updateError } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', companyId)
        .select()
        .single();

      if (updateError) {
        console.error('Company update error:', updateError);
        throw updateError;
      }
      
      console.log('Company updated successfully:', data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update company';
      console.error('Update company catch block:', err);
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

  const deleteCompany = useCallback(async (companyId: string): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: deleteError } = await supabase
        .rpc('delete_company_completely', { target_company_id: companyId });

      if (deleteError) throw deleteError;
      
      const result = data as { success: boolean; message: string; error?: string };
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete company');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete company';
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
    deleteCompany,
    loading,
    error
  };
};