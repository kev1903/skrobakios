
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { ROLES, ROLE_DISPLAY_NAMES } from './types';

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

  // Update the selected role when a user is selected
  useEffect(() => {
    if (selectedUser) {
      const user = users.find(u => u.id === selectedUser);
      if (user && user.role) {
        setSelectedRole(user.role);
      }
    }
  }, [selectedUser, users]);

  const handleUpdateRole = () => {
    if (!selectedUser || !selectedRole) return;
    
    onRoleUpdate(selectedUser, selectedRole);
    setSelectedUser('');
    setSelectedRole('user');
  };

  const selectedUserData = users.find(u => u.id === selectedUser);

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
                  <div className="flex items-center justify-between w-full">
                    <span>{user.email}</span>
                    <span className="text-xs text-slate-500 ml-2">({ROLE_DISPLAY_NAMES[user.role as keyof typeof ROLE_DISPLAY_NAMES] || 'User'})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedUserData && (
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-sm text-slate-600">
              <strong>Current Role:</strong> {ROLE_DISPLAY_NAMES[selectedUserData.role as keyof typeof ROLE_DISPLAY_NAMES] || 'User'}
            </div>
            <div className="text-sm text-slate-500 mt-1">
              User: {selectedUserData.email}
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="role-select">New Role</Label>
          <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a role" />
            </SelectTrigger>
             <SelectContent>
               {ROLES.map((role) => (
                 <SelectItem key={role} value={role}>
                   {ROLE_DISPLAY_NAMES[role]}
                 </SelectItem>
               ))}
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
