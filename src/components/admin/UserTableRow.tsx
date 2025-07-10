import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserActions } from './UserActions';
import type { AccessUser, UserRole, UserStatus } from './types';
import { ROLES, ROLE_DISPLAY_NAMES } from './types';

interface UserTableRowProps {
  user: AccessUser;
  onRoleChange: (userId: string, newRole: UserRole) => void;
  onViewUser: (userId: string) => void;
  onEditUser: (userId: string) => void;
  onRemoveUser: (userId: string) => void;
  onReactivateUser: (userId: string) => void;
}

const getStatusBadgeVariant = (status: UserStatus) => {
  if (status === 'Active') return 'default';
  if (status === 'Invited') return 'secondary';
  return 'destructive';
};

const getInitials = (firstName: string, lastName: string) => {
  return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
};

const isSuperAdmin = (role: UserRole) => role === 'superadmin';

export const UserTableRow = ({
  user,
  onRoleChange,
  onViewUser,
  onEditUser,
  onRemoveUser,
  onReactivateUser,
}: UserTableRowProps) => {
  const handleRoleChange = (newRole: UserRole) => {
    onRoleChange(user.id, newRole);
  };

  return (
    <TableRow className="hover:bg-muted/20 transition-colors">
      <TableCell className="font-medium">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={`${user.first_name} ${user.last_name}`} />
            <AvatarFallback className="text-xs font-medium">
              {getInitials(user.first_name, user.last_name)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{user.first_name} {user.last_name}</span>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {user.email}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {user.company}
      </TableCell>
      <TableCell>
        <Select
          value={user.role}
          onValueChange={handleRoleChange}
          disabled={isSuperAdmin(user.role)}
        >
          <SelectTrigger className="w-full max-w-[160px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((role) => (
              <SelectItem key={role} value={role}>
                {ROLE_DISPLAY_NAMES[role]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Badge 
          variant={getStatusBadgeVariant(user.status)}
          className="text-xs"
        >
          {user.status}
        </Badge>
      </TableCell>
      <TableCell className="text-center">
        <UserActions
          user={user}
          onViewUser={onViewUser}
          onEditUser={onEditUser}
          onRemoveUser={onRemoveUser}
          onReactivateUser={onReactivateUser}
        />
      </TableCell>
    </TableRow>
  );
};