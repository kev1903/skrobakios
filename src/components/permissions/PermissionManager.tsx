import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Shield, Activity, Trash2 } from "lucide-react";
import { TeamMembersList } from './TeamMembersList';
import { RolePermissionsMatrix } from './RolePermissionsMatrix';
import { PermissionAuditLog } from './PermissionAuditLog';
import { UserCleanupButton } from '../admin/UserCleanupButton';
import { PlatformAdministration } from '../admin/PlatformAdministration';
import { useUserRole } from '@/hooks/useUserRole';

interface PermissionManagerProps {
  onNavigate: (page: string) => void;
  currentPage?: string;
}

export const PermissionManager: React.FC<PermissionManagerProps> = ({ onNavigate, currentPage }) => {
  const { isSuperAdmin } = useUserRole();

  // If current page is platform admin, show that component
  if (currentPage === 'platform-admin') {
    return <PlatformAdministration onNavigate={onNavigate} />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">Manage users, roles, and permissions</p>
        </div>
      </div>


      <Tabs defaultValue="members" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Members
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Role Permissions
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <TeamMembersList />
        </TabsContent>

        <TabsContent value="permissions">
          <RolePermissionsMatrix />
        </TabsContent>

        <TabsContent value="audit">
          <PermissionAuditLog />
        </TabsContent>
      </Tabs>
    </div>
  );
};