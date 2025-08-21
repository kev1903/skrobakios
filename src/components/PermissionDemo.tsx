import React from 'react';
import { PermissionWrapper } from '@/components/PermissionWrapper';
import { PERMISSIONS } from '@/hooks/useUserPermissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Users, Settings, BarChart3, FolderOpen, FileText, Eye, EyeOff } from 'lucide-react';

interface PermissionDemoProps {
  companyId: string;
  userName?: string;
}

/**
 * Demo component showing how permissions control feature access
 * This demonstrates the real-time permission enforcement
 */
export const PermissionDemo: React.FC<PermissionDemoProps> = ({ companyId, userName = 'User' }) => {
  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Live Permissions Demo</h2>
        <p className="text-muted-foreground">
          This shows what <strong>{userName}</strong> can see based on their current permissions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Company Management */}
        <PermissionWrapper 
          permission={PERMISSIONS.MANAGE_COMPANY_USERS} 
          companyId={companyId}
          fallback={
            <Card className="opacity-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-muted-foreground">
                  <EyeOff className="h-5 w-5" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Access Denied</p>
              </CardContent>
            </Card>
          }
        >
          <Card className="border-green-200 bg-green-50 dark:bg-green-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button size="sm" className="w-full">
                Manage Users
              </Button>
            </CardContent>
          </Card>
        </PermissionWrapper>

        {/* Company Settings */}
        <PermissionWrapper 
          permission={PERMISSIONS.MANAGE_COMPANY_SETTINGS} 
          companyId={companyId}
          fallback={
            <Card className="opacity-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-muted-foreground">
                  <EyeOff className="h-5 w-5" />
                  Company Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Access Denied</p>
              </CardContent>
            </Card>
          }
        >
          <Card className="border-green-200 bg-green-50 dark:bg-green-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-green-600" />
                Company Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button size="sm" className="w-full">
                Configure Settings
              </Button>
            </CardContent>
          </Card>
        </PermissionWrapper>

        {/* Analytics */}
        <PermissionWrapper 
          permission={PERMISSIONS.VIEW_COMPANY_ANALYTICS} 
          companyId={companyId}
          fallback={
            <Card className="opacity-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-muted-foreground">
                  <EyeOff className="h-5 w-5" />
                  Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Access Denied</p>
              </CardContent>
            </Card>
          }
        >
          <Card className="border-green-200 bg-green-50 dark:bg-green-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button size="sm" className="w-full">
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </PermissionWrapper>

        {/* Project Management */}
        <PermissionWrapper 
          permission={PERMISSIONS.MANAGE_PROJECTS} 
          companyId={companyId}
          fallback={
            <Card className="opacity-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-muted-foreground">
                  <EyeOff className="h-5 w-5" />
                  Project Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Access Denied</p>
              </CardContent>
            </Card>
          }
        >
          <Card className="border-green-200 bg-green-50 dark:bg-green-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-green-600" />
                Project Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button size="sm" className="w-full">
                Manage Projects
              </Button>
            </CardContent>
          </Card>
        </PermissionWrapper>

        {/* Project Files */}
        <PermissionWrapper 
          permission={PERMISSIONS.MANAGE_PROJECT_FILES} 
          companyId={companyId}
          fallback={
            <Card className="opacity-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-muted-foreground">
                  <EyeOff className="h-5 w-5" />
                  File Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Access Denied</p>
              </CardContent>
            </Card>
          }
        >
          <Card className="border-green-200 bg-green-50 dark:bg-green-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                File Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button size="sm" className="w-full">
                Manage Files
              </Button>
            </CardContent>
          </Card>
        </PermissionWrapper>

        {/* Reports */}
        <PermissionWrapper 
          permission={PERMISSIONS.VIEW_REPORTS} 
          companyId={companyId}
          fallback={
            <Card className="opacity-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-muted-foreground">
                  <EyeOff className="h-5 w-5" />
                  Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Access Denied</p>
              </CardContent>
            </Card>
          }
        >
          <Card className="border-green-200 bg-green-50 dark:bg-green-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-green-600" />
                Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button size="sm" className="w-full">
                View Reports
              </Button>
            </CardContent>
          </Card>
        </PermissionWrapper>

      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800 dark:text-blue-200">How It Works</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Green cards show features this user can access. Gray cards show restricted features. 
              Changes to permissions in the admin panel instantly affect what users see when they log in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};