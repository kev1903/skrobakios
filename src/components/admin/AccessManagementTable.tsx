import React, { useState } from 'react';
import { MoreHorizontal, Eye, Edit, Trash2, UserCheck, AlertCircle, Plus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export type UserRole = 
  | 'Super Admin'
  | 'Project Manager'
  | 'Project Admin'
  | 'Consultant'
  | 'SubContractor'
  | 'Estimator'
  | 'Accounts'
  | 'Client Viewer';

export type UserStatus = 'Active' | 'Suspended' | 'Invited';

export interface AccessUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
}

interface AccessManagementTableProps {
  users: AccessUser[];
  currentUserRole?: UserRole;
  onRoleChange: (userId: string, newRole: UserRole) => void;
  onStatusChange: (userId: string, newStatus: UserStatus) => void;
  onViewUser: (userId: string) => void;
  onEditUser: (userId: string) => void;
  onRemoveUser: (userId: string) => void;
  onReactivateUser: (userId: string) => void;
  onAddNewUser: () => void;
}

const ROLES: UserRole[] = [
  'Super Admin',
  'Project Manager',
  'Project Admin',
  'Consultant',
  'SubContractor',
  'Estimator',
  'Accounts',
  'Client Viewer',
];

export const AccessManagementTable = ({
  users,
  currentUserRole,
  onRoleChange,
  onStatusChange,
  onViewUser,
  onEditUser,
  onRemoveUser,
  onReactivateUser,
  onAddNewUser,
}: AccessManagementTableProps) => {
  const [removeUserId, setRemoveUserId] = useState<string | null>(null);

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    onRoleChange(userId, newRole);
  };

  const handleRemoveConfirm = () => {
    if (removeUserId) {
      onRemoveUser(removeUserId);
      setRemoveUserId(null);
    }
  };

  const getStatusBadgeVariant = (status: UserStatus) => {
    if (status === 'Active') return 'default';
    if (status === 'Invited') return 'secondary';
    return 'destructive';
  };

  const getInitials = (firstName: string, lastName: string) => {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  const isSuperAdmin = (role: UserRole) => role === 'Super Admin';
  const isAdmin = (role: UserRole) => role === 'Super Admin' || role === 'Project Manager' || role === 'Project Admin';
  
  const canAddUsers = currentUserRole ? isAdmin(currentUserRole) : false;

  const renderActions = (user: AccessUser) => {
    const isUserSuperAdmin = isSuperAdmin(user.role);
    const isSuspended = user.status === 'Suspended';
    const isInvited = user.status === 'Invited';

    if (isSuspended || isInvited) {
      return (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewUser(user.id)}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View User</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReactivateUser(user.id)}
                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                >
                  <UserCheck className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isInvited ? 'Resend Invitation' : 'Reactivate User'}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {isInvited && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRemoveUserId(user.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete Invited User</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewUser(user.id)}
                className="h-8 w-8 p-0"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>View User</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditUser(user.id)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit User</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => !isUserSuperAdmin && setRemoveUserId(user.id)}
                  disabled={isUserSuperAdmin}
                  className={`h-8 w-8 p-0 ${
                    isUserSuperAdmin 
                      ? 'text-muted-foreground cursor-not-allowed' 
                      : 'text-red-600 hover:text-red-700'
                  }`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {isUserSuperAdmin 
                ? 'Super Admin cannot be removed or restricted.' 
                : 'Remove User'
              }
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  };

  return (
    <>
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="heading-modern text-gradient">Access Management</CardTitle>
              <CardDescription>
                Manage user roles, permissions, and access levels
              </CardDescription>
            </div>
            {canAddUsers && (
              <Button 
                onClick={onAddNewUser}
                className="flex items-center gap-2"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                Invite User
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-semibold">User</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Company</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow 
                    key={user.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
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
                        onValueChange={(value: UserRole) => handleRoleChange(user.id, value)}
                        disabled={isSuperAdmin(user.role)}
                      >
                        <SelectTrigger className="w-full max-w-[160px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
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
                      {renderActions(user)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!removeUserId} onOpenChange={() => setRemoveUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Confirm User Removal
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this user? This action cannot be undone and will 
              revoke all access permissions for this user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRemoveUserId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};