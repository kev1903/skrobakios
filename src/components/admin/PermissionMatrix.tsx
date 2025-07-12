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
  // Platform Administration
  { id: 'manage_platform_users', name: 'Manage Platform Users', description: 'Create, edit, and delete platform users', category: 'Platform Administration' },
  { id: 'manage_platform_roles', name: 'Manage Platform Roles', description: 'Assign and modify platform-level roles', category: 'Platform Administration' },
  { id: 'view_platform_analytics', name: 'View Platform Analytics', description: 'Access platform-wide usage and performance data', category: 'Platform Administration' },
  { id: 'manage_system_settings', name: 'Manage System Settings', description: 'Configure global platform settings', category: 'Platform Administration' },
  
  // Company Management
  { id: 'view_all_companies', name: 'View All Companies', description: 'Access information for all companies on platform', category: 'Company Management' },
  { id: 'create_companies', name: 'Create Companies', description: 'Create new company accounts', category: 'Company Management' },
  { id: 'manage_company_settings', name: 'Manage Company Settings', description: 'Modify company configurations and modules', category: 'Company Management' },
  { id: 'manage_company_billing', name: 'Manage Company Billing', description: 'Handle billing and subscription management', category: 'Company Management' },
  
  // Project & Task Management
  { id: 'view_all_projects', name: 'View All Projects', description: 'Access projects across all companies', category: 'Project & Task Management' },
  { id: 'manage_projects', name: 'Manage Projects', description: 'Create, edit, and delete projects', category: 'Project & Task Management' },
  { id: 'manage_tasks', name: 'Manage Tasks', description: 'Create, assign, and manage tasks', category: 'Project & Task Management' },
  { id: 'view_project_analytics', name: 'View Project Analytics', description: 'Access project performance and progress data', category: 'Project & Task Management' },
  
  // Financial Management
  { id: 'view_financial_reports', name: 'View Financial Reports', description: 'Access financial reports and data', category: 'Financial Management' },
  { id: 'manage_estimates', name: 'Manage Estimates', description: 'Create and manage project estimates', category: 'Financial Management' },
  { id: 'manage_invoicing', name: 'Manage Invoicing', description: 'Handle invoice creation and management', category: 'Financial Management' },
  { id: 'manage_integrations', name: 'Manage Integrations', description: 'Configure third-party integrations (Xero, etc)', category: 'Financial Management' },
  
  // Lead & Sales Management
  { id: 'view_all_leads', name: 'View All Leads', description: 'Access leads across all companies', category: 'Lead & Sales Management' },
  { id: 'manage_leads', name: 'Manage Leads', description: 'Create, edit, and manage leads', category: 'Lead & Sales Management' },
  { id: 'view_sales_analytics', name: 'View Sales Analytics', description: 'Access sales performance and conversion data', category: 'Lead & Sales Management' },
  
  // Digital Twin & 3D Models
  { id: 'view_all_models', name: 'View All 3D Models', description: 'Access 3D models across all projects', category: 'Digital Twin & 3D Models' },
  { id: 'manage_digital_objects', name: 'Manage Digital Objects', description: 'Create and manage digital twin objects', category: 'Digital Twin & 3D Models' },
  { id: 'upload_3d_models', name: 'Upload 3D Models', description: 'Upload and manage 3D model files', category: 'Digital Twin & 3D Models' },
];

const defaultRoles: Role[] = [
  { id: 'superadmin', name: 'Super Admin', color: 'destructive', level: 3 },
  { id: 'platform_admin', name: 'Platform Admin', color: 'default', level: 2 },
  { id: 'company_admin', name: 'Company Admin', color: 'secondary', level: 1 },
];

// Default permission assignments based on the three-tier role hierarchy
const getDefaultPermissions = (roleLevel: number): string[] => {
  const allPermissions = defaultPermissions.map(p => p.id);
  
  switch (roleLevel) {
    case 3: // Super Admin - access to everything
      return allPermissions;
    case 2: // Platform Admin - selective permissions for platform departments (customizable via checkboxes)
      return [
        'view_platform_analytics',
        'view_all_companies',
        'manage_company_settings',
        'view_all_projects',
        'manage_projects',
        'view_project_analytics',
        'manage_leads',
        'view_sales_analytics',
        'view_all_models',
      ];
    case 1: // Company Admin - only company-specific permissions
      return [
        'manage_projects',
        'manage_tasks',
        'manage_estimates',
        'manage_invoicing',
        'manage_leads',
        'manage_digital_objects',
        'upload_3d_models',
      ];
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
    // Super Admin and Company Admin permissions are not editable
    if (roleId === 'superadmin' || roleId === 'company_admin') {
      return;
    }

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
              Super Admin has access to everything. Platform Admin permissions are customizable. Company Admin permissions are fixed to company-specific access only.
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
                        const isEditable = role.id === 'platform_admin';
                        const isReadOnly = role.id === 'superadmin' || role.id === 'company_admin';
                        
                        return (
                          <TableCell key={`${role.id}-${permission.id}`} className="text-center">
                            <div className="flex justify-center">
                              <Checkbox
                                checked={hasPermission}
                                onCheckedChange={() => handlePermissionToggle(role.id, permission.id)}
                                disabled={isReadOnly}
                                className={`
                                  ${hasPermission ? "data-[state=checked]:bg-primary data-[state=checked]:border-primary" : ""}
                                  ${isReadOnly ? "opacity-60 cursor-not-allowed" : ""}
                                  ${isEditable ? "cursor-pointer" : ""}
                                `}
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