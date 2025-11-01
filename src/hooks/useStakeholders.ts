import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Stakeholder {
  id: string;
  display_name: string;
  category: 'client' | 'trade' | 'subcontractor' | 'supplier' | 'consultant';
  trade_industry?: string;
  primary_contact_name?: string;
  primary_email?: string;
  primary_phone?: string;
  status: 'active' | 'inactive' | 'pending';
  compliance_status?: 'valid' | 'expired' | 'expiring';
  tags?: string[] | null;
  abn?: string;
  company_id: string;
}

interface UseStakeholdersOptions {
  companyId?: string;
  category?: 'client' | 'trade' | 'subcontractor' | 'supplier' | 'consultant';
  status?: ('active' | 'inactive' | 'pending')[];
  enabled?: boolean;
}

interface UseStakeholdersReturn {
  stakeholders: Stakeholder[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useStakeholders = ({
  companyId,
  category,
  status = ['active'],
  enabled = true,
}: UseStakeholdersOptions): UseStakeholdersReturn => {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStakeholders = async () => {
    if (!enabled || !companyId) {
      setStakeholders([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('stakeholders')
        .select('*')
        .eq('company_id', companyId);

      if (category) {
        query = query.eq('category', category);
      }

      if (status && status.length > 0) {
        query = query.in('status', status);
      }

      query = query.order('display_name', { ascending: true });

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('Error fetching stakeholders:', fetchError);
        setError(fetchError.message);
        toast.error('Failed to load stakeholders');
        return;
      }

      setStakeholders(data || []);
    } catch (err) {
      console.error('Error fetching stakeholders:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Failed to load stakeholders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStakeholders();
  }, [companyId, category, JSON.stringify(status), enabled]);

  return {
    stakeholders,
    loading,
    error,
    refetch: fetchStakeholders,
  };
};
