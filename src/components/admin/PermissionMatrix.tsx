import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { KeyRound } from 'lucide-react';
import { Permission, PermissionMatrixProps } from '@/types/permission';
import { defaultPermissions, defaultRoles } from '@/constants/permissions';
import { getDefaultPermissions } from '@/utils/permissionLogic';
import { PermissionMatrixHeader } from './PermissionMatrixHeader';
import { PermissionMatrixRow } from './PermissionMatrixRow';
import { PermissionMatrixActions } from './PermissionMatrixActions';

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
          <PermissionMatrixActions 
            hasChanges={hasChanges}
            onSave={handleSave}
            onReset={handleReset}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <PermissionMatrixHeader roles={roles} />
            <TableBody>
              {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                <React.Fragment key={category}>
                  <TableRow className="bg-muted/30">
                    <TableCell colSpan={roles.length + 1} className="font-medium text-sm text-muted-foreground uppercase tracking-wider py-2">
                      {category}
                    </TableCell>
                  </TableRow>
                  {categoryPermissions.map(permission => (
                    <PermissionMatrixRow 
                      key={permission.id}
                      permission={permission}
                      roles={roles}
                      permissionState={permissionState}
                      onPermissionToggle={handlePermissionToggle}
                    />
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