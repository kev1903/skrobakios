import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Role } from '@/types/permission';

interface PermissionMatrixHeaderProps {
  roles: Role[];
}

export const PermissionMatrixHeader = ({ roles }: PermissionMatrixHeaderProps) => {
  return (
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
  );
};