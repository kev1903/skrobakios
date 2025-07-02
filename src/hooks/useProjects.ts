
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Project {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  contract_price?: string;
  start_date?: string;
  deadline?: string;
  status: string;
  priority?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectData {
  project_id: string;
  name: string;
  description?: string;
  contract_price?: string;
  start_date?: Date;
  deadline?: Date;
  status?: string;
  priority?: string;
  location?: string;
}

export const useProjects = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProject = async (projectData: CreateProjectData): Promise<Project | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          project_id: projectData.project_id,
          name: projectData.name,
          description: projectData.description,
          contract_price: projectData.contract_price,
          start_date: projectData.start_date?.toISOString().split('T')[0],
          deadline: projectData.deadline?.toISOString().split('T')[0],
          status: projectData.status || 'pending',
          priority: projectData.priority,
          location: projectData.location,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create project';
      setError(errorMessage);
      console.error('Error creating project:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getProjects = async (): Promise<Project[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projects';
      setError(errorMessage);
      console.error('Error fetching projects:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getProject = async (projectId: string): Promise<Project | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch project';
      setError(errorMessage);
      console.error('Error fetching project:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (projectId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      console.log('Project deleted successfully:', projectId);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete project';
      setError(errorMessage);
      console.error('Error deleting project:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createProject,
    getProjects,
    getProject,
    deleteProject,
    loading,
    error,
  };
};
