import React from 'react';
import { useUserRole, UserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/contexts/AuthContext';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles: UserRole[];
  redirectPage?: string;
  onNavigate?: (page: string) => void;
  fallbackMessage?: string;
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  requiredRoles,
  redirectPage = 'home',
  onNavigate,
  fallbackMessage
}) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { roles, loading: roleLoading } = useUserRole();

  // Show loading while checking authentication and roles
  if (authLoading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    if (onNavigate) {
      onNavigate('auth');
    }
    return null;
  }

  // Check if user has any of the required roles
  const hasRequiredRole = requiredRoles.some(role => roles.includes(role));

  if (!hasRequiredRole) {
    if (onNavigate && redirectPage) {
      onNavigate(redirectPage);
      return null;
    }

    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            {fallbackMessage || 'You do not have the required permissions to access this page.'}
          </p>
          <p className="text-sm text-muted-foreground">
            Required roles: {requiredRoles.join(', ')}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};