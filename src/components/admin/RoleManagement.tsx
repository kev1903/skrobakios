import React, { useState } from 'react';
import { Shield, Plus, Settings, UserCog, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface RoleManagementProps {
  onNavigate: (page: string) => void;
}

// Mock role data - in a real app this would come from a database
const systemRoles = [
  {
    id: 'superadmin',
    name: 'Super Admin',
    description: 'Full system access with all administrative privileges',
    permissions: ['user_management', 'role_management', 'system_settings', 'project_management', 'financial_access'],
    userCount: 1,
    system: true
  },
  {
    id: 'project_manager',
    name: 'Project Manager',
    description: 'Manage projects, teams, and project-related activities',
    permissions: ['project_management', 'team_management', 'task_management', 'file_access'],
    userCount: 3,
    system: false
  },
  {
    id: 'project_admin',
    name: 'Project Admin',
    description: 'Administrative access to project settings and team management',
    permissions: ['project_settings', 'team_management', 'task_management'],
    userCount: 2,
    system: false
  },
  {
    id: 'consultant',
    name: 'Consultant',
    description: 'External consultant with limited project access',
    permissions: ['task_view', 'file_view', 'project_view'],
    userCount: 5,
    system: false
  },
  {
    id: 'subcontractor',
    name: 'SubContractor',
    description: 'External contractor with specific task access',
    permissions: ['task_management', 'file_access'],
    userCount: 8,
    system: false
  },
  {
    id: 'estimator',
    name: 'Estimator',
    description: 'Access to cost estimation and financial planning tools',
    permissions: ['estimation_tools', 'financial_view', 'project_view'],
    userCount: 2,
    system: false
  },
  {
    id: 'accounts',
    name: 'Accounts',
    description: 'Financial and accounting access',
    permissions: ['financial_management', 'invoice_management', 'expense_tracking'],
    userCount: 1,
    system: false
  },
  {
    id: 'client_viewer',
    name: 'Client Viewer',
    description: 'Limited read-only access for clients',
    permissions: ['project_view', 'progress_view'],
    userCount: 12,
    system: false
  }
];

export const RoleManagement = ({ onNavigate }: RoleManagementProps) => {
  const { isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const [roles, setRoles] = useState(systemRoles);

  const handleCreateRole = () => {
    toast({
      title: "Create Role",
      description: "Role creation functionality will be implemented here.",
    });
  };

  const handleEditRole = (roleId: string) => {
    toast({
      title: "Edit Role",
      description: `Editing role: ${roleId}`,
    });
  };

  const handleDeleteRole = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (role?.system) {
      toast({
        title: "Cannot Delete",
        description: "System roles cannot be deleted.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Delete Role",
      description: `Role deletion functionality will be implemented here.`,
    });
  };

  const getPermissionBadgeVariant = (permission: string) => {
    if (permission.includes('management')) return 'default';
    if (permission.includes('view')) return 'secondary';
    if (permission.includes('admin') || permission.includes('settings')) return 'destructive';
    return 'outline';
  };

  if (!isSuperAdmin) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need superadmin privileges to manage roles.</p>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
            Role Management
          </h2>
          <p className="text-slate-500 mt-1">Define and manage user roles and permissions</p>
        </div>
        <Button onClick={handleCreateRole} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Create Role</span>
        </Button>
      </div>

      {/* Role Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="backdrop-blur-sm bg-white/60 border-white/30">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-slate-500">Total Roles</p>
                <p className="text-2xl font-bold">{roles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-sm bg-white/60 border-white/30">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCog className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-slate-500">Active Users</p>
                <p className="text-2xl font-bold">{roles.reduce((sum, role) => sum + role.userCount, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-sm bg-white/60 border-white/30">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-slate-500">Custom Roles</p>
                <p className="text-2xl font-bold">{roles.filter(role => !role.system).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roles List */}
      <div className="grid gap-4">
        {roles.map((role) => (
          <Card key={role.id} className="backdrop-blur-sm bg-white/60 border-white/30 hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CardTitle className="text-lg">{role.name}</CardTitle>
                  {role.system && (
                    <Badge variant="destructive" className="text-xs">
                      System Role
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {role.userCount} {role.userCount === 1 ? 'user' : 'users'}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditRole(role.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {!role.system && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRole(role.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              <CardDescription>
                {role.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">Permissions</h4>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.map((permission) => (
                    <Badge
                      key={permission}
                      variant={getPermissionBadgeVariant(permission)}
                      className="text-xs"
                    >
                      {permission.replace('_', ' ').toUpperCase()}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};