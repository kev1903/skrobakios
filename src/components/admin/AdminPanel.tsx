import React from 'react';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { AdminHeader } from './AdminHeader';
import { AdminAlerts } from './AdminAlerts';
import { UserRoleManager } from './UserRoleManager';
import { UsersList } from './UsersList';
import { UserInvitationManager } from './UserInvitationManager';
import { UserInvitationsList } from './UserInvitationsList';
import { AccessManagementTable, type AccessUser } from './AccessManagementTable';
import { useAdminData } from './useAdminData';

interface AdminPanelProps {
  onNavigate: (page: string) => void;
}

export const AdminPanel = ({ onNavigate }: AdminPanelProps) => {
  const { isSuperAdmin } = useAuth();
  const { users, loading, error, success, updateUserRole } = useAdminData();

  // Sample data for Access Management Table
  const accessUsers: AccessUser[] = [
    {
      id: '1',
      name: 'Kevin Skrobaki',
      email: 'kevin@skrobaki.com',
      company: 'Skrobaki Construction',
      role: 'Super Admin',
      status: 'Active',
      avatar: '/placeholder.svg'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      company: 'ABC Construction',
      role: 'Project Manager',
      status: 'Active',
    },
    {
      id: '3',
      name: 'Mike Chen',
      email: 'mike.chen@example.com',
      company: 'DEF Engineering',
      role: 'Project Admin',
      status: 'Suspended',
    },
    {
      id: '4',
      name: 'Lisa Rodriguez',
      email: 'lisa.rodriguez@example.com',
      company: 'GHI Consulting',
      role: 'Consultant',
      status: 'Active',
    },
  ];

  const handleRoleChange = (userId: string, newRole: AccessUser['role']) => {
    console.log(`Changing role for user ${userId} to ${newRole}`);
    // Implement role change logic here
  };

  const handleStatusChange = (userId: string, newStatus: AccessUser['status']) => {
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

  const handleRemoveUser = (userId: string) => {
    console.log(`Removing user ${userId}`);
    // Implement remove user logic here
  };

  const handleReactivateUser = (userId: string) => {
    console.log(`Reactivating user ${userId}`);
    handleStatusChange(userId, 'Active');
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
      <AdminAlerts error={error} success={success} />
      
      <AccessManagementTable
        users={accessUsers}
        onRoleChange={handleRoleChange}
        onStatusChange={handleStatusChange}
        onViewUser={handleViewUser}
        onEditUser={handleEditUser}
        onRemoveUser={handleRemoveUser}
        onReactivateUser={handleReactivateUser}
      />
    </div>
  );
};
