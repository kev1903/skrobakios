import React from 'react';
import { UserManagementTable } from './UserManagementTable';
import { UserManagementHeader } from './UserManagementHeader';
import { useUserManagement } from '@/hooks/useUserManagement';

export const UserManagement = () => {
  const {
    users,
    loading,
    searchTerm,
    setSearchTerm,
    updateUserRole,
    updateUserStatus,
    deleteUser,
    refreshUsers
  } = useUserManagement();

  return (
    <div className="space-y-6">
      <UserManagementHeader 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onRefresh={refreshUsers}
        totalUsers={users.length}
      />
      
      <UserManagementTable
        users={users}
        loading={loading}
        onUpdateRole={updateUserRole}
        onUpdateStatus={updateUserStatus}
        onDeleteUser={deleteUser}
      />
    </div>
  );
};