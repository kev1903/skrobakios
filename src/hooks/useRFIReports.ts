import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RFIReport {
  id: string;
  project_id: string;
  company_id: string;
  title: string;
  description: string;
  status: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useRFIReports = (projectId?: string) => {
  const [reports, setReports] = useState<RFIReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchReports = async () => {
    if (!projectId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('rfi_reports')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (err) {
      console.error('Error fetching RFI reports:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createReport = async (reportData: Partial<RFIReport>) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Get company_id from the project
      const { data: project } = await supabase
        .from('projects')
        .select('company_id')
        .eq('id', projectId)
        .single();

      if (!project) throw new Error('Project not found');

      const { data, error } = await supabase
        .from('rfi_reports')
        .insert({
          project_id: projectId,
          company_id: project.company_id,
          title: reportData.title!,
          description: reportData.description,
          created_by: user.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      setReports(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "RFI report created successfully",
      });
      
      return data;
    } catch (err) {
      console.error('Error creating RFI report:', err);
      toast({
        title: "Error",
        description: "Failed to create RFI report",
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteReport = async (id: string) => {
    try {
      const { error } = await supabase
        .from('rfi_reports')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setReports(prev => prev.filter(report => report.id !== id));
      toast({
        title: "Success",
        description: "RFI report deleted successfully",
      });
    } catch (err) {
      console.error('Error deleting RFI report:', err);
      toast({
        title: "Error",
        description: "Failed to delete RFI report",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchReports();
  }, [projectId]);

  // Set up real-time subscription
  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel('rfi-reports-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rfi_reports',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          fetchReports(); // Refresh data on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  return {
    reports,
    loading,
    error,
    createReport,
    deleteReport,
    refetch: fetchReports,
  };
};