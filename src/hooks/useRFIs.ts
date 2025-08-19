import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RFI {
  id: string;
  project_id: string;
  company_id: string;
  rfi_number: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  assigned_to: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  due_date: string | null;
  response_required_by: string | null;
  resolved_date: string | null;
  location: string | null;
  attachments: any;
  responses: any;
}

export const useRFIs = (projectId?: string) => {
  const [rfis, setRFIs] = useState<RFI[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRFIs = async () => {
    if (!projectId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('rfis')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRFIs(data || []);
    } catch (err) {
      console.error('Error fetching RFIs:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const deleteRFI = async (id: string) => {
    try {
      const { error } = await supabase
        .from('rfis')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setRFIs(prev => prev.filter(rfi => rfi.id !== id));
      toast({
        title: "Success",
        description: "RFI deleted successfully",
      });
    } catch (err) {
      console.error('Error deleting RFI:', err);
      toast({
        title: "Error",
        description: "Failed to delete RFI",
        variant: "destructive",
      });
    }
  };

  const exportRFI = async (rfi: RFI) => {
    try {
      const csvContent = `RFI Number,Title,Description,Status,Priority,Assigned To,Created Date
${rfi.rfi_number},"${rfi.title}","${rfi.description}",${rfi.status},${rfi.priority},${rfi.assigned_to},${new Date(rfi.created_at).toLocaleDateString()}`;

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${rfi.rfi_number}_export.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "RFI exported successfully",
      });
    } catch (err) {
      console.error('Error exporting RFI:', err);
      toast({
        title: "Error",
        description: "Failed to export RFI",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchRFIs();
  }, [projectId]);

  // Set up real-time subscription
  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel('rfis-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rfis',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          fetchRFIs(); // Refresh data on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  return {
    rfis,
    loading,
    error,
    deleteRFI,
    exportRFI,
    refetch: fetchRFIs,
  };
};