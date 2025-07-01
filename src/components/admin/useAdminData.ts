
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

interface UserWithRole {
  id: string;
  email: string;
  created_at: string;
  role: UserRole | null;
}

export const useAdminData = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // First, fetch all user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
        setError('Failed to fetch user roles');
        return;
      }

      // Then, fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email, created_at');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        setError('Failed to fetch user profiles');
        return;
      }

      // Combine the data
      const combinedUsers: UserWithRole[] = [];
      
      // Create a map of user roles for easy lookup
      const rolesMap = new Map(rolesData?.map(role => [role.user_id, role.role]) || []);
      
      // Process profiles and add role information
      profilesData?.forEach(profile => {
        if (profile.user_id && profile.email) {
          combinedUsers.push({
            id: profile.user_id,
            email: profile.email,
            created_at: profile.created_at || '',
            role: rolesMap.get(profile.user_id) || 'user'
          });
        }
      });

      setUsers(combinedUsers);
    } catch (err) {
      console.error('Error in fetchUsers:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: UserRole) => {
    try {
      setError(null);
      setSuccess(null);

      const { error } = await supabase
        .from('user_roles')
        .update({ role })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating user role:', error);
        setError('Failed to update user role');
        return;
      }

      setSuccess('User role updated successfully');
      fetchUsers(); // Refresh the users list
    } catch (err) {
      console.error('Error in updateUserRole:', err);
      setError('An unexpected error occurred');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    success,
    updateUserRole,
    refreshUsers: fetchUsers
  };
};
