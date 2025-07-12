import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';
import { useRoleContext } from '@/contexts/RoleContext';

export interface Lead {
  id: string;
  company: string;
  contact_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  avatar_url: string | null;
  description: string | null;
  value: number;
  priority: 'High' | 'Medium' | 'Low';
  source: string;
  stage: 'Lead' | 'Contacted' | 'Qualified' | 'Proposal made' | 'Won' | 'Lost';
  location: string | null;
  website: string | null;
  notes: string | null;
  last_activity: string | null;
  created_at: string;
  updated_at: string;
}

export const useLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentCompany } = useCompany();
  const { isPlatformMode, isCompanyMode } = useRoleContext();

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // In platform mode, fetch all leads. In company mode, filter by current company
      let query = supabase.from('leads').select('*');
      
      if (isCompanyMode && currentCompany) {
        query = query.eq('company_id', currentCompany.id);
      } else if (isCompanyMode && !currentCompany) {
        // No company selected in company mode
        setLeads([]);
        setIsLoading(false);
        return;
      }
      // In platform mode, fetch all leads (no filtering)

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setLeads((data || []) as Lead[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      // Refresh the leads data
      await fetchLeads();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update lead');
    }
  };

  const createLead = async (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    if (!currentCompany) {
      throw new Error('No company selected');
    }

    try {
      const { error } = await supabase
        .from('leads')
        .insert([{ ...lead, company_id: currentCompany.id }]);

      if (error) throw error;
      
      // Refresh the leads data
      await fetchLeads();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lead');
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [currentCompany, isPlatformMode, isCompanyMode]);

  // Group leads by stage
  const leadsByStage = leads.reduce((acc, lead) => {
    if (!acc[lead.stage]) {
      acc[lead.stage] = [];
    }
    acc[lead.stage].push(lead);
    return acc;
  }, {} as Record<string, Lead[]>);

  return {
    leads,
    leadsByStage,
    isLoading,
    error,
    updateLead,
    createLead,
    refetch: fetchLeads
  };
};