import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface IfcComment {
  id: string;
  project_id: string;
  company_id: string;
  ifc_model_id?: string;
  object_id?: string;
  position?: { x: number; y: number; z: number };
  comment: string;
  user_name: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export const useIfcComments = (projectId: string, modelId?: string) => {
  const [comments, setComments] = useState<IfcComment[]>([]);
  const [loading, setLoading] = useState(false);

  const loadComments = async () => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('ifc_comments')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      // Filter by model if provided
      if (modelId) {
        query = query.eq('ifc_model_id', modelId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setComments((data || []) as IfcComment[]);
    } catch (error) {
      console.error('Error loading IFC comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (commentData: {
    project_id: string;
    company_id: string;
    ifc_model_id?: string;
    object_id?: string;
    position?: { x: number; y: number; z: number };
    comment: string;
    user_name: string;
  }) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('ifc_comments')
        .insert([{
          ...commentData,
          user_id: userData.user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      setComments(prev => [...prev, data as IfcComment]);
      return data as IfcComment;
    } catch (error) {
      console.error('Error adding IFC comment:', error);
      throw error;
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('ifc_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Error deleting IFC comment:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (projectId) {
      loadComments();
    }
  }, [projectId, modelId]);

  return {
    comments,
    loading,
    addComment,
    deleteComment,
    loadComments
  };
};
