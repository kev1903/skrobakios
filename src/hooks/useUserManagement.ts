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
      
      // Get profiles first
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      // Get user roles separately
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
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

      // Create a map of user_id to roles for quick lookup
      const rolesMap = new Map<string, UserRole[]>();
      rolesData?.forEach(roleRecord => {
        const existing = rolesMap.get(roleRecord.user_id) || [];
        const mappedRole = mapOldRoleToNew(roleRecord.role);
        rolesMap.set(roleRecord.user_id, [...existing, mappedRole]);
      });

      const formattedUsers: AccessUser[] = profilesData?.map(profile => {
        const userRoles = rolesMap.get(profile.user_id) || ['user'];
        const roleHierarchy = { superadmin: 5, business_admin: 4, project_admin: 3, user: 2, client: 1 };
        const primaryRole = userRoles.reduce((highest, current) => 
          roleHierarchy[current] > roleHierarchy[highest] ? current : highest
        );
        
        return {
          id: profile.user_id || profile.id, // Use user_id (auth ID) for operations, fallback to profile id
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          email: profile.email || '',
          company: profile.company || '',
          phone: profile.phone || '',
          avatar_url: profile.avatar_url || '',
          role: primaryRole,
          roles: userRoles,
          status: profile.status === 'active' ? 'Active' : 'Inactive',
          created_at: profile.created_at,
          updated_at: profile.updated_at
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