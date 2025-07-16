import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export interface Activity {
  id: string;
  name: string;
  description?: string;
  duration?: string;
  start_date?: string;
  end_date?: string;
  dependencies: string[];
  cost_est: number;
  cost_actual: number;
  quality_metrics: Record<string, any>;
  project_id: string;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export function useActivities(projectId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Subscribe to realtime changes
  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel('activities-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          console.log('Activity realtime update:', payload);
          queryClient.invalidateQueries({ queryKey: ['activities', projectId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, queryClient]);

  const {
    data: activities,
    isLoading,
    error
  } = useQuery({
    queryKey: ['activities', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Activity[];
    },
    enabled: !!projectId
  });

  const createActivity = useMutation({
    mutationFn: async (activityData: Omit<Activity, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('activities')
        .insert(activityData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', projectId] });
      toast({
        title: "Success",
        description: "Activity created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updateActivity = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Activity> & { id: string }) => {
      const { data, error } = await supabase
        .from('activities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', projectId] });
      toast({
        title: "Success",
        description: "Activity updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const deleteActivity = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', projectId] });
      toast({
        title: "Success",
        description: "Activity deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const processActivityCommand = useMutation({
    mutationFn: async ({ command, userId, companyId }: { 
      command: string; 
      userId: string; 
      companyId: string; 
    }) => {
      const { data, error } = await supabase.functions.invoke('ai-activity-processor', {
        body: {
          command,
          userId,
          companyId,
          projectId
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['activities', projectId] });
      toast({
        title: "AI Command Processed",
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Command Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    activities: activities || [],
    isLoading,
    error,
    createActivity,
    updateActivity,
    deleteActivity,
    processActivityCommand
  };
}