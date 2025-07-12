import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { HierarchicalUser } from '@/types/hierarchicalUser';
import { UserRole } from '@/hooks/useUserRole';
import { toast } from '@/hooks/use-toast';

export const useHierarchicalUserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<HierarchicalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_manageable_users_for_user', {
        requesting_user_id: user.id
      });

      if (error) {
        console.error('Error fetching manageable users:', error);
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive",
        });
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserAppRole = async (userId: string, newRole: UserRole) => {
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
        return { success: false, error };
      }

      await fetchUsers(); // Refresh the list
      return { success: true };
    } catch (error) {
      console.error('Error updating user role:', error);
      return { success: false, error };
    }
  };

  const addUserAppRole = async (userId: string, role: UserRole) => {
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
        return { success: false, error };
      }

      await fetchUsers(); // Refresh the list
      return { success: true };
    } catch (error) {
      console.error('Error adding user role:', error);
      return { success: false, error };
    }
  };

  const removeUserAppRole = async (userId: string, role: UserRole) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) {
        console.error('Error removing user role:', error);
        return { success: false, error };
      }

      await fetchUsers(); // Refresh the list
      return { success: true };
    } catch (error) {
      console.error('Error removing user role:', error);
      return { success: false, error };
    }
  };

  const assignUserToCompany = async (userId: string, companyId: string, role: 'owner' | 'admin' | 'member' = 'member') => {
    try {
      const { error } = await supabase
        .from('company_members')
        .upsert(
          { 
            user_id: userId, 
            company_id: companyId, 
            role: role,
            status: 'active'
          },
          { onConflict: 'user_id,company_id' }
        );

      if (error) {
        console.error('Error assigning user to company:', error);
        return { success: false, error };
      }

      await fetchUsers(); // Refresh the list
      return { success: true };
    } catch (error) {
      console.error('Error assigning user to company:', error);
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
        return { success: false, error };
      }

      await fetchUsers(); // Refresh the list
      return { success: true };
    } catch (error) {
      console.error('Error updating user status:', error);
      return { success: false, error };
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('delete_user_completely', {
        target_user_id: userId
      });

      if (error) {
        console.error('Error deleting user:', error);
        return { success: false, error };
      }

      await fetchUsers(); // Refresh the list
      return { success: true, data };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { success: false, error };
    }
  };

  const inviteUser = async (email: string, companyId?: string, role?: 'owner' | 'admin' | 'member') => {
    try {
      // Send invitation via edge function
      const { data, error } = await supabase.functions.invoke('invite-user', {
        body: { 
          email, 
          company_id: companyId,
          role: role || 'member'
        }
      });

      if (error) {
        console.error('Error inviting user:', error);
        return { success: false, error };
      }

      await fetchUsers(); // Refresh the list
      return { success: true, data };
    } catch (error) {
      console.error('Error inviting user:', error);
      return { success: false, error };
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.first_name?.toLowerCase().includes(searchLower) ||
      user.last_name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.company?.toLowerCase().includes(searchLower)
    );
  });

  useEffect(() => {
    fetchUsers();
  }, [user]);

  return {
    users: filteredUsers,
    loading,
    searchTerm,
    setSearchTerm,
    updateUserAppRole,
    addUserAppRole,
    removeUserAppRole,
    assignUserToCompany,
    updateUserStatus,
    deleteUser,
    inviteUser,
    refreshUsers: fetchUsers
  };
};