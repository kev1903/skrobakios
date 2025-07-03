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
      console.log('Starting delete process for user:', userId);
      
      // Get the user_id from the profile first
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, email, first_name, last_name')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }

      console.log('Profile data found:', profileData);
      const userAccountId = profileData.user_id;

      // Delete user role first (foreign key constraint) - only if user has an account
      if (userAccountId) {
        console.log('Deleting user role for:', userAccountId);
        const { error: roleError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userAccountId);

        if (roleError) {
          console.error('Error deleting user role:', roleError);
          throw roleError;
        }
        console.log('User role deleted successfully');
      } else {
        console.log('No user account found, skipping role deletion');
      }

      // Delete any pending invitations for this user
      if (profileData.email) {
        console.log('Deleting invitations for:', profileData.email);
        const { error: invitationError } = await supabase
          .from('user_invitations')
          .delete()
          .eq('email', profileData.email);

        if (invitationError) {
          console.error('Error deleting invitations:', invitationError);
          // Don't throw here, continue with profile deletion
        } else {
          console.log('Invitations deleted successfully');
        }
      }

      // Delete the profile (this should now work with the new RLS policy)
      console.log('Deleting profile:', userId);
      const { error: deleteError, count } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (deleteError) {
        console.error('Error deleting profile:', deleteError);
        throw deleteError;
      }
      
      console.log('Profile deletion result - rows affected:', count);
      
      if (count === 0) {
        console.warn('No rows were deleted - profile may not exist or permission denied');
        throw new Error('Failed to delete profile - no rows affected');
      }
      
      console.log('Profile deleted successfully');

      // Immediately update the local state to remove the user from UI
      console.log('Updating local state...');
      setUsers(prevUsers => {
        const updatedUsers = prevUsers.filter(user => user.id !== userId);
        console.log('Local state updated, remaining users:', updatedUsers.length);
        return updatedUsers;
      });

      // Also refresh from database to ensure consistency
      console.log('Refreshing users list from database...');
      await fetchUsers();
      console.log('Users list refreshed from database');
      
    } catch (err) {
      console.error('Error in deleteUser function:', err);
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