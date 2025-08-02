import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCompany } from '@/contexts/CompanyContext';

export interface TimeEntry {
  id: string;
  user_id: string;
  company_id: string | null;
  start_time: string;
  end_time: string | null;
  duration: number | null; // in seconds
  task_activity: string;
  category: string | null;
  project_id?: string | null;
  project_name: string | null;
  notes: string | null;
  is_active: boolean;
  status: string; // 'running', 'paused', 'completed'
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
  'Design': '217 91% 60%',     // hsl(217, 91%, 60%) - Blue
  'Admin': '159 61% 51%',      // hsl(159, 61%, 51%) - Green  
  'Calls': '43 96% 56%',       // hsl(43, 96%, 56%) - Amber
  'Break': '0 84% 60%',        // hsl(0, 84%, 60%) - Red
  'Browsing': '263 69% 69%',   // hsl(263, 69%, 69%) - Purple
  'Site Visit': '188 94% 43%', // hsl(188, 94%, 43%) - Cyan
  'Deep Work': '160 84% 39%',  // hsl(160, 84%, 39%) - Emerald
  'Other': '217 33% 47%'       // hsl(217, 33%, 47%) - Gray
};

export const useTimeTracking = () => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [settings, setSettings] = useState<TimeTrackingSettings | null>(null);
  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentCompany } = useCompany();

  const loadTimeEntries = async (date?: string, endDate?: string) => {
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
        
        if (endDate) {
          // Date range query for better performance
          const endOfRange = new Date(endDate);
          endOfRange.setHours(23, 59, 59, 999);
          
          query = query
            .gte('start_time', startOfDay.toISOString())
            .lte('start_time', endOfRange.toISOString());
        } else {
          // Single day query  
          const endOfDay = new Date(date);
          endOfDay.setHours(23, 59, 59, 999);
          
          query = query
            .gte('start_time', startOfDay.toISOString())
            .lte('start_time', endOfDay.toISOString());
        }
      }

      const { data, error } = await query;
      
      if (error) throw error;
      // Map database fields to match our interface
      const mappedData: TimeEntry[] = data?.map((entry: any): TimeEntry => ({
        id: entry.id,
        user_id: entry.user_id,
        company_id: entry.company_id,
        start_time: entry.start_time,
        end_time: entry.end_time,
        duration: entry.duration,
        task_activity: entry.task_activity,
        category: entry.category,
        project_id: entry.project_id,
        project_name: entry.project_name,
        notes: entry.notes,
        is_active: entry.is_active || false,
        status: entry.status || (entry.is_active ? 'running' : 'completed'),
        created_at: entry.created_at,
        updated_at: entry.updated_at
      })) || [];
      setTimeEntries(mappedData);
    } catch (error) {
      console.error('Error loading time entries:', error);
      toast({
        title: "Error",
        description: "Failed to load time entries",
        variant: "destructive",
      });
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

  const loadCategories = async () => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user || !currentCompany?.id) return;

      const { data, error } = await supabase
        .from('time_categories')
        .select('name')
        .eq('user_id', user.data.user.id)
        .eq('company_id', currentCompany.id)
        .order('name');

      if (error) throw error;

      const categoryNames = data?.map(cat => cat.name) || [];
      setCategories([...new Set([...DEFAULT_CATEGORIES, ...categoryNames])]);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const addCategory = async (categoryName: string) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user || !currentCompany?.id) return;

      // Check if category already exists
      if (categories.includes(categoryName)) {
        return;
      }

      // Generate a random color for the new category
      const colors = Object.values(DEFAULT_CATEGORY_COLORS);
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const { error } = await supabase
        .from('time_categories')
        .insert({
          user_id: user.data.user.id,
          company_id: currentCompany.id,
          name: categoryName,
          color: randomColor,
          is_default: false
        });

      if (error && error.code !== '23505') { // Ignore unique constraint violations
        throw error;
      }

      // Update local categories
      setCategories(prev => [...prev, categoryName]);
      
      // Update category colors in settings
      if (settings) {
        const updatedColors = {
          ...settings.category_colors,
          [categoryName]: randomColor
        };
        await updateSettings({ category_colors: updatedColors });
      }

      toast({
        title: "Category Added",
        description: `"${categoryName}" category has been added`,
      });
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      });
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
        .eq('status', 'running')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        // Map database fields to match our interface
        const mappedData: TimeEntry = {
          id: data.id,
          user_id: data.user_id,
          company_id: data.company_id,
          start_time: data.start_time,
          end_time: data.end_time,
          duration: data.duration,
          task_activity: data.task_activity,
          category: data.category,
          project_id: data.project_id,
          project_name: data.project_name,
          notes: data.notes,
          is_active: data.is_active || false,
          status: data.status || (data.is_active ? 'running' : 'completed'),
          created_at: data.created_at,
          updated_at: data.updated_at
        };
        setActiveTimer(mappedData);
      }
    } catch (error) {
      console.error('Error checking active timer:', error);
    }
  };

  const startTimer = async (taskActivity: string, category: string = 'Other', projectName?: string) => {
    if (!currentCompany?.id) {
      toast({
        title: "Error",
        description: "No company selected. Please select a company first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      // Stop any existing active timer
      if (activeTimer) {
        await stopTimer();
      }

      const newEntry = {
        company_id: currentCompany?.id || null,
        user_id: user.data.user.id,
        start_time: new Date().toISOString(),
        task_activity: taskActivity,
        category: category || null,
        project_name: projectName || null,
        status: 'running'
      };

      const { data, error } = await supabase
        .from('time_entries')
        .insert(newEntry)
        .select()
        .single();

      if (error) throw error;
      
      // Map database fields to match our interface
      const mappedData: TimeEntry = {
        id: data.id,
        user_id: data.user_id,
        company_id: data.company_id,
        start_time: data.start_time,
        end_time: data.end_time,
        duration: data.duration,
        task_activity: data.task_activity,
        category: data.category,
        project_id: data.project_id,
        project_name: data.project_name,
        notes: data.notes,
        is_active: data.is_active || false,
        status: data.status || (data.is_active ? 'running' : 'completed'),
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      setActiveTimer(mappedData);
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
      const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000); // seconds

      const { error } = await supabase
        .from('time_entries')
        .update({
          end_time: endTime.toISOString(),
          duration: duration,
          status: 'completed'
        })
        .eq('id', activeTimer.id);

      if (error) throw error;

      setActiveTimer(null);
      toast({
        title: "Timer Stopped",
        description: `Tracked ${Math.floor(duration / 60)} minutes`,
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
    if (!currentCompany?.id) {
      toast({
        title: "Error",
        description: "No company selected. Please select a company first.",
        variant: "destructive",
      });
      return;
    }

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
        company_id: currentCompany.id,
        user_id: user.data.user.id,
        duration,
        status: 'completed'
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

  // Load initial data
  useEffect(() => {
    const initializeTimeTracking = async () => {
      setLoading(true);
      try {
        await Promise.all([
          loadTimeEntries(),
          loadSettings(),
          loadCategories(),
          checkActiveTimer()
        ]);
      } catch (error) {
        console.error('Error initializing time tracking:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeTimeTracking();
  }, []);

  return {
    timeEntries,
    settings,
    activeTimer,
    categories,
    loading,
    loadTimeEntries,
    loadCategories,
    addCategory,
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