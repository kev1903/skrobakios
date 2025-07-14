import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PermissionMatrix } from "@/components/admin/PermissionMatrix";
import { defaultPermissions } from "@/constants/permissions";
import { defaultRoles } from "@/constants/permissions";

export const RolePermissionsMatrix: React.FC = () => {
  const handlePermissionChange = (roleId: string, permissionId: string, granted: boolean) => {
    // This would typically update the permissions in the database
    console.log('Permission change:', { roleId, permissionId, granted });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Permissions Matrix</CardTitle>
        <p className="text-muted-foreground">
          Configure permissions for each role level
        </p>
      </CardHeader>
      <CardContent>
        <PermissionMatrix
          permissions={defaultPermissions}
          roles={defaultRoles}
          onPermissionChange={handlePermissionChange}
        />
      </CardContent>
    </Card>
  );
};