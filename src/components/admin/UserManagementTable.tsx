import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { UserTableRow } from './UserTableRow';
import { AccessUser } from '@/types/accessUsers';
import { UserRole } from '@/hooks/useUserRole';
import { Loader2 } from 'lucide-react';

interface UserManagementTableProps {
  users: AccessUser[];
  loading: boolean;
  onUpdateRole: (userId: string, role: UserRole) => Promise<{ success: boolean; error?: any }>;
  onUpdateStatus: (userId: string, status: 'active' | 'inactive') => Promise<{ success: boolean; error?: any }>;
  onDeleteUser: (userId: string) => Promise<{ success: boolean; error?: any }>;
}

export const UserManagementTable = ({
  users,
  loading,
  onUpdateRole,
  onUpdateStatus,
  onDeleteUser
}: UserManagementTableProps) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading users...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">No users found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <UserTableRow
                  key={user.id}
                  user={user}
                  onUpdateRole={onUpdateRole}
                  onUpdateStatus={onUpdateStatus}
                  onDeleteUser={onDeleteUser}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};