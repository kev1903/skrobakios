
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, Mail } from 'lucide-react';
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>All Users</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {users.length} total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading users...</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {users.map(user => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-lg border border-slate-200/50 hover:shadow-md transition-all duration-200">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <p className="font-medium text-gray-900 truncate">{user.email}</p>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>Joined: {formatDate(user.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                    {user.role || 'user'}
                  </Badge>
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No users found</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
