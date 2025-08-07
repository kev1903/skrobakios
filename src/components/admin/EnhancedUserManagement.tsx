import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Building2, Users } from 'lucide-react';
import { PlatformUserManagement } from './PlatformUserManagement';
import { UserManagement } from './UserManagement';
import { UserCleanupButton } from './UserCleanupButton';
import { useUserRole } from '@/hooks/useUserRole';

// Mock companies data - in real app, this would come from a hook
const mockCompanies = [
  { id: '1', name: 'Acme Corp' },
  { id: '2', name: 'Tech Solutions Inc' },
  { id: '3', name: 'BuildCo' },
];

export const EnhancedUserManagement = () => {
  const { isSuperAdmin, isPlatformAdmin } = useUserRole();

  if (!isSuperAdmin() && !isPlatformAdmin()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You need admin privileges to access user management.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="w-6 h-6" />
        <h1 className="text-2xl font-bold">User Management System</h1>
      </div>
      
      <Tabs defaultValue={isSuperAdmin() ? "platform" : "standard"} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          {isSuperAdmin() && (
            <TabsTrigger value="platform" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Platform Management
            </TabsTrigger>
          )}
          <TabsTrigger value="standard" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Standard Management
          </TabsTrigger>
        </TabsList>

        {isSuperAdmin() && (
          <TabsContent value="platform" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Superadmin Platform Controls
                </CardTitle>
                <CardDescription>
                  Manage all platform users, assign company ownership, and control system-wide access.
                  Use this interface to assign users as company owners who can then manage their own teams.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                  <div>
                    <h3 className="font-semibold text-destructive">System Cleanup</h3>
                    <p className="text-sm text-muted-foreground">Remove all users except superadmin to fix orphaned auth records</p>
                  </div>
                  <UserCleanupButton />
                </div>
              </CardContent>
            </Card>
            <PlatformUserManagement companies={mockCompanies} />
          </TabsContent>
        )}

        <TabsContent value="standard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                {isSuperAdmin() ? 'Standard User Management' : 'User Management'}
              </CardTitle>
              <CardDescription>
                {isSuperAdmin() 
                  ? 'Standard user management interface for non-platform operations.'
                  : 'Manage users within your scope of authority.'
                }
              </CardDescription>
            </CardHeader>
          </Card>
          <UserManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};