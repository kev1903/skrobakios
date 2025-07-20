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
          case 'admin': return 'company_admin';
          case 'user': return 'company_admin';
          case 'owner': return 'superadmin'; // Map owner to superadmin
          case 'superadmin': return 'superadmin';
          case 'company_admin': return 'company_admin';
          default: return 'company_admin';
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
        const userRoles = rolesMap.get(profile.user_id) || ['company_admin'];
        const roleHierarchy = { superadmin: 3, company_admin: 1 };
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
      // First, delete existing roles
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Then insert new role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole });

      if (error) {
        console.error('Error updating user role:', error);
        throw error;
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
      // Check if user already has this role
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('role', role)
        .single();

      if (existingRole) {
        return { success: false, error: 'User already has this role' };
      }

      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });

      if (error) {
        console.error('Error adding user role:', error);
        throw error;
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
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) {
        console.error('Error removing user role:', error);
        throw error;
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