import React from 'react';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AdminHeader } from './AdminHeader';
import { AdminAlerts } from './AdminAlerts';
import { UserRoleManager } from './UserRoleManager';
import { UsersList } from './UsersList';
import { UserInvitationManager } from './UserInvitationManager';
import { UserInvitationsList } from './UserInvitationsList';
import { AccessManagementTable, type AccessUser, type UserRole, type UserStatus } from './AccessManagementTable';
import { useAccessUsers } from '@/hooks/useAccessUsers';
import { useAdminData } from './useAdminData';

interface AdminPanelProps {
  onNavigate: (page: string) => void;
}

export const AdminPanel = ({ onNavigate }: AdminPanelProps) => {
  const { isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const { users: adminUsers, loading: adminLoading, error: adminError, success } = useAdminData();
  const { 
    users: accessUsers, 
    loading: accessLoading, 
    error: accessError, 
    updateUserRole: updateAccessUserRole,
    deleteUser
  } = useAccessUsers();

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    updateAccessUserRole(userId, newRole);
  };

  const handleStatusChange = (userId: string, newStatus: UserStatus) => {
    console.log(`Changing status for user ${userId} to ${newStatus}`);
    // Implement status change logic here
  };

  const handleViewUser = (userId: string) => {
    console.log(`Viewing user ${userId}`);
    // Implement view user logic here
  };

  const handleEditUser = (userId: string) => {
    console.log(`Editing user ${userId}`);
    // Implement edit user logic here
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      const userToDelete = accessUsers.find(user => user.id === userId);
      await deleteUser(userId);
      
      toast({
        title: "User Deleted",
        description: `${userToDelete?.first_name} ${userToDelete?.last_name} has been successfully removed from the system.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReactivateUser = (userId: string) => {
    console.log(`Reactivating user ${userId}`);
    handleStatusChange(userId, 'Active');
  };

  const handleAddNewUser = () => {
    onNavigate('admin-new-user');
  };

  if (!isSuperAdmin) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need superadmin privileges to access this panel.</p>
          <Button 
            onClick={() => onNavigate('dashboard')} 
            className="mt-4"
            variant="outline"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AdminHeader onNavigate={onNavigate} />
      <AdminAlerts error={accessError || adminError} success={success} />
      
      <AccessManagementTable
        users={accessUsers}
        currentUserRole="Super Admin"
        onRoleChange={handleRoleChange}
        onStatusChange={handleStatusChange}
        onViewUser={handleViewUser}
        onEditUser={handleEditUser}
        onRemoveUser={handleRemoveUser}
        onReactivateUser={handleReactivateUser}
        onAddNewUser={handleAddNewUser}
      />
    </div>
  );
};
