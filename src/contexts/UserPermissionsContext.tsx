import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserPermission {
  id: string;
  user_id: string;
  company_id: string;
  module_id: string;
  sub_module_id: string | null;
  access_level: 'no_access' | 'can_view' | 'can_edit';
}

interface UserPermissionsContextType {
  permissions: UserPermission[];
  loading: boolean;
  error: string | null;
  hasModuleAccess: (moduleId: string) => boolean;
  hasSubModuleAccess: (moduleId: string, subModuleId: string) => 'no_access' | 'can_view' | 'can_edit';
  canEditSubModule: (moduleId: string, subModuleId: string) => boolean;
  canViewSubModule: (moduleId: string, subModuleId: string) => boolean;
  refetch: () => Promise<void>;
}

export const UserPermissionsContext = createContext<UserPermissionsContextType | undefined>(undefined);

interface UserPermissionsProviderProps {
  children: React.ReactNode;
  companyId: string;
  userId?: string;
}

export const UserPermissionsProvider: React.FC<UserPermissionsProviderProps> = ({
  children,
  companyId,
  userId
}) => {
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCurrentUserId = async () => {
    if (userId) return userId;
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id;
  };

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const currentUserId = await getCurrentUserId();
      
      if (!currentUserId) {
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await (supabase as any)
        .from('user_module_permissions')
        .select('*')
        .eq('user_id', currentUserId)
        .eq('company_id', companyId);

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching permissions:', fetchError);
        setError(fetchError.message);
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

  useEffect(() => {
    if (companyId) {
      fetchPermissions();
    } else {
      setLoading(false);
    }
  }, [companyId, userId]);

  const hasModuleAccess = (moduleId: string): boolean => {
    const modulePermissions = permissions.filter(p => p.module_id === moduleId);
    
    if (modulePermissions.length === 0) {
      return true;
    }

    return modulePermissions.some(p => p.access_level !== 'no_access');
  };

  const hasSubModuleAccess = (moduleId: string, subModuleId: string): 'no_access' | 'can_view' | 'can_edit' => {
    const permission = permissions.find(
      p => p.module_id === moduleId && p.sub_module_id === subModuleId
    );

    return permission?.access_level || 'can_view';
  };

  const canEditSubModule = (moduleId: string, subModuleId: string): boolean => {
    return hasSubModuleAccess(moduleId, subModuleId) === 'can_edit';
  };

  const canViewSubModule = (moduleId: string, subModuleId: string): boolean => {
    const accessLevel = hasSubModuleAccess(moduleId, subModuleId);
    return accessLevel === 'can_view' || accessLevel === 'can_edit';
  };

  const value: UserPermissionsContextType = {
    permissions,
    loading,
    error,
    hasModuleAccess,
    hasSubModuleAccess,
    canEditSubModule,
    canViewSubModule,
    refetch: fetchPermissions
  };

  return (
    <UserPermissionsContext.Provider value={value}>
      {children}
    </UserPermissionsContext.Provider>
  );
};

export const useUserPermissionsContext = () => {
  const context = useContext(UserPermissionsContext);
  
  // If context is undefined (no provider), return a safe default that grants all access
  // This allows components to work gracefully when permissions aren't loaded yet
  if (context === undefined) {
    console.warn('useUserPermissionsContext used outside UserPermissionsProvider - returning default permissions');
    return {
      permissions: [],
      loading: false,
      error: null,
      hasModuleAccess: () => true, // Grant access by default when no provider
      hasSubModuleAccess: () => 'can_edit' as const, // Grant full access by default
      canEditSubModule: () => true,
      canViewSubModule: () => true,
      refetch: async () => {}
    };
  }
  
  return context;
};