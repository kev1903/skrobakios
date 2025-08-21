import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface UserPermissionCheck {
  hasPermission: (permissionKey: string) => boolean;
  loading: boolean;
  permissions: string[];
  refetch: () => Promise<void>;
}

export const useUserPermissions = (companyId?: string): UserPermissionCheck => {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserPermissions = async () => {
    try {
      if (!companyId) {
        setPermissions([]);
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setPermissions([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc('get_user_permissions_for_company', {
        target_user_id: user.id,
        target_company_id: companyId
      });

      if (error) {
        console.error('Error fetching user permissions:', error);
        setPermissions([]);
        return;
      }

      // Extract granted permissions
      const grantedPermissions = data
        ?.filter((perm: any) => perm.granted && perm.is_available)
        .map((perm: any) => perm.permission_key) || [];

      setPermissions(grantedPermissions);
    } catch (error) {
      console.error('Error in fetchUserPermissions:', error);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPermissions();
  }, [companyId]);

  const hasPermission = (permissionKey: string): boolean => {
    return permissions.includes(permissionKey);
  };

  return {
    hasPermission,
    loading,
    permissions,
    refetch: fetchUserPermissions
  };
};

/**
 * Permission keys for easy reference throughout the application
 */
export const PERMISSIONS = {
  // Platform Permissions
  MANAGE_PLATFORM_USERS: 'manage_platform_users',
  MANAGE_PLATFORM_ROLES: 'manage_platform_roles',
  VIEW_PLATFORM_ANALYTICS: 'view_platform_analytics',
  MANAGE_SYSTEM_SETTINGS: 'manage_system_settings',
  VIEW_ALL_COMPANIES: 'view_all_companies',

  // Company Permissions
  MANAGE_COMPANY_USERS: 'manage_company_users',
  MANAGE_COMPANY_SETTINGS: 'manage_company_settings',
  VIEW_COMPANY_ANALYTICS: 'view_company_analytics',
  MANAGE_COMPANY_PROJECTS: 'manage_company_projects',

  // Project Permissions
  VIEW_PROJECTS: 'view_projects',
  MANAGE_PROJECTS: 'manage_projects',
  MANAGE_TASKS: 'manage_tasks',
  VIEW_PROJECT_FINANCIALS: 'view_project_financials',
  MANAGE_PROJECT_FILES: 'manage_project_files',

  // General Permissions
  VIEW_DASHBOARD: 'view_dashboard',
  EXPORT_DATA: 'export_data',
  VIEW_REPORTS: 'view_reports'
} as const;

/**
 * Helper function to check if current user has a specific permission
 * This is useful for one-time checks without using the hook
 */
export const checkUserPermission = async (
  permissionKey: string,
  companyId: string
): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const hasPermission = await supabase.rpc('user_has_permission', {
      target_user_id: user.id,
      target_company_id: companyId,
      permission_key_param: permissionKey
    });

    return hasPermission.data || false;
  } catch (error) {
    console.error('Error checking user permission:', error);
    return false;
  }
};