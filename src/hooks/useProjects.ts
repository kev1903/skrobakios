import { useState, useCallback, useRef } from 'react';
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

// Global cache and fallback data
const CACHE_KEY = 'projects_cache';
const CACHE_DURATION = 30000; // 30 seconds

const fallbackProjects: Project[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    project_id: "SK23003",
    name: "Gordon Street, Balwyn",
    location: "Balwyn, VIC",
    created_at: "2024-06-15T00:00:00Z",
    status: "completed",
    contract_price: "$2,450,000",
    start_date: "2024-06-15",
    deadline: "2024-08-30",
    updated_at: "2024-06-15T00:00:00Z",
    priority: "Medium"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440001", 
    project_id: "SK23004",
    name: "Collins Street, Melbourne",
    location: "Melbourne, VIC",
    created_at: "2024-07-01T00:00:00Z",
    status: "running",
    contract_price: "$3,200,000",
    start_date: "2024-07-01",
    deadline: "2024-09-15",
    updated_at: "2024-07-01T00:00:00Z",
    priority: "High"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    project_id: "SK23005", 
    name: "Richmond Terrace",
    location: "Richmond, VIC",
    created_at: "2024-06-01T00:00:00Z",
    status: "pending",
    contract_price: "$1,800,000",
    start_date: "2024-08-01",
    deadline: "2024-10-30",
    updated_at: "2024-06-01T00:00:00Z",
    priority: "Low"
  }
];

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
  return fallbackProjects;
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
  const abortControllerRef = useRef<AbortController | null>(null);

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
    // Instant return with cached data
    if (globalCache.isValid() && globalCache.data) {
      return globalCache.data;
    }

    // Return localStorage data immediately for instant loading
    const cachedData = loadFromLocalStorage();
    
    // Update cache with localStorage data
    globalCache.data = cachedData;
    globalCache.timestamp = Date.now();

    // Fetch fresh data in background (non-blocking)
    setTimeout(async () => {
      try {
        // Cancel previous request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        
        abortControllerRef.current = new AbortController();
        
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false })
          .abortSignal(abortControllerRef.current.signal);

        if (error) throw error;
        
        const freshData = data || fallbackProjects;
        
        // Update cache
        globalCache.data = freshData;
        globalCache.timestamp = Date.now();
        
        // Save to localStorage for next time
        saveToLocalStorage(freshData);
        
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Background fetch error:', err);
        }
      }
    }, 0);

    return cachedData;
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
      
      // Return fallback project
      return fallbackProjects[0];
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

  return {
    createProject,
    getProjects,
    getProject,
    deleteProject,
    loading,
    error,
  };
};