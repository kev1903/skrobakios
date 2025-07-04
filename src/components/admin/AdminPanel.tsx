import React, { useState } from 'react';
import { Shield, Users, Settings, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AdminHeader } from './AdminHeader';
import { AdminAlerts } from './AdminAlerts';
import { UserRoleManager } from './UserRoleManager';
import { UsersList } from './UsersList';
import { UserInvitationManager } from './UserInvitationManager';
import { UserInvitationsList } from './UserInvitationsList';
import { AccessManagementTable, type AccessUser, type UserRole, type UserStatus } from './AccessManagementTable';
import { Database } from '@/integrations/supabase/types';
import { useAccessUsers } from '@/hooks/useAccessUsers';
import { useAdminData } from './useAdminData';

interface AdminPanelProps {
  onNavigate: (page: string) => void;
}

export const AdminPanel = ({ onNavigate }: AdminPanelProps) => {
  const { isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('access-management');
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

  const handleDatabaseRoleChange = (userId: string, role: Database['public']['Enums']['user_role']) => {
    // Convert database role to UserRole format for consistency
    console.log(`Updating database role for user ${userId} to ${role}`);
    // This would need to be implemented with proper database role update logic
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
      console.log('Admin panel: Starting user deletion for:', userId);
      const userToDelete = accessUsers.find(user => user.id === userId);
      console.log('User to delete:', userToDelete);
      
      await deleteUser(userId);
      
      console.log('User deletion completed successfully');
      toast({
        title: "User Deleted",
        description: `${userToDelete?.first_name} ${userToDelete?.last_name} has been successfully removed from the system.`,
      });
    } catch (error) {
      console.error('Admin panel: Error deleting user:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user. Please try again.",
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 backdrop-blur-sm bg-white/60">
          <TabsTrigger value="access-management" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Access Management</span>
          </TabsTrigger>
          <TabsTrigger value="user-roles" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">User Roles</span>
          </TabsTrigger>
          <TabsTrigger value="invitations" className="flex items-center space-x-2">
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Invitations</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="access-management" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="user-roles" className="space-y-6">
          <UserRoleManager 
            users={adminUsers}
            onRoleUpdate={handleDatabaseRoleChange}
            loading={adminLoading}
          />
        </TabsContent>

        <TabsContent value="invitations" className="space-y-6">
          <div className="space-y-6">
            <UserInvitationManager />
            <UserInvitationsList />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
