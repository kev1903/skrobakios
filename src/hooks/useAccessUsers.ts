import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { AccessUser, UserRole } from '@/components/admin/AccessManagementTable';

interface DatabaseProfile {
  id: string;
  user_id: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  avatar_url: string | null;
  company: string | null;
}

interface DatabaseRole {
  user_id: string;
  role: 'superadmin' | 'admin' | 'user';
}

const mapDatabaseRoleToDisplayRole = (dbRole: 'superadmin' | 'admin' | 'user'): UserRole => {
  switch (dbRole) {
    case 'superadmin':
      return 'Super Admin';
    case 'admin':
      return 'Project Manager';
    case 'user':
    default:
      return 'Client Viewer';
  }
};

export const useAccessUsers = () => {
  const [users, setUsers] = useState<AccessUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          first_name,
          last_name,
          email,
          avatar_url,
          company
        `)
        .order('first_name');

      if (fetchError) throw fetchError;

      // Get user roles separately
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Create a map of user roles for quick lookup
      const rolesMap = new Map<string, 'superadmin' | 'admin' | 'user'>();
      (rolesData as DatabaseRole[]).forEach(role => {
        rolesMap.set(role.user_id, role.role);
      });

      const accessUsers: AccessUser[] = (data as DatabaseProfile[]).map(user => ({
        id: user.id,
        first_name: user.first_name || 'Unknown',
        last_name: user.last_name || 'User',
        email: user.email || '',
        company: user.company || 'No Company',
        role: mapDatabaseRoleToDisplayRole(rolesMap.get(user.user_id || '') || 'user'),
        status: 'Active', // Default to active, can be enhanced later
        avatar: user.avatar_url || undefined,
      }));

      setUsers(accessUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      // Map display role back to database role
      let dbRole: 'superadmin' | 'admin' | 'user';
      switch (newRole) {
        case 'Super Admin':
          dbRole = 'superadmin';
          break;
        case 'Project Manager':
        case 'Project Admin':
        case 'Consultant':
        case 'SubContractor':
        case 'Estimator':
        case 'Accounts':
          dbRole = 'admin';
          break;
        default:
          dbRole = 'user';
      }

      const { error: updateError } = await supabase
        .from('user_roles')
        .update({ role: dbRole })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // Refresh the users list
      await fetchUsers();
    } catch (err) {
      console.error('Error updating user role:', err);
      setError(err instanceof Error ? err.message : 'Failed to update user role');
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      // Get the user_id from the profile first
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      const userAccountId = profileData.user_id;

      // Delete user role first (foreign key constraint)
      if (userAccountId) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userAccountId);

        if (roleError) throw roleError;
      }

      // Delete any pending invitations for this user
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();

      if (profile?.email) {
        await supabase
          .from('user_invitations')
          .delete()
          .eq('email', profile.email);
      }

      // Delete the profile
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (deleteError) throw deleteError;

      // Delete the auth user if they have an account
      if (userAccountId) {
        const { error: authError } = await supabase.auth.admin.deleteUser(userAccountId);
        if (authError) {
          console.error('Error deleting auth user:', authError);
          // Don't throw here as the profile is already deleted
        }
      }

      // Refresh the users list
      await fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      throw err;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    refetchUsers: fetchUsers,
    updateUserRole,
    deleteUser,
  };
};