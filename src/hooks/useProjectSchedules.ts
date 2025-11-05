import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProjectSchedule {
  id: string;
  project_id: string;
  name: string;
  type: string;
  status?: string;
  shared_with?: string[];
  is_public: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
  };
}

export const useProjectSchedules = (projectId?: string) => {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<ProjectSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSchedules = async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('project_schedules')
        .select(`
          *,
          profiles!project_schedules_created_by_fkey(first_name, last_name)
        `)
        .eq('project_id', projectId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast({
        title: "Error",
        description: "Failed to load schedules",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [projectId]);

  const createSchedule = async (name: string) => {
    if (!projectId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('project_schedules')
        .insert({
          project_id: projectId,
          name: name || 'Untitled schedule',
          created_by: user?.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Schedule created successfully"
      });

      await fetchSchedules();
      return true;
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast({
        title: "Error",
        description: "Failed to create schedule",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateSchedule = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from('project_schedules')
        .update({ name })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Schedule updated successfully"
      });

      await fetchSchedules();
      return true;
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast({
        title: "Error",
        description: "Failed to update schedule",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('project_schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Schedule deleted successfully"
      });

      await fetchSchedules();
      return true;
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast({
        title: "Error",
        description: "Failed to delete schedule",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    schedules,
    loading,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    refetch: fetchSchedules
  };
};
