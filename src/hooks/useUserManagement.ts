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

      // Create a map of user_id to role for quick lookup
      const rolesMap = new Map();
      rolesData?.forEach(roleRecord => {
        rolesMap.set(roleRecord.user_id, roleRecord.role);
      });

      const formattedUsers: AccessUser[] = profilesData?.map(profile => ({
        id: profile.id,
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        company: profile.company || '',
        phone: profile.phone || '',
        avatar_url: profile.avatar_url || '',
        role: rolesMap.get(profile.user_id) || 'user',
        status: profile.status === 'active' ? 'Active' : 'Inactive',
        created_at: profile.created_at,
        updated_at: profile.updated_at
      })) || [];

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error in fetchUsers:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      // First, delete existing role
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
      // Delete from profiles (user_roles will be deleted automatically due to cascade)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting user:', error);
        throw error;
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
    updateUserStatus,
    deleteUser,
    refreshUsers: fetchUsers
  };
};