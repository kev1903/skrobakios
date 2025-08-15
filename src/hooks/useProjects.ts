import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';

export interface Project {
  id: string;
  company_id: string;
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

// Global cache and fallback data
const CACHE_KEY = 'projects_cache';
const CACHE_DURATION = 30000; // 30 seconds


// Global cache object
let globalCache: {
  data: Project[] | null;
  timestamp: number;
  isValid: () => boolean;
} = {
  data: null,
  timestamp: 0,
  isValid: () => Date.now() - globalCache.timestamp < CACHE_DURATION
};

// Load initial cache from localStorage
const loadFromLocalStorage = (): Project[] => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION * 2) { // Allow stale data for instant loading
        return data;
      }
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error);
  }
  return [];
};

// Save to localStorage
const saveToLocalStorage = (data: Project[]) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const useProjects = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentCompany } = useCompany();
  const abortControllerRef = useRef<AbortController | null>(null);

  const createProject = async (projectData: CreateProjectData): Promise<Project | null> => {
    if (!currentCompany?.id) {
      setError('No company selected. Please select a company first.');
      return null;
    }

    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          company_id: currentCompany.id,
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
      
      // Invalidate cache
      globalCache.data = null;
      globalCache.timestamp = 0;
      
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

  const getProjects = useCallback(async (): Promise<Project[]> => {
    // Always fetch fresh data to ensure consistency
    setLoading(true);
    setError(null);
    
    try {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      console.log("Fetching projects from database...");
      console.log("Current company:", currentCompany);
      
      // Fetch projects with proper company filtering using RLS-compatible query
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          company_members!inner(
            user_id,
            status,
            company_id
          )
        `)
        .eq('company_members.user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('company_members.status', 'active')
        .order('created_at', { ascending: false })
        .abortSignal(abortControllerRef.current.signal);

      if (error) throw error;
      
      // Clean up the nested company_members data from response
      const freshData = (data || []).map(project => {
        const { company_members, ...cleanProject } = project;
        return cleanProject;
      }) as Project[];
      
      console.log("Fetched projects:", freshData);
      console.log("Number of projects found:", freshData.length);
      
      // Update cache
      globalCache.data = freshData;
      globalCache.timestamp = Date.now();
      
      // Save to localStorage
      saveToLocalStorage(freshData);
      
      return freshData;
    } catch (err) {
      if (err.name !== 'AbortError') {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projects';
        setError(errorMessage);
        console.error('Error fetching projects:', err);
        
        // Try to return cached data as fallback
        const cachedData = loadFromLocalStorage();
        return cachedData;
      }
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getProject = useCallback(async (projectId: string): Promise<Project | null> => {
    // First try to get from cache
    if (globalCache.data) {
      const cached = globalCache.data.find(p => p.id === projectId);
      if (cached) return cached;
    }

    // Try localStorage cache
    const cachedProjects = loadFromLocalStorage();
    const cachedProject = cachedProjects.find(p => p.id === projectId);
    if (cachedProject) return cachedProject;

    // Fallback to database query
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
      
      // Return null when project not found
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProject = async (projectId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      
      // Update cache by removing deleted project
      if (globalCache.data) {
        globalCache.data = globalCache.data.filter(p => p.id !== projectId);
        saveToLocalStorage(globalCache.data);
      }
      
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

  const updateProject = async (projectId: string, updates: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>): Promise<Project | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw error;
      
      // Update cache
      if (globalCache.data) {
        const updatedProjects = globalCache.data.map(p => 
          p.id === projectId ? { ...p, ...data } : p
        );
        globalCache.data = updatedProjects;
        globalCache.timestamp = Date.now();
        saveToLocalStorage(updatedProjects);
      } else {
        // If no cache exists, invalidate it to force refresh
        globalCache.data = null;
        globalCache.timestamp = 0;
      }
      
      console.log('Project updated successfully:', projectId);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update project';
      setError(errorMessage);
      console.error('Error updating project:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createProject,
    getProjects,
    getProject,
    updateProject,
    deleteProject,
    loading,
    error,
  };
};