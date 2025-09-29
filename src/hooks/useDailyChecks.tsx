import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDailyChecks = () => {
  const [checkedProjects, setCheckedProjects] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load today's checked projects from database
  const loadDailyChecks = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('project_daily_checks')
        .select('project_id')
        .eq('checked_date', today)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) {
        console.error('Error loading daily checks:', error);
        return;
      }

      const checkedProjectIds = new Set(data?.map(check => check.project_id) || []);
      setCheckedProjects(checkedProjectIds);
    } catch (error) {
      console.error('Error in loadDailyChecks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle daily check for a project
  const toggleDailyCheck = async (projectId: string) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to perform daily checks",
        variant: "destructive",
      });
      return;
    }

    const isCurrentlyChecked = checkedProjects.has(projectId);
    const today = new Date().toISOString().split('T')[0];

    try {
      if (isCurrentlyChecked) {
        // Remove check
        const { error } = await supabase
          .from('project_daily_checks')
          .delete()
          .eq('project_id', projectId)
          .eq('user_id', user.id)
          .eq('checked_date', today);

        if (error) {
          console.error('Error removing daily check:', error);
          toast({
            title: "Error",
            description: "Failed to remove daily check",
            variant: "destructive",
          });
          return;
        }

        // Update local state
        const newCheckedProjects = new Set(checkedProjects);
        newCheckedProjects.delete(projectId);
        setCheckedProjects(newCheckedProjects);

        toast({
          title: "Daily Check Removed",
          description: "Project daily check has been removed",
        });
      } else {
        // Add check
        const { error } = await supabase
          .from('project_daily_checks')
          .insert({
            project_id: projectId,
            user_id: user.id,
            checked_date: today,
          });

        if (error) {
          console.error('Error adding daily check:', error);
          toast({
            title: "Error",
            description: "Failed to add daily check",
            variant: "destructive",
          });
          return;
        }

        // Update local state
        const newCheckedProjects = new Set(checkedProjects);
        newCheckedProjects.add(projectId);
        setCheckedProjects(newCheckedProjects);

        toast({
          title: "Daily Check Complete",
          description: "Project has been marked as checked for today",
        });
      }
    } catch (error) {
      console.error('Error in toggleDailyCheck:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  // Load checks on component mount
  useEffect(() => {
    loadDailyChecks();
  }, []);

  return {
    checkedProjects,
    loading: loading,
    toggleDailyCheck,
    refreshChecks: loadDailyChecks,
  };
};