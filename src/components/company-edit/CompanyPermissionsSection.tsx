import React, { useState } from 'react';
import { Shield, Lock, Eye, Edit, Trash2, Settings, Database, Users as UsersIcon, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  icon: React.ReactNode;
}

interface CompanyPermissionsSectionProps {
  companyId: string;
}

export const CompanyPermissionsSection = ({ companyId }: CompanyPermissionsSectionProps) => {
  const [permissions, setPermissions] = useState<Permission[]>([
    // Company Management
    {
      id: 'company_edit',
      name: 'Edit Company Details',
      description: 'Allow editing of company information, logo, and settings',
      category: 'Company Management',
      enabled: true,
      icon: <Edit className="w-4 h-4 text-blue-600" />
    },
    {
      id: 'company_delete',
      name: 'Delete Company',
      description: 'Allow permanent deletion of the company (dangerous)',
      category: 'Company Management',
      enabled: false,
      icon: <Trash2 className="w-4 h-4 text-red-600" />
    },
    {
      id: 'company_settings',
      name: 'Manage Settings',
      description: 'Access and modify company-wide settings and configurations',
      category: 'Company Management',
      enabled: true,
      icon: <Settings className="w-4 h-4 text-gray-600" />
    },
    
    // User Management
    {
      id: 'users_invite',
      name: 'Invite Users',
      description: 'Send invitations to new team members',
      category: 'User Management',
      enabled: true,
      icon: <UsersIcon className="w-4 h-4 text-green-600" />
    },
    {
      id: 'users_manage',
      name: 'Manage Users',
      description: 'Edit user roles, permissions, and remove users',
      category: 'User Management',
      enabled: true,
      icon: <UsersIcon className="w-4 h-4 text-blue-600" />
    },
    {
      id: 'users_view',
      name: 'View All Users',
      description: 'Access to view all company members and their details',
      category: 'User Management',
      enabled: true,
      icon: <Eye className="w-4 h-4 text-gray-600" />
    },
    
    // Data Access
    {
      id: 'data_export',
      name: 'Export Data',
      description: 'Download and export company data and reports',
      category: 'Data Access',
      enabled: false,
      icon: <Database className="w-4 h-4 text-purple-600" />
    },
    {
      id: 'data_analytics',
      name: 'Access Analytics',
      description: 'View detailed analytics and performance metrics',
      category: 'Data Access',
      enabled: true,
      icon: <FileText className="w-4 h-4 text-indigo-600" />
    },
    {
      id: 'data_sensitive',
      name: 'Access Sensitive Data',
      description: 'View financial information and confidential data',
      category: 'Data Access',
      enabled: false,
      icon: <Lock className="w-4 h-4 text-red-600" />
    }
  ]);

  const togglePermission = (permissionId: string) => {
    setPermissions(prev => prev.map(permission => 
      permission.id === permissionId 
        ? { ...permission, enabled: !permission.enabled }
        : permission
    ));
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Company Management':
        return 'bg-blue-100 text-blue-800';
      case 'User Management':
        return 'bg-green-100 text-green-800';
      case 'Data Access':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="backdrop-blur-xl bg-white/60 border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          <Shield className="w-5 h-5 text-blue-600" />
          <span>Company Permissions</span>
          <Badge variant="secondary">
            {permissions.filter(p => p.enabled).length} / {permissions.length} enabled
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
          <div key={category} className="space-y-4">
            <div className="flex items-center space-x-2">
              <Badge className={getCategoryColor(category)}>
                {category}
              </Badge>
              <div className="text-sm text-slate-600">
                {categoryPermissions.filter(p => p.enabled).length} of {categoryPermissions.length} enabled
              </div>
            </div>
            
            <div className="space-y-3">
              {categoryPermissions.map((permission) => (
                <div
                  key={permission.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-white/40 border border-white/30"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      {permission.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-slate-800">{permission.name}</h4>
                        {!permission.enabled && (
                          <Badge variant="outline" className="text-xs">
                            Disabled
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        {permission.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label
                      htmlFor={permission.id}
                      className="text-sm font-medium text-slate-700 cursor-pointer"
                    >
                      {permission.enabled ? 'Enabled' : 'Disabled'}
                    </Label>
                    <Switch
                      id={permission.id}
                      checked={permission.enabled}
                      onCheckedChange={() => togglePermission(permission.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {category !== Object.keys(groupedPermissions)[Object.keys(groupedPermissions).length - 1] && (
              <Separator className="my-4" />
            )}
          </div>
        ))}
        
        <div className="mt-6 p-4 rounded-lg bg-yellow-50/80 border border-yellow-200">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800">Permission Management</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Changes to permissions will affect all users with corresponding roles. 
                Be careful when modifying sensitive permissions like data access and user management.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};