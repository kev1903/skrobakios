import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CompanyModule } from '@/types/companyModules';
import { clearCache } from '@/utils/moduleCache';
import { 
  fetchCompanyModulesInternal, 
  fetchMultipleCompanyModulesInternal, 
  updateModuleStatusInternal 
} from '@/services/companyModulesService';

export const useCompanyModules = () => {
  const [modules, setModules] = useState<CompanyModule[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const retryTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

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
    
    setLoading(true);

    try {
      const allModules = await fetchMultipleCompanyModulesInternal(companyIds);
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
      const data = await updateModuleStatusInternal(companyId, moduleName, enabled);

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
      
      // Provide more specific error messages based on the error type
      let errorMessage = 'Failed to update module status';
      if ((error as any)?.code === '42501') {
        errorMessage = 'You do not have permission to modify company modules. Please check with your administrator.';
      } else if ((error as any)?.message?.includes('new row violates row-level security policy')) {
        errorMessage = 'Access denied. Please ensure you have the proper permissions to manage company modules.';
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
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

// Re-export types and constants for backward compatibility
export type { CompanyModule } from '@/types/companyModules';
export { AVAILABLE_MODULES } from '@/types/companyModules';