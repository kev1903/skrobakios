import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserTableRow } from './UserTableRow';
import { DeleteUserDialog } from './DeleteUserDialog';
import type { AccessManagementTableProps, UserRole } from './types';

// Re-export types for backward compatibility
export type { AccessUser, UserRole, UserStatus, AccessManagementTableProps } from './types';

const isAdmin = (role: UserRole) => role === 'superadmin' || role === 'project_manager';

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

  const handleRemoveConfirm = () => {
    if (removeUserId) {
      onRemoveUser(removeUserId);
      setRemoveUserId(null);
    }
  };

  const canAddUsers = currentUserRole ? isAdmin(currentUserRole) : false;

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
                  <UserTableRow
                    key={user.id}
                    user={user}
                    onRoleChange={onRoleChange}
                    onViewUser={onViewUser}
                    onEditUser={onEditUser}
                    onRemoveUser={setRemoveUserId}
                    onReactivateUser={onReactivateUser}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <DeleteUserDialog
        isOpen={!!removeUserId}
        onClose={() => setRemoveUserId(null)}
        onConfirm={handleRemoveConfirm}
      />
    </>
  );
};