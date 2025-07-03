import { useState, useEffect } from 'react';
import type { AccessUser, UserRole } from '@/components/admin/AccessManagementTable';
import { fetchUsersData, updateUserRoleInDatabase, deleteUserFromDatabase } from '@/services/userService';

export const useAccessUsers = () => {
  const [users, setUsers] = useState<AccessUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const accessUsers = await fetchUsersData();
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
      await updateUserRoleInDatabase(userId, newRole);
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
      
      await deleteUserFromDatabase(userId);
      
      console.log('User deletion completed successfully');

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