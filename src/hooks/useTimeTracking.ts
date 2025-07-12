import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCompany } from '@/contexts/CompanyContext';

export interface TimeEntry {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string | null;
  duration: number | null;
  task_activity: string;
  category: string;
  project_id: string | null;
  project_name: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TimeTrackingSettings {
  id: string;
  user_id: string;
  productive_categories: string[];
  default_work_start: string;
  default_work_end: string;
  category_colors: any; // Using any to handle Json type from Supabase
  created_at: string;
  updated_at: string;
}

export const DEFAULT_CATEGORIES = [
  'Design', 'Admin', 'Calls', 'Break', 'Browsing', 'Site Visit', 'Deep Work', 'Other'
];

export const DEFAULT_CATEGORY_COLORS = {
  'Design': '#3B82F6',
  'Admin': '#10B981', 
  'Calls': '#F59E0B',
  'Break': '#EF4444',
  'Browsing': '#8B5CF6',
  'Site Visit': '#06B6D4',
  'Deep Work': '#059669',
  'Other': '#6B7280'
};

export const useTimeTracking = () => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [settings, setSettings] = useState<TimeTrackingSettings | null>(null);
  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentCompany } = useCompany();

  // Load initial data
  useEffect(() => {
    loadTimeEntries();
    loadSettings();
    checkActiveTimer();
  }, []);

  const loadTimeEntries = async (date?: string) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      let query = supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', user.data.user.id)
        .order('start_time', { ascending: false });

      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        query = query
          .gte('start_time', startOfDay.toISOString())
          .lte('start_time', endOfDay.toISOString());
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setTimeEntries(data || []);
    } catch (error) {
      console.error('Error loading time entries:', error);
      toast({
        title: "Error",
        description: "Failed to load time entries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      const { data, error } = await supabase
        .from('time_tracking_settings')
        .select('*')
        .eq('user_id', user.data.user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        throw error;
      }

      if (data) {
        setSettings({
          ...data,
          category_colors: data.category_colors as Record<string, string>
        });
      } else {
        // Create default settings
        await createDefaultSettings();
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const createDefaultSettings = async () => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      const defaultSettings = {
        user_id: user.data.user.id,
        productive_categories: ['Design', 'Deep Work', 'Admin'],
        default_work_start: '08:00:00',
        default_work_end: '18:00:00',
        category_colors: DEFAULT_CATEGORY_COLORS
      };

      const { data, error } = await supabase
        .from('time_tracking_settings')
        .insert(defaultSettings)
        .select()
        .single();

      if (error) throw error;
      setSettings({
        ...data,
        category_colors: data.category_colors as Record<string, string>
      });
    } catch (error) {
      console.error('Error creating default settings:', error);
    }
  };

  const checkActiveTimer = async () => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', user.data.user.id)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setActiveTimer(data);
      }
    } catch (error) {
      console.error('Error checking active timer:', error);
    }
  };

  const startTimer = async (taskActivity: string, category: string = 'Other', projectName?: string) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      // Stop any existing active timer
      if (activeTimer) {
        await stopTimer();
      }

      const newEntry = {
        user_id: user.data.user.id,
        start_time: new Date().toISOString(),
        task_activity: taskActivity,
        category: category,
        project_name: projectName || null,
        is_active: true,
        company_id: currentCompany?.id || ''
      };

      const { data, error } = await supabase
        .from('time_entries')
        .insert(newEntry)
        .select()
        .single();

      if (error) throw error;
      
      setActiveTimer(data);
      toast({
        title: "Timer Started",
        description: `Started tracking: ${taskActivity}`,
      });
      
      loadTimeEntries();
    } catch (error) {
      console.error('Error starting timer:', error);
      toast({
        title: "Error",
        description: "Failed to start timer",
        variant: "destructive",
      });
    }
  };

  const stopTimer = async () => {
    if (!activeTimer) return;

    try {
      const endTime = new Date();
      const startTime = new Date(activeTimer.start_time);
      const duration = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60)); // minutes

      const { error } = await supabase
        .from('time_entries')
        .update({
          end_time: endTime.toISOString(),
          duration: duration,
          is_active: false
        })
        .eq('id', activeTimer.id);

      if (error) throw error;

      setActiveTimer(null);
      toast({
        title: "Timer Stopped",
        description: `Tracked ${duration} minutes`,
      });
      
      loadTimeEntries();
    } catch (error) {
      console.error('Error stopping timer:', error);
      toast({
        title: "Error",
        description: "Failed to stop timer",
        variant: "destructive",
      });
    }
  };

  const createTimeEntry = async (entry: Partial<TimeEntry>) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      // Calculate duration if start and end times are provided
      let duration = entry.duration;
      if (entry.start_time && entry.end_time && !duration) {
        const start = new Date(entry.start_time);
        const end = new Date(entry.end_time);
        duration = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
      }

      const newEntry = {
        start_time: entry.start_time || new Date().toISOString(),
        task_activity: entry.task_activity || 'Untitled Task',
        ...entry,
        user_id: user.data.user.id,
        duration,
        is_active: false,
        company_id: currentCompany?.id || ''
      };

      const { data, error } = await supabase
        .from('time_entries')
        .insert(newEntry)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Entry Created",
        description: "Time entry added successfully",
      });
      
      loadTimeEntries();
      return data;
    } catch (error) {
      console.error('Error creating time entry:', error);
      toast({
        title: "Error",
        description: "Failed to create time entry",
        variant: "destructive",
      });
    }
  };

  const updateTimeEntry = async (id: string, updates: Partial<TimeEntry>) => {
    try {
      // Calculate duration if start and end times are provided
      let duration = updates.duration;
      if (updates.start_time && updates.end_time && !duration) {
        const start = new Date(updates.start_time);
        const end = new Date(updates.end_time);
        duration = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
      }

      const { error } = await supabase
        .from('time_entries')
        .update({ ...updates, duration })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Entry Updated",
        description: "Time entry updated successfully",
      });

      loadTimeEntries();
    } catch (error) {
      console.error('Error updating time entry:', error);
      toast({
        title: "Error",
        description: "Failed to update time entry",
        variant: "destructive",
      });
    }
  };

  const deleteTimeEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Entry Deleted",
        description: "Time entry deleted successfully",
      });

      loadTimeEntries();
    } catch (error) {
      console.error('Error deleting time entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete time entry",
        variant: "destructive",
      });
    }
  };

  const duplicateTimeEntry = async (entry: TimeEntry) => {
    const duplicate = {
      task_activity: entry.task_activity,
      category: entry.category,
      project_name: entry.project_name,
      notes: entry.notes
    };

    await createTimeEntry(duplicate);
  };

  const updateSettings = async (newSettings: Partial<TimeTrackingSettings>) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      const { data, error } = await supabase
        .from('time_tracking_settings')
        .update(newSettings)
        .eq('user_id', user.data.user.id)
        .select()
        .single();

      if (error) throw error;

      setSettings({
        ...data,
        category_colors: data.category_colors as Record<string, string>
      });
      toast({
        title: "Settings Updated",
        description: "Time tracking settings updated successfully",
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  // Calculate daily stats
  const getDailyStats = (entries: TimeEntry[]) => {
    const totalMinutes = entries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    const productiveMinutes = entries
      .filter(entry => settings?.productive_categories.includes(entry.category))
      .reduce((sum, entry) => sum + (entry.duration || 0), 0);
    
    const deepWorkMinutes = entries
      .filter(entry => entry.category === 'Deep Work')
      .reduce((sum, entry) => sum + (entry.duration || 0), 0);

    const focusScore = totalMinutes > 0 ? Math.round((deepWorkMinutes / totalMinutes) * 100) : 0;

    // Get top 3 tasks/projects by time
    const taskTime = entries.reduce((acc, entry) => {
      const key = entry.project_name || entry.task_activity;
      acc[key] = (acc[key] || 0) + (entry.duration || 0);
      return acc;
    }, {} as Record<string, number>);

    const topTasks = Object.entries(taskTime)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([task, minutes]) => ({ task, minutes }));

    return {
      totalHours: Math.round((totalMinutes / 60) * 10) / 10,
      productiveHours: Math.round((productiveMinutes / 60) * 10) / 10,
      focusScore,
      entryCount: entries.length,
      topTasks
    };
  };

  return {
    timeEntries,
    settings,
    activeTimer,
    loading,
    loadTimeEntries,
    startTimer,
    stopTimer,
    createTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    duplicateTimeEntry,
    updateSettings,
    getDailyStats
  };
};