
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

interface UserWithRole {
  id: string;
  email: string;
  created_at: string;
  role: UserRole | null;
}

interface UsersListProps {
  users: UserWithRole[];
  loading: boolean;
}

export const UsersList = ({ users, loading }: UsersListProps) => {
  const getRoleBadgeVariant = (role: UserRole | null) => {
    switch (role) {
      case 'superadmin':
        return 'destructive';
      case 'admin':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="w-5 h-5" />
          <span>All Users</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading users...</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {users.map(user => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{user.email}</p>
                  <p className="text-sm text-gray-500">
                    Joined: {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {user.role || 'user'}
                </Badge>
              </div>
            ))}
            {users.length === 0 && (
              <p className="text-center text-gray-500 py-4">No users found</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
