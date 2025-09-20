import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AccessUser } from '@/types/accessUsers';
import { UserRole } from './useUserRole';

export const useUserManagement = () => {
  const [users, setUsers] = useState<AccessUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Use the secure RPC function to get all users for superadmins
      const { data: usersData, error: usersError } = await supabase
        .rpc('get_all_users_for_admin');

      if (usersError) {
        console.error('Error fetching users:', usersError);
        return;
      }

      // Map old role names to new ones for backward compatibility
      const mapOldRoleToNew = (role: string): UserRole => {
        switch (role) {
          case 'admin': return 'business_admin';
          case 'company_admin': return 'business_admin';
          case 'platform_admin': return 'business_admin';
          case 'owner': return 'superadmin';
          case 'superadmin': return 'superadmin';
          case 'business_admin': return 'business_admin';
          case 'project_admin': return 'project_admin';
          case 'user': return 'user';
          case 'client': return 'client';
          default: return 'user';
        }
      };

      const formattedUsers: AccessUser[] = usersData?.map(userData => {
        // Parse the JSON roles array from the RPC function
        const roleStrings = Array.isArray(userData.user_roles) ? userData.user_roles : [];
        const userRoles: UserRole[] = roleStrings.map((role: string) => mapOldRoleToNew(role));
        
        // If no roles found, default to 'user'
        if (userRoles.length === 0) {
          userRoles.push('user');
        }
        
        const roleHierarchy = { superadmin: 5, business_admin: 4, project_admin: 3, user: 2, client: 1 };
        const primaryRole = userRoles.reduce((highest, current) => 
          roleHierarchy[current] > roleHierarchy[highest] ? current : highest
        );
        
        return {
          id: userData.user_id, 
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          email: userData.email || '',
          company: userData.company || '',
          phone: userData.phone || '',
          avatar_url: userData.avatar_url || '',
          role: primaryRole,
          roles: userRoles,
          status: userData.status === 'active' ? 'Active' : 'Inactive',
          created_at: userData.created_at,
          updated_at: userData.updated_at
        };
      }) || [];

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error in fetchUsers:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      // Use the secure database function to update role
      const { data, error } = await supabase
        .rpc('set_user_primary_role', {
          target_user_id: userId,
          new_role: newRole
        });

      if (error) {
        console.error('Error updating user role:', error);
        throw error;
      }

      const result = data as { success: boolean; error?: string };
      if (!result.success) {
        throw new Error(result.error || 'Failed to update role');
      }

      // Refresh users list
      await fetchUsers();
      return { success: true };
    } catch (error) {
      console.error('Error updating user role:', error);
      return { success: false, error };
    }
  };

  const addUserRole = async (userId: string, role: UserRole) => {
    try {
      // Use the secure database function to add role
      const { data, error } = await supabase
        .rpc('manage_user_role', {
          target_user_id: userId,
          role_to_manage: role,
          operation: 'add'
        });

      if (error) {
        console.error('Error adding user role:', error);
        throw error;
      }

      const result = data as { success: boolean; error?: string };
      if (!result.success) {
        throw new Error(result.error || 'Failed to add role');
      }

      // Refresh users list
      await fetchUsers();
      return { success: true };
    } catch (error) {
      console.error('Error adding user role:', error);
      return { success: false, error };
    }
  };

  const removeUserRole = async (userId: string, role: UserRole) => {
    try {
      // Use the secure database function to remove role
      const { data, error } = await supabase
        .rpc('manage_user_role', {
          target_user_id: userId,
          role_to_manage: role,
          operation: 'remove'
        });

      if (error) {
        console.error('Error removing user role:', error);
        throw error;
      }

      const result = data as { success: boolean; error?: string };
      if (!result.success) {
        throw new Error(result.error || 'Failed to remove role');
      }

      // Refresh users list
      await fetchUsers();
      return { success: true };
    } catch (error) {
      console.error('Error removing user role:', error);
      return { success: false, error };
    }
  };

  const updateUserStatus = async (userId: string, status: 'active' | 'inactive') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating user status:', error);
        throw error;
      }

      // Refresh users list
      await fetchUsers();
      return { success: true };
    } catch (error) {
      console.error('Error updating user status:', error);
      return { success: false, error };
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      // Check if userId is null or undefined (invited users who haven't signed up)
      if (!userId || userId === 'null' || userId === 'undefined') {
        throw new Error('Cannot delete invited users who haven\'t completed signup. Revoke their invitation instead.');
      }

      // Get current session for auth header
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      // Call the edge function to completely delete user and revoke auth
      const { data, error } = await supabase.functions.invoke('delete-user-admin', {
        body: { targetUserId: userId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error calling delete-user-admin function:', error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete user');
      }

      // Refresh users list
      await fetchUsers();
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { success: false, error };
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.first_name.toLowerCase().includes(searchLower) ||
      user.last_name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      (user.company?.toLowerCase().includes(searchLower) || false)
    );
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users: filteredUsers,
    loading,
    searchTerm,
    setSearchTerm,
    updateUserRole,
    addUserRole,
    removeUserRole,
    updateUserStatus,
    deleteUser,
    refreshUsers: fetchUsers
  };
};