import React, { useEffect, useState } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { useCompanyModules } from '@/hooks/useCompanyModules';
import { useAuth } from '@/contexts/AuthContext';
import { AlertTriangle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthPage } from './AuthPage';

interface ModuleProtectedRouteProps {
  children: React.ReactNode;
  requiredModule: string;
  onNavigate: (page: string) => void;
  fallbackPage?: string;
}

export const ModuleProtectedRoute = ({ 
  children, 
  requiredModule, 
  onNavigate,
  fallbackPage = 'home'
}: ModuleProtectedRouteProps) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { currentCompany } = useCompany();
  const { fetchCompanyModules, isModuleEnabled } = useCompanyModules();
  const [loading, setLoading] = useState(true);

  // Check authentication first
  if (authLoading) {
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

  useEffect(() => {
    const checkModuleAccess = async () => {
      if (currentCompany?.id) {
        try {
          await fetchCompanyModules(currentCompany.id);
        } catch (error) {
          console.error('Error fetching company modules:', error);
        }
      }
      setLoading(false);
    };

    checkModuleAccess();
  }, [currentCompany?.id]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading module permissions...</p>
        </div>
      </div>
    );
  }

  if (!currentCompany) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <CardTitle>No Company Selected</CardTitle>
            <CardDescription>
              Please select a company to access this module.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => onNavigate(fallbackPage)}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasModuleAccess = isModuleEnabled(currentCompany.id, requiredModule);

  if (!hasModuleAccess) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <CardTitle>Module Not Available</CardTitle>
            <CardDescription>
              The {requiredModule.charAt(0).toUpperCase() + requiredModule.slice(1)} module is not enabled for your company.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Contact your administrator to enable this module.
            </p>
            <Button onClick={() => onNavigate(fallbackPage)}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};