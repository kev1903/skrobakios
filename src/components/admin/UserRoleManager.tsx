
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

interface UserWithRole {
  id: string;
  email: string;
  created_at: string;
  role: UserRole | null;
}

interface UserRoleManagerProps {
  users: UserWithRole[];
  onRoleUpdate: (userId: string, role: UserRole) => void;
  loading?: boolean;
}

export const UserRoleManager = ({ users, onRoleUpdate, loading = false }: UserRoleManagerProps) => {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');

  const handleUpdateRole = () => {
    if (!selectedUser || !selectedRole) return;
    
    onRoleUpdate(selectedUser, selectedRole);
    setSelectedUser('');
    setSelectedRole('user');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="w-5 h-5" />
          <span>Update User Role</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="user-select">Select User</Label>
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a user" />
            </SelectTrigger>
            <SelectContent>
              {users.map(user => (
                <SelectItem key={user.id} value={user.id}>
                  {user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="role-select">Select Role</Label>
          <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="superadmin">Super Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleUpdateRole}
          className="w-full"
          disabled={!selectedUser || !selectedRole || loading}
        >
          Update Role
        </Button>
      </CardContent>
    </Card>
  );
};
