import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TaskComment {
  id: string;
  task_id: string;
  user_name: string;
  user_avatar?: string;
  comment: string;
  created_at: string;
}

export const useTaskComments = (taskId: string) => {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loading, setLoading] = useState(false);

  const loadComments = async () => {
    if (!taskId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('task_comments')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (commentData: Omit<TaskComment, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('task_comments')
        .insert([commentData])
        .select()
        .single();

      if (error) throw error;
      
      setComments(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };

  useEffect(() => {
    // Clear previous comments when taskId changes
    setComments([]);
    setLoading(false);
    
    if (taskId) {
      loadComments();
    }
  }, [taskId]);

  return {
    comments,
    loading,
    addComment,
    loadComments
  };
};