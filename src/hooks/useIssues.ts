import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Issue {
  id: string;
  project_id: string;
  company_id: string;
  issue_number: string;
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
  resolved_date: string | null;
  location: string | null;
  attachments: any;
  comments: any;
}

export const useIssues = (projectId?: string) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchIssues = async () => {
    if (!projectId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIssues(data || []);
    } catch (err) {
      console.error('Error fetching issues:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const deleteIssue = async (id: string) => {
    try {
      const { error } = await supabase
        .from('issues')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setIssues(prev => prev.filter(issue => issue.id !== id));
      toast({
        title: "Success",
        description: "Issue deleted successfully",
      });
    } catch (err) {
      console.error('Error deleting issue:', err);
      toast({
        title: "Error",
        description: "Failed to delete issue",
        variant: "destructive",
      });
    }
  };

  const exportIssue = async (issue: Issue) => {
    try {
      const csvContent = `Issue Number,Title,Description,Status,Priority,Assigned To,Created Date
${issue.issue_number},"${issue.title}","${issue.description}",${issue.status},${issue.priority},${issue.assigned_to},${new Date(issue.created_at).toLocaleDateString()}`;

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${issue.issue_number}_export.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Issue exported successfully",
      });
    } catch (err) {
      console.error('Error exporting issue:', err);
      toast({
        title: "Error",
        description: "Failed to export issue",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [projectId]);

  // Set up real-time subscription
  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel('issues-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'issues',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          fetchIssues(); // Refresh data on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  return {
    issues,
    loading,
    error,
    deleteIssue,
    exportIssue,
    refetch: fetchIssues,
  };
};