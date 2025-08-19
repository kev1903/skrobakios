import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Defect {
  id: string;
  project_id: string;
  company_id: string;
  defect_number: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  severity: string;
  status: string;
  assigned_to: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  due_date: string | null;
  fixed_date: string | null;
  verified_date: string | null;
  location: string | null;
  attachments: any;
  comments: any;
}

export const useDefects = (projectId?: string) => {
  const [defects, setDefects] = useState<Defect[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDefects = async () => {
    if (!projectId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('defects')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDefects(data || []);
    } catch (err) {
      console.error('Error fetching defects:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const deleteDefect = async (id: string) => {
    try {
      const { error } = await supabase
        .from('defects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setDefects(prev => prev.filter(defect => defect.id !== id));
      toast({
        title: "Success",
        description: "Defect deleted successfully",
      });
    } catch (err) {
      console.error('Error deleting defect:', err);
      toast({
        title: "Error",
        description: "Failed to delete defect",
        variant: "destructive",
      });
    }
  };

  const exportDefect = async (defect: Defect) => {
    try {
      const csvContent = `Defect Number,Title,Description,Status,Priority,Severity,Assigned To,Created Date
${defect.defect_number},"${defect.title}","${defect.description}",${defect.status},${defect.priority},${defect.severity},${defect.assigned_to},${new Date(defect.created_at).toLocaleDateString()}`;

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${defect.defect_number}_export.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Defect exported successfully",
      });
    } catch (err) {
      console.error('Error exporting defect:', err);
      toast({
        title: "Error",
        description: "Failed to export defect",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchDefects();
  }, [projectId]);

  // Set up real-time subscription
  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel('defects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'defects',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          fetchDefects(); // Refresh data on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  return {
    defects,
    loading,
    error,
    deleteDefect,
    exportDefect,
    refetch: fetchDefects,
  };
};