
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthPage } from './AuthPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  onNavigate: (page: string) => void;
  requireSuperAdmin?: boolean;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  onNavigate, 
  requireSuperAdmin = false, 
  requireAdmin = false 
}: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage onNavigate={onNavigate} />;
  }

  // Since we removed roles, all authenticated users have access
  return <>{children}</>;
};
