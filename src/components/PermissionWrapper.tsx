import React from 'react';
import { useUserPermissions } from '@/hooks/useUserPermissions';

interface PermissionWrapperProps {
  children: React.ReactNode;
  permission: string;
  companyId?: string;
  fallback?: React.ReactNode;
  showLoading?: boolean;
  loadingComponent?: React.ReactNode;
}

/**
 * PermissionWrapper component that conditionally renders children based on user permissions
 * 
 * @param permission - The permission key to check
 * @param companyId - The company ID to check permissions for
 * @param fallback - Component to render when permission is denied (default: nothing)
 * @param showLoading - Whether to show loading state (default: false)
 * @param loadingComponent - Custom loading component
 * @param children - Content to render when permission is granted
 */
export const PermissionWrapper: React.FC<PermissionWrapperProps> = ({
  children,
  permission,
  companyId,
  fallback = null,
  showLoading = false,
  loadingComponent = <div className="animate-pulse bg-muted rounded h-8 w-32" />
}) => {
  const { hasPermission, loading } = useUserPermissions(companyId);

  if (loading && showLoading) {
    return <>{loadingComponent}</>;
  }

  if (loading && !showLoading) {
    return null;
  }

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * Hook-based permission check for use in components
 * Returns true/false for conditional logic within components
 */
interface UsePermissionCheckProps {
  permission: string;
  companyId?: string;
}

export const usePermissionCheck = ({ permission, companyId }: UsePermissionCheckProps) => {
  const { hasPermission, loading } = useUserPermissions(companyId);
  
  return {
    hasPermission: hasPermission(permission),
    loading
  };
};

/**
 * Higher-order component for permission-based route protection
 */
interface WithPermissionProps {
  permission: string;
  companyId?: string;
  fallback?: React.ComponentType;
}

export const withPermission = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  { permission, companyId, fallback: Fallback }: WithPermissionProps
) => {
  const WithPermissionComponent: React.FC<P> = (props) => {
    const { hasPermission, loading } = useUserPermissions(companyId);

    if (loading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="animate-pulse bg-muted rounded h-32 w-full max-w-md" />
        </div>
      );
    }

    if (!hasPermission(permission)) {
      if (Fallback) {
        return <Fallback />;
      }
      
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have permission to access this feature.
            </p>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };

  WithPermissionComponent.displayName = `withPermission(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithPermissionComponent;
};