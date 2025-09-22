import React from 'react';
import { useUserPermissions } from '@/hooks/useUserPermissions';

interface ModuleWrapperProps {
  children: React.ReactNode;
  moduleId: string;
  subModuleId?: string;
  companyId: string;
  fallback?: React.ReactNode;
  showLoading?: boolean;
  loadingComponent?: React.ReactNode;
  requireEditAccess?: boolean; // If true, only shows if user has edit access
}

/**
 * ModuleWrapper component that conditionally renders children based on module permissions
 * 
 * @param moduleId - The module ID to check (e.g., 'business_map', 'projects')
 * @param subModuleId - Optional sub-module ID to check (e.g., 'dashboard', 'project_control')
 * @param companyId - The company ID to check permissions for
 * @param requireEditAccess - If true, only shows if user has edit access (default: false, shows for view or edit)
 * @param fallback - Component to render when access is denied (default: nothing)
 * @param showLoading - Whether to show loading state (default: false)
 * @param loadingComponent - Custom loading component
 * @param children - Content to render when permission is granted
 */
export const ModuleWrapper: React.FC<ModuleWrapperProps> = ({
  children,
  moduleId,
  subModuleId,
  companyId,
  fallback = null,
  showLoading = false,
  loadingComponent = <div className="animate-pulse bg-muted rounded h-8 w-32" />,
  requireEditAccess = false
}) => {
  const { hasModuleAccess, hasSubModuleAccess, canEditSubModule, canViewSubModule, loading } = useUserPermissions(companyId);

  if (loading && showLoading) {
    return <>{loadingComponent}</>;
  }

  if (loading && !showLoading) {
    return null;
  }

  // Check module-level access first
  if (!hasModuleAccess(moduleId)) {
    return <>{fallback}</>;
  }

  // If checking a specific submodule
  if (subModuleId) {
    if (requireEditAccess && !canEditSubModule(moduleId, subModuleId)) {
      return <>{fallback}</>;
    }
    
    if (!requireEditAccess && !canViewSubModule(moduleId, subModuleId)) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

/**
 * Hook-based module permission check for use in components
 * Returns access level information for conditional logic within components
 */
interface UseModulePermissionProps {
  moduleId: string;
  subModuleId?: string;
  companyId: string;
}

export const useModulePermission = ({ moduleId, subModuleId, companyId }: UseModulePermissionProps) => {
  const { hasModuleAccess, hasSubModuleAccess, canEditSubModule, canViewSubModule, loading } = useUserPermissions(companyId);
  
  const accessLevel = subModuleId ? hasSubModuleAccess(moduleId, subModuleId) : 'can_view';
  
  return {
    hasAccess: subModuleId ? canViewSubModule(moduleId, subModuleId) : hasModuleAccess(moduleId),
    canEdit: subModuleId ? canEditSubModule(moduleId, subModuleId) : true, // Module level defaults to edit
    canView: subModuleId ? canViewSubModule(moduleId, subModuleId) : hasModuleAccess(moduleId),
    accessLevel,
    loading
  };
};

/**
 * Higher-order component for module-based route protection
 */
interface WithModulePermissionProps {
  moduleId: string;
  subModuleId?: string;
  companyId: string;
  requireEditAccess?: boolean;
  fallback?: React.ComponentType;
}

export const withModulePermission = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  { moduleId, subModuleId, companyId, requireEditAccess = false, fallback: Fallback }: WithModulePermissionProps
) => {
  const WithModulePermissionComponent: React.FC<P> = (props) => {
    const { hasAccess, canEdit, loading } = useModulePermission({ moduleId, subModuleId, companyId });

    if (loading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="animate-pulse bg-muted rounded h-32 w-full max-w-md" />
        </div>
      );
    }

    if (!hasAccess || (requireEditAccess && !canEdit)) {
      if (Fallback) {
        return <Fallback />;
      }
      
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have permission to access this module.
            </p>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };

  WithModulePermissionComponent.displayName = `withModulePermission(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithModulePermissionComponent;
};