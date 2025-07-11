import React, { useState } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MoreHorizontal, Edit, Trash2, Mail } from 'lucide-react';
import { AccessUser } from '@/types/accessUsers';
import { UserRole } from '@/hooks/useUserRole';
import { toast } from '@/hooks/use-toast';

interface UserTableRowProps {
  user: AccessUser;
  onUpdateRole: (userId: string, role: UserRole) => Promise<{ success: boolean; error?: any }>;
  onUpdateStatus: (userId: string, status: 'active' | 'inactive') => Promise<{ success: boolean; error?: any }>;
  onDeleteUser: (userId: string) => Promise<{ success: boolean; error?: any }>;
}

export const UserTableRow = ({
  user,
  onUpdateRole,
  onUpdateStatus,
  onDeleteUser
}: UserTableRowProps) => {
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleRoleChange = async (newRole: UserRole) => {
    setIsUpdatingRole(true);
    try {
      const result = await onUpdateRole(user.id, newRole);
      if (result.success) {
        toast({
          title: "Role Updated",
          description: `User role has been updated to ${newRole}.`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update user role.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleStatusChange = async () => {
    setIsUpdatingStatus(true);
    const newStatus = user.status === 'Active' ? 'inactive' : 'active';
    
    try {
      const result = await onUpdateStatus(user.id, newStatus);
      if (result.success) {
        toast({
          title: "Status Updated",
          description: `User has been ${newStatus === 'active' ? 'activated' : 'deactivated'}.`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update user status.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await onDeleteUser(user.id);
      if (result.success) {
        toast({
          title: "User Deleted",
          description: "User has been successfully deleted.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete user.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Inactive':
        return 'secondary';
      case 'Invited':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'destructive';
      case 'admin':
        return 'default';
      case 'user':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar_url} />
            <AvatarFallback>
              {user.first_name.charAt(0)}{user.last_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">
              {user.first_name} {user.last_name}
            </div>
            {user.phone && (
              <div className="text-sm text-muted-foreground">
                {user.phone}
              </div>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>{user.company || '-'}</TableCell>
      <TableCell>
        <Select
          value={user.role}
          onValueChange={handleRoleChange}
          disabled={isUpdatingRole}
        >
          <SelectTrigger className="w-32">
            <SelectValue>
              <Badge variant={getRoleBadgeVariant(user.role)}>
                {user.role}
              </Badge>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="superadmin">Super Admin</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Badge variant={getStatusBadgeVariant(user.status)}>
          {user.status}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatDate(user.created_at)}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleStatusChange}
              disabled={isUpdatingStatus}
            >
              {user.status === 'Active' ? 'Deactivate' : 'Activate'} User
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleDeleteUser}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};