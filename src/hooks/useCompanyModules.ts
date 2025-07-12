import { useState, useEffect } from 'react';
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
  { key: 'projects', name: 'Projects', description: 'Project management and tracking' },
  { key: 'tasks', name: 'Tasks', description: 'Task management and assignment' },
  { key: 'time_tracking', name: 'Time Tracking', description: 'Track time spent on activities' },
  { key: 'leads', name: 'Leads', description: 'Lead management and CRM' },
  { key: 'estimates', name: 'Estimates', description: 'Create and manage estimates' },
  { key: 'digital_objects', name: 'Digital Objects', description: 'Digital asset management' },
  { key: 'reports', name: 'Reports', description: 'Analytics and reporting' },
  { key: 'integrations', name: 'Integrations', description: 'Third-party integrations' }
];

export const useCompanyModules = () => {
  const [modules, setModules] = useState<CompanyModule[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchCompanyModules = async (companyId: string) => {
    if (!companyId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('company_modules')
        .select('*')
        .eq('company_id', companyId);

      if (error) throw error;

      setModules(data || []);
    } catch (error) {
      console.error('Error fetching company modules:', error);
      toast({
        title: 'Error',
        description: 'Failed to load company modules',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateModuleStatus = async (companyId: string, moduleName: string, enabled: boolean) => {
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

      if (error) throw error;

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
  };

  const getEnabledModules = (companyId: string) => {
    return modules
      .filter(m => m.company_id === companyId && m.enabled)
      .map(m => m.module_name);
  };

  const isModuleEnabled = (companyId: string, moduleName: string) => {
    const module = modules.find(m => m.company_id === companyId && m.module_name === moduleName);
    return module?.enabled || false;
  };

  return {
    modules,
    loading,
    fetchCompanyModules,
    updateModuleStatus,
    getEnabledModules,
    isModuleEnabled
  };
};