import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserPermission {
  id: string;
  user_id: string;
  company_id: string;
  module_id: string;
  sub_module_id: string | null;
  access_level: 'no_access' | 'can_view' | 'can_edit';
}

// Legacy permission constants for backward compatibility
export const PERMISSIONS = {
  MANAGE_COMPANY_USERS: 'manage_company_users',
  MANAGE_COMPANY_SETTINGS: 'manage_company_settings', 
  VIEW_COMPANY_ANALYTICS: 'view_company_analytics',
  MANAGE_PROJECTS: 'manage_projects',
  MANAGE_PROJECT_FILES: 'manage_project_files',
  VIEW_REPORTS: 'view_reports',
} as const;

export const useUserPermissions = (companyId?: string, userId?: string) => {
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current user ID if not provided
  const getCurrentUserId = async () => {
    if (userId) return userId;
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id;
  };

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    fetchPermissions();
  }, [companyId, userId]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const currentUserId = await getCurrentUserId();
      
      if (!currentUserId) {
        setLoading(false);
        return;
      }

      // Try to fetch from the new user_permissions table
      const { data, error } = await (supabase as any)
        .from('user_permissions')
        .select('*')
        .eq('user_id', currentUserId)
        .eq('company_id', companyId);

      if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist
        console.error('Error fetching permissions:', error);
        setError(error.message);
        return;
      }

      setPermissions(data || []);
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setError('Failed to fetch permissions');
    } finally {
      setLoading(false);
    }
  };

  // Legacy hasPermission function for backward compatibility
  const hasPermission = (permission: string): boolean => {
    // For now, return true for legacy permissions to maintain functionality
    // This can be enhanced later to map legacy permissions to new module structure
    return true;
  };

  // Check if user has access to a specific module
  const hasModuleAccess = (moduleId: string): boolean => {
    const modulePermissions = permissions.filter(p => p.module_id === moduleId);
    
    // If no permissions are set, default to allowing access (for backward compatibility)
    if (modulePermissions.length === 0) {
      return true;
    }

    // Check if any submodule has access (not no_access)
    return modulePermissions.some(p => p.access_level !== 'no_access');
  };

  // Check if user has access to a specific submodule
  const hasSubModuleAccess = (moduleId: string, subModuleId: string): 'no_access' | 'can_view' | 'can_edit' => {
    const permission = permissions.find(
      p => p.module_id === moduleId && p.sub_module_id === subModuleId
    );

    // If no specific permission is set, default to can_view for backward compatibility
    return permission?.access_level || 'can_view';
  };

  // Check if user can edit a specific submodule
  const canEditSubModule = (moduleId: string, subModuleId: string): boolean => {
    return hasSubModuleAccess(moduleId, subModuleId) === 'can_edit';
  };

  // Check if user can view a specific submodule
  const canViewSubModule = (moduleId: string, subModuleId: string): boolean => {
    const accessLevel = hasSubModuleAccess(moduleId, subModuleId);
    return accessLevel === 'can_view' || accessLevel === 'can_edit';
  };

  // Get visible modules (modules that have at least one accessible submodule)
  const getVisibleModules = (modules: string[]): string[] => {
    return modules.filter(moduleId => hasModuleAccess(moduleId));
  };

  return {
    permissions,
    loading,
    error,
    hasPermission, // Legacy support
    hasModuleAccess,
    hasSubModuleAccess,
    canEditSubModule,
    canViewSubModule,
    getVisibleModules,
    refetch: fetchPermissions
  };
};