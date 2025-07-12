import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Permission, Role } from '@/types/permission';

interface PermissionMatrixRowProps {
  permission: Permission;
  roles: Role[];
  permissionState: Record<string, string[]>;
  onPermissionToggle: (roleId: string, permissionId: string) => void;
}

export const PermissionMatrixRow = ({ 
  permission, 
  roles, 
  permissionState, 
  onPermissionToggle 
}: PermissionMatrixRowProps) => {
  return (
    <TableRow className="hover:bg-muted/20">
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
                onCheckedChange={() => onPermissionToggle(role.id, permission.id)}
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
  );
};