import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { KeyRound, Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  color: string;
  level: number;
}

interface PermissionMatrixProps {
  permissions?: Permission[];
  roles?: Role[];
  onPermissionChange?: (roleId: string, permissionId: string, granted: boolean) => void;
}

const defaultPermissions: Permission[] = [
  { id: 'view_dashboard', name: 'View Dashboard', description: 'Access to main dashboard', category: 'General' },
  { id: 'export_users', name: 'Export List of Users', description: 'Export user data to CSV/Excel', category: 'User Management' },
  { id: 'create_segment', name: 'Create Segment', description: 'Create user segments and groups', category: 'User Management' },
  { id: 'campaign_maker', name: 'Campaign Maker', description: 'Create and manage campaigns', category: 'Marketing' },
  { id: 'campaign_checker', name: 'Campaign Checker', description: 'Review and approve campaigns', category: 'Marketing' },
  { id: 'update_integrations', name: 'Update Integrations', description: 'Manage third-party integrations', category: 'Configuration' },
  { id: 'update_data_management', name: 'Update Data Management', description: 'Manage data settings and policies', category: 'Configuration' },
  { id: 'update_settings', name: 'Update Settings', description: 'Modify system settings', category: 'Configuration' },
  { id: 'update_team_members', name: 'Update Team Members', description: 'Manage team member access', category: 'User Management' },
  { id: 'view_update_billing', name: 'View/Update Billing', description: 'Access billing and payment information', category: 'Financial' },
  { id: 'view_user_profile', name: 'View User Profile', description: 'Access user profile information', category: 'User Management' },
  { id: 'view_pii', name: 'View PII', description: 'Access personally identifiable information', category: 'Data Access' },
  { id: 'feedback_management', name: 'Feedback Management', description: 'Manage user feedback and reviews', category: 'General' },
];

const defaultRoles: Role[] = [
  { id: 'superadmin', name: 'Super Admin', color: 'destructive', level: 4 },
  { id: 'platform_admin', name: 'Platform Admin', color: 'default', level: 3 },
  { id: 'admin', name: 'Admin', color: 'secondary', level: 2 },
  { id: 'user', name: 'User', color: 'outline', level: 1 },
];

// Default permission assignments based on platform role hierarchy (from app_role enum)
const getDefaultPermissions = (roleLevel: number): string[] => {
  const allPermissions = defaultPermissions.map(p => p.id);
  
  switch (roleLevel) {
    case 4: // Super Admin - all permissions
      return allPermissions;
    case 3: // Platform Admin - all permissions except super admin specific
      return allPermissions.filter(p => !['view_pii'].includes(p));
    case 2: // Admin - most platform permissions
      return allPermissions.filter(p => !['view_pii', 'update_team_members', 'view_update_billing'].includes(p));
    case 1: // User - basic access
      return ['view_dashboard', 'view_user_profile'];
    default:
      return [];
  }
};

export const PermissionMatrix = ({ 
  permissions = defaultPermissions, 
  roles = defaultRoles,
  onPermissionChange 
}: PermissionMatrixProps) => {
  const [permissionState, setPermissionState] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    roles.forEach(role => {
      initial[role.id] = getDefaultPermissions(role.level);
    });
    return initial;
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handlePermissionToggle = (roleId: string, permissionId: string) => {
    setPermissionState(prev => {
      const newState = { ...prev };
      const rolePermissions = newState[roleId] || [];
      
      if (rolePermissions.includes(permissionId)) {
        newState[roleId] = rolePermissions.filter(p => p !== permissionId);
      } else {
        newState[roleId] = [...rolePermissions, permissionId];
      }
      
      setHasChanges(true);
      onPermissionChange?.(roleId, permissionId, newState[roleId].includes(permissionId));
      return newState;
    });
  };

  const handleSave = () => {
    // Here you would save the permissions to your backend
    console.log('Saving permissions:', permissionState);
    setHasChanges(false);
  };

  const handleReset = () => {
    const initial: Record<string, string[]> = {};
    roles.forEach(role => {
      initial[role.id] = getDefaultPermissions(role.level);
    });
    setPermissionState(initial);
    setHasChanges(false);
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5" />
              Permission Matrix
            </CardTitle>
            <CardDescription>
              Configure permissions for each role. Changes are highlighted and can be saved or reset.
            </CardDescription>
          </div>
          {hasChanges && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold text-foreground w-80">
                  Permissions
                </TableHead>
                {roles.map(role => (
                  <TableHead key={role.id} className="text-center font-semibold text-foreground min-w-24">
                    <div className="flex flex-col items-center gap-1">
                      <span>{role.name}</span>
                      <Badge variant={role.color as any} className="text-xs">
                        Level {role.level}
                      </Badge>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                <React.Fragment key={category}>
                  <TableRow className="bg-muted/30">
                    <TableCell colSpan={roles.length + 1} className="font-medium text-sm text-muted-foreground uppercase tracking-wider py-2">
                      {category}
                    </TableCell>
                  </TableRow>
                  {categoryPermissions.map(permission => (
                    <TableRow key={permission.id} className="hover:bg-muted/20">
                      <TableCell className="font-medium">
                        <div>
                          <div className="text-sm font-medium">{permission.name}</div>
                          <div className="text-xs text-muted-foreground">{permission.description}</div>
                        </div>
                      </TableCell>
                      {roles.map(role => {
                        const hasPermission = permissionState[role.id]?.includes(permission.id) || false;
                        return (
                          <TableCell key={`${role.id}-${permission.id}`} className="text-center">
                            <div className="flex justify-center">
                              <Checkbox
                                checked={hasPermission}
                                onCheckedChange={() => handlePermissionToggle(role.id, permission.id)}
                                className={hasPermission ? "data-[state=checked]:bg-primary data-[state=checked]:border-primary" : ""}
                              />
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {hasChanges && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span className="text-sm font-medium">You have unsaved changes</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};