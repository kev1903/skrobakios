import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CompanyModule {
  id: string;
  company_id: string;
  module_name: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Define available modules
export const AVAILABLE_MODULES = [
  // Company Modules
  { key: 'projects', name: 'Projects', description: 'Project management and tracking' },
  { key: 'finance', name: 'Finance', description: 'Financial management and accounting' },
  { key: 'sales', name: 'Sales', description: 'Sales management and CRM' },
  
  // Project Modules
  { key: 'dashboard', name: 'Dashboard', description: 'Project overview and metrics' },
  { key: 'digital-twin', name: 'Digital Twin', description: '3D models and digital representations' },
  { key: 'cost-contracts', name: 'Cost & Contracts', description: 'Cost tracking and contract management' },
  { key: 'schedule', name: 'Schedule', description: 'Project scheduling and timeline management' },
  { key: 'tasks', name: 'Tasks', description: 'Task management and assignment' },
  { key: 'files', name: 'Files', description: 'Document and file management' },
  { key: 'team', name: 'Team', description: 'Team member management and collaboration' },
  { key: 'digital-objects', name: 'Digital Objects', description: 'Digital asset management' }
];

// Global cache for company modules
const moduleCache = new Map<string, { data: CompanyModule[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const activeRequests = new Map<string, Promise<CompanyModule[]>>();

export const useCompanyModules = () => {
  const [modules, setModules] = useState<CompanyModule[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const retryTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Check if cached data is still valid
  const isCacheValid = (companyId: string): boolean => {
    const cached = moduleCache.get(companyId);
    if (!cached) return false;
    return Date.now() - cached.timestamp < CACHE_DURATION;
  };

  // Get cached data
  const getCachedData = (companyId: string): CompanyModule[] | null => {
    if (!isCacheValid(companyId)) return null;
    return moduleCache.get(companyId)?.data || null;
  };

  // Set cache data
  const setCacheData = (companyId: string, data: CompanyModule[]) => {
    moduleCache.set(companyId, { data, timestamp: Date.now() });
  };

  const fetchCompanyModulesInternal = async (companyId: string, retryCount = 0): Promise<CompanyModule[]> => {
    // Check cache first
    const cachedData = getCachedData(companyId);
    if (cachedData) {
      console.log('Using cached modules data for company:', companyId);
      return cachedData;
    }

    // Check if there's already an active request for this company
    if (activeRequests.has(companyId)) {
      console.log('Reusing existing request for company:', companyId);
      return activeRequests.get(companyId)!;
    }

    console.log('Fetching modules data for company:', companyId);

    const requestPromise = (async () => {
      try {
        // Check if user is authenticated first
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User not authenticated');
        }

        const { data, error } = await supabase
          .from('company_modules')
          .select('*')
          .eq('company_id', companyId);

        if (error) {
          console.error('Error fetching modules:', error);
          throw error;
        }

        const moduleData = data || [];
        console.log('Successfully fetched modules data for company:', companyId, moduleData);
        
        // Cache the successful response
        setCacheData(companyId, moduleData);
        
        return moduleData;
      } catch (error) {
        console.error('Error fetching company modules:', error);
        
        // Implement retry logic for network errors
        if ((error as any)?.message?.includes('Failed to fetch') && retryCount < 2) {
          console.log(`Retrying fetch for company ${companyId}, attempt ${retryCount + 1}`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
          return fetchCompanyModulesInternal(companyId, retryCount + 1);
        }
        
        throw error;
      } finally {
        // Remove from active requests
        activeRequests.delete(companyId);
      }
    })();

    // Store the active request
    activeRequests.set(companyId, requestPromise);
    
    return requestPromise;
  };

  const fetchCompanyModules = useCallback(async (companyId: string) => {
    if (!companyId) return;
    
    // Set loading state for this specific company
    setLoadingCompanies(prev => new Set(prev).add(companyId));
    setLoading(true);

    try {
      const moduleData = await fetchCompanyModulesInternal(companyId);
      
      // Update state with the fetched data
      setModules(prev => {
        // Remove old modules for this company and add new ones
        const filteredModules = prev.filter(m => m.company_id !== companyId);
        return [...filteredModules, ...moduleData];
      });
      
    } catch (error) {
      console.error('Error in fetchCompanyModules:', error);
      toast({
        title: 'Error',
        description: 'Failed to load company modules',
        variant: 'destructive'
      });
    } finally {
      setLoadingCompanies(prev => {
        const newSet = new Set(prev);
        newSet.delete(companyId);
        return newSet;
      });
      
      // Only set loading to false if no companies are being loaded
      setLoading(prev => prev && loadingCompanies.size > 1);
    }
  }, [toast, loadingCompanies.size]);

  // Fetch modules for multiple companies efficiently
  const fetchMultipleCompanyModules = useCallback(async (companyIds: string[]) => {
    if (companyIds.length === 0) return;
    
    console.log('Fetching modules for multiple companies:', companyIds);
    setLoading(true);

    try {
      // Filter out companies that have valid cached data
      const uncachedCompanyIds = companyIds.filter(id => !isCacheValid(id));
      
      if (uncachedCompanyIds.length === 0) {
        console.log('All companies have valid cached data');
        // Use cached data for all companies
        const allCachedData = companyIds.flatMap(id => getCachedData(id) || []);
        setModules(allCachedData);
        return;
      }

      // Fetch data for uncached companies in parallel
      const fetchPromises = uncachedCompanyIds.map(id => fetchCompanyModulesInternal(id));
      const results = await Promise.allSettled(fetchPromises);
      
      // Combine cached and newly fetched data
      const allModules: CompanyModule[] = [];
      
      // Add cached data
      companyIds.forEach(id => {
        if (isCacheValid(id)) {
          const cached = getCachedData(id);
          if (cached) allModules.push(...cached);
        }
      });
      
      // Add newly fetched data
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allModules.push(...result.value);
        } else {
          console.error(`Failed to fetch modules for company ${uncachedCompanyIds[index]}:`, result.reason);
        }
      });
      
      setModules(allModules);
      
    } catch (error) {
      console.error('Error fetching multiple company modules:', error);
      toast({
        title: 'Error',
        description: 'Failed to load some company modules',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateModuleStatus = useCallback(async (companyId: string, moduleName: string, enabled: boolean) => {
    try {
      const { data, error } = await supabase
        .from('company_modules')
        .upsert({
          company_id: companyId,
          module_name: moduleName,
          enabled: enabled
        }, {
          onConflict: 'company_id,module_name'
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      // Update cache
      const cached = moduleCache.get(companyId);
      if (cached) {
        const updatedData = cached.data.map(m => 
          m.module_name === moduleName ? { ...m, enabled } : m
        );
        if (!cached.data.find(m => m.module_name === moduleName)) {
          updatedData.push(data);
        }
        setCacheData(companyId, updatedData);
      }

      // Update local state
      setModules(prev => {
        const existing = prev.find(m => m.company_id === companyId && m.module_name === moduleName);
        if (existing) {
          return prev.map(m => 
            m.company_id === companyId && m.module_name === moduleName 
              ? { ...m, enabled } 
              : m
          );
        } else {
          return [...prev, data];
        }
      });

      return data;
    } catch (error) {
      console.error('Error updating module status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update module status',
        variant: 'destructive'
      });
      throw error;
    }
  }, [toast]);

  const getEnabledModules = useCallback((companyId: string) => {
    return modules
      .filter(m => m.company_id === companyId && m.enabled)
      .map(m => m.module_name);
  }, [modules]);

  const isModuleEnabled = useCallback((companyId: string, moduleName: string) => {
    const module = modules.find(m => m.company_id === companyId && m.module_name === moduleName);
    return module?.enabled || false;
  }, [modules]);

  // Clear cache for a specific company
  const clearCache = useCallback((companyId?: string) => {
    if (companyId) {
      moduleCache.delete(companyId);
    } else {
      moduleCache.clear();
    }
  }, []);

  // Cleanup function
  useEffect(() => {
    return () => {
      // Clear any pending retry timeouts
      retryTimeouts.current.forEach(timeout => clearTimeout(timeout));
      retryTimeouts.current.clear();
    };
  }, []);

  return {
    modules,
    loading,
    loadingCompanies,
    fetchCompanyModules,
    fetchMultipleCompanyModules,
    updateModuleStatus,
    getEnabledModules,
    isModuleEnabled,
    clearCache
  };
};