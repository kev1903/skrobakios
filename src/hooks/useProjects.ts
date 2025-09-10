import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';
import { convertDbRowToProject } from '@/utils/projectTypeConverter';

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
  latitude?: number | null;
  longitude?: number | null;
  geocoded_at?: string | null;
  banner_image?: string | null;
  banner_position?: { x: number; y: number; scale: number } | null;
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
      
      return convertDbRowToProject(data);
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
    console.log("🚀 getProjects called");
    console.log("🏢 Current company:", currentCompany?.name, currentCompany?.id);
    
    // Clear cache when company changes to ensure fresh data
    if (currentCompany) {
      globalCache.data = null;
      globalCache.timestamp = 0;
      console.log("🗑️ Cache cleared for company change");
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        console.log("⏹️ Previous request aborted");
      }
      
      abortControllerRef.current = new AbortController();
      
      console.log("🏢 Fetching projects for current company:", currentCompany?.name);
      console.log("🔐 Current company ID:", currentCompany?.id);
      
      // Get current user
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');
      console.log("👤 User authenticated:", user.user.id);

      // Check company membership status
      const { data: membershipData } = await supabase
        .from('company_members')
        .select('*')
        .eq('user_id', user.user.id);
      
      console.log("👥 User memberships:", membershipData);

      // Fetch projects - RLS will handle filtering by company membership
      // The RLS policy `can_view_company_projects` checks if user is active member of company
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
        .abortSignal(abortControllerRef.current.signal);

      if (error) throw error;
      
      const freshData = (data || []).map(convertDbRowToProject);
      
      console.log("📊 Raw projects fetched:", freshData.length);
      console.log("🏢 Projects by company:", freshData.reduce((acc, p) => {
        acc[p.company_id] = (acc[p.company_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>));
      
      // Filter projects for current company if we have one
      const filteredProjects = currentCompany 
        ? freshData.filter(p => p.company_id === currentCompany.id)
        : freshData;
      
      console.log("🎯 Projects for current company:", filteredProjects.length);
      console.log("📝 Filtered projects:", filteredProjects.map(p => ({ id: p.id, name: p.name, company_id: p.company_id })));
      
      // Update cache
      globalCache.data = filteredProjects;
      globalCache.timestamp = Date.now();
      
      // Save to localStorage
      saveToLocalStorage(filteredProjects);
      
      return filteredProjects;
    } catch (err) {
      if (err.name !== 'AbortError') {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projects';
        setError(errorMessage);
        console.error('❌ Error fetching projects:', err);
        
        // Try to return cached data as fallback
        const cachedData = loadFromLocalStorage();
        console.log("💾 Returning cached data:", cachedData.length);
        return cachedData;
      }
      console.log("⏹️ Request was aborted");
      return [];
    } finally {
      setLoading(false);
      console.log("✅ getProjects finished");
    }
  }, [currentCompany]);

  const getProject = useCallback(async (projectId: string): Promise<Project | null> => {
    // Ensure we only ever return a project for the current company
    const companyId = currentCompany?.id;

    // First try to get from cache (scoped by company)
    if (globalCache.data && companyId) {
      const cached = globalCache.data.find(p => p.id === projectId && p.company_id === companyId);
      if (cached) return cached;
    }

    // Try localStorage cache (scoped by company)
    const cachedProjects = loadFromLocalStorage();
    if (companyId) {
      const cachedProject = cachedProjects.find(p => p.id === projectId && p.company_id === companyId);
      if (cachedProject) return cachedProject;
    }

    // Fallback to database query (enforce company scope)
    setLoading(true);
    setError(null);
    
    try {
      if (!companyId) {
        // Without a company context, never return cross-company data
        return null;
      }
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('company_id', companyId)
        .single();

      if (error) throw error;
      return convertDbRowToProject(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch project';
      setError(errorMessage);
      console.error('Error fetching project:', err);
      
      // Return null when project not found or mismatched company
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentCompany]);

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
          p.id === projectId ? convertDbRowToProject({ ...p, ...data }) : p
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
      return convertDbRowToProject(data);
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