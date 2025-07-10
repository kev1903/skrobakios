import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AdminHeader } from './AdminHeader';
import { AdminAlerts } from './AdminAlerts';
import { UserRoleManager } from './UserRoleManager';
import { UsersList } from './UsersList';
import { UserInvitationManager } from './UserInvitationManager';
import { UserInvitationsList } from './UserInvitationsList';
import { AccessManagementTable, type AccessUser, type UserRole, type UserStatus } from './AccessManagementTable';
import { EmailTestButton } from './EmailTestButton';
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
    deleteUser,
    refetchUsers
  } = useAccessUsers();
  const [showInviteDialog, setShowInviteDialog] = useState(false);

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

  const handleReactivateUser = async (userId: string) => {
    const userToResend = accessUsers.find(user => user.id === userId);
    
    if (!userToResend) {
      toast({
        title: "Error",
        description: "User not found.",
        variant: "destructive",
      });
      return;
    }

    // If user is invited, resend the invitation email
    if (userToResend.status === 'Invited') {
      try {
        console.log(`Resending invitation to user ${userId}:`, userToResend);
        
        // Get current user info
        const { data: currentUser } = await supabase.auth.getUser();
        if (!currentUser.user) {
          throw new Error('You must be logged in to send invitations');
        }

        // Call edge function to resend invitation email
        const { data: invitationResult, error: invitationError } = await supabase.functions.invoke('send-user-invitation', {
          body: {
            email: userToResend.email,
            name: `${userToResend.first_name} ${userToResend.last_name}`,
            role: userToResend.role,
            invitedBy: currentUser.user.email || 'Admin',
            isResend: true // Flag to indicate this is a resend operation
          }
        });

        if (invitationError) {
          console.error('Error resending invitation:', invitationError);
          throw new Error(`Failed to resend invitation: ${invitationError.message}`);
        }

        if (!invitationResult?.success) {
          throw new Error(invitationResult?.error || 'Failed to resend invitation');
        }

        toast({
          title: "Invitation Resent",
          description: `Invitation email has been resent to ${userToResend.first_name} ${userToResend.last_name}.`,
        });
        
      } catch (error) {
        console.error('Error resending invitation:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to resend invitation.",
          variant: "destructive",
        });
      }
    } else {
      // For non-invited users, just reactivate them
      console.log(`Reactivating user ${userId}`);
      handleStatusChange(userId, 'Active');
    }
  };

  const handleAddNewUser = () => {
    setShowInviteDialog(true);
  };

  const handleInviteSuccess = () => {
    setShowInviteDialog(false);
    refetchUsers(); // Refresh the users list
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
      <div className="flex items-center justify-between">
        <AdminHeader onNavigate={onNavigate} />
        <EmailTestButton />
      </div>
      <AdminAlerts error={accessError || adminError} success={success} />
      
      <AccessManagementTable
        users={accessUsers}
        currentUserRole="superadmin"
        onRoleChange={handleRoleChange}
        onStatusChange={handleStatusChange}
        onViewUser={handleViewUser}
        onEditUser={handleEditUser}
        onRemoveUser={handleRemoveUser}
        onReactivateUser={handleReactivateUser}
        onAddNewUser={handleAddNewUser}
      />
      
      {showInviteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <UserInvitationManager 
              onNavigate={onNavigate}
              onSuccess={handleInviteSuccess}
            />
            <Button 
              variant="outline" 
              onClick={() => setShowInviteDialog(false)}
              className="mt-4 w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
