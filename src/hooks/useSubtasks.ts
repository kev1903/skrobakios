import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Subtask {
  id: string;
  parent_task_id: string;
  title: string;
  description?: string;
  assigned_to_name?: string;
  assigned_to_avatar?: string;
  due_date?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export const useSubtasks = (taskId: string) => {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSubtasks = async () => {
    if (!taskId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subtasks')
        .select('*')
        .eq('parent_task_id', taskId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setSubtasks(data || []);
    } catch (error) {
      console.error('Error loading subtasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSubtask = async (subtaskData: Omit<Subtask, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('subtasks')
        .insert([subtaskData])
        .select()
        .single();

      if (error) throw error;
      
      setSubtasks(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error adding subtask:', error);
      throw error;
    }
  };

  const updateSubtask = async (subtaskId: string, updates: Partial<Subtask>) => {
    try {
      const { data, error } = await supabase
        .from('subtasks')
        .update(updates)
        .eq('id', subtaskId)
        .select()
        .single();

      if (error) throw error;

      setSubtasks(prev => prev.map(subtask => 
        subtask.id === subtaskId ? data : subtask
      ));
      return data;
    } catch (error) {
      console.error('Error updating subtask:', error);
      throw error;
    }
  };

  const deleteSubtask = async (subtaskId: string) => {
    try {
      const { error } = await supabase
        .from('subtasks')
        .delete()
        .eq('id', subtaskId);

      if (error) throw error;

      setSubtasks(prev => prev.filter(subtask => subtask.id !== subtaskId));
    } catch (error) {
      console.error('Error deleting subtask:', error);
      throw error;
    }
  };

  useEffect(() => {
    // Clear previous subtasks when taskId changes
    setSubtasks([]);
    setLoading(false);
    
    if (taskId) {
      loadSubtasks();
    }
  }, [taskId]);

  return {
    subtasks,
    loading,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    loadSubtasks
  };
};