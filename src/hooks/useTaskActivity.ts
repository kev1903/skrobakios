import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TaskActivity {
  id: string;
  task_id: string;
  user_name: string;
  user_avatar?: string;
  action_type: string;
  action_description: string;
  created_at: string;
}

export const useTaskActivity = (taskId: string) => {
  const [activities, setActivities] = useState<TaskActivity[]>([]);
  const [loading, setLoading] = useState(false);

  const loadActivities = async () => {
    if (!taskId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('task_activity_log')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (activityData: Omit<TaskActivity, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('task_activity_log')
        .insert([activityData])
        .select()
        .single();

      if (error) throw error;
      
      setActivities(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadActivities();
  }, [taskId]);

  return {
    activities,
    loading,
    logActivity,
    loadActivities
  };
};