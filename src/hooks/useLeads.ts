import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';

export interface Lead {
  id: string;
  company_id: string;
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
  project_address: string | null;
  created_at: string;
  updated_at: string;
}

export const useLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentCompany } = useCompany();

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

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

  const createLead = async (leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'company_id'>) => {
    if (!currentCompany?.id) {
      setError('No company selected. Please select a company first.');
      return;
    }

    try {
      const lead = {
        ...leadData,
        company_id: currentCompany.id
      };
      
      const { error } = await supabase
        .from('leads')
        .insert([lead]);

      if (error) throw error;
      
      // Refresh the leads data
      await fetchLeads();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lead');
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

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