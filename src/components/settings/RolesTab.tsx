import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Shield, User, Eye, Settings, ChevronDown, ChevronRight, Home, Calendar, Mail, File, Briefcase, DollarSign, TrendingUp, HelpCircle, Box, CheckSquare, Folder, Users, BarChart3, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PermissionSection {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  permissions: Permission[];
}

interface Permission {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface RoleConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  enabled: boolean;
  level: 'low' | 'medium' | 'high';
  companyPermissions: Permission[];
  projectPermissions: Permission[];
}

export const RolesTab = () => {
  const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [roles, setRoles] = useState<RoleConfig[]>([
    {
      id: 'user',
      name: 'User',
      description: 'Basic user permissions for accessing standard features',
      icon: User,
      enabled: true,
      level: 'low',
      companyPermissions: [
        { id: 'home', name: 'Home Dashboard', description: 'Access to main dashboard', enabled: true },
        { id: 'my-tasks', name: 'My Tasks', description: 'View and manage personal tasks', enabled: true },
        { id: 'schedules', name: 'My Schedules', description: 'View personal schedules', enabled: true },
        { id: 'inbox', name: 'Inbox', description: 'Access to messaging system', enabled: true },
        { id: 'files', name: 'Files', description: 'Basic file access', enabled: true },
        { id: 'projects', name: 'Projects', description: 'View assigned projects', enabled: true },
        { id: 'support', name: 'Help Center', description: 'Access to support resources', enabled: true },
      ],
      projectPermissions: [
        { id: 'insights', name: 'Dashboard', description: 'View project dashboard', enabled: true },
        { id: 'tasks', name: 'Tasks', description: 'View and update assigned tasks', enabled: true },
        { id: 'files', name: 'Files', description: 'Access project files', enabled: true },
        { id: 'schedule', name: 'Schedule', description: 'View project schedule', enabled: false },
        { id: 'cost', name: 'Cost & Contracts', description: 'View basic cost information', enabled: false },
        { id: 'team', name: 'Team', description: 'View team members', enabled: false },
        { id: 'digital-twin', name: 'Digital Twin', description: 'Access digital twin features', enabled: false },
        { id: 'digital-objects', name: 'Digital Objects', description: 'View digital objects', enabled: false },
      ]
    },
    {
      id: 'admin',
      name: 'Admin',
      description: 'Administrative access to manage users and system settings',
      icon: Settings,
      enabled: false,
      level: 'medium',
      companyPermissions: [
        { id: 'home', name: 'Home Dashboard', description: 'Access to main dashboard', enabled: true },
        { id: 'my-tasks', name: 'My Tasks', description: 'View and manage all tasks', enabled: true },
        { id: 'schedules', name: 'My Schedules', description: 'Manage all schedules', enabled: true },
        { id: 'inbox', name: 'Inbox', description: 'Access to messaging system', enabled: true },
        { id: 'files', name: 'Files', description: 'Full file management', enabled: true },
        { id: 'projects', name: 'Projects', description: 'Manage all projects', enabled: true },
        { id: 'finance', name: 'Finance', description: 'Access financial reports', enabled: true },
        { id: 'sales', name: 'Sales', description: 'Manage sales data', enabled: true },
        { id: 'settings', name: 'Settings', description: 'Configure system settings', enabled: true },
        { id: 'support', name: 'Help Center', description: 'Access to support resources', enabled: true },
      ],
      projectPermissions: [
        { id: 'insights', name: 'Dashboard', description: 'Full project dashboard access', enabled: true },
        { id: 'tasks', name: 'Tasks', description: 'Manage all project tasks', enabled: true },
        { id: 'files', name: 'Files', description: 'Manage project files', enabled: true },
        { id: 'schedule', name: 'Schedule', description: 'Manage project schedule', enabled: true },
        { id: 'cost', name: 'Cost & Contracts', description: 'Manage project finances', enabled: true },
        { id: 'team', name: 'Team', description: 'Manage project team', enabled: true },
        { id: 'digital-twin', name: 'Digital Twin', description: 'Manage digital twin features', enabled: true },
        { id: 'digital-objects', name: 'Digital Objects', description: 'Manage digital objects', enabled: true },
      ]
    },
    {
      id: 'superadmin',
      name: 'Super Admin',
      description: 'Full system access with all administrative privileges',
      icon: Shield,
      enabled: false,
      level: 'high',
      companyPermissions: [
        { id: 'home', name: 'Home Dashboard', description: 'Access to main dashboard', enabled: true },
        { id: 'my-tasks', name: 'My Tasks', description: 'Full task management', enabled: true },
        { id: 'schedules', name: 'My Schedules', description: 'Full schedule management', enabled: true },
        { id: 'inbox', name: 'Inbox', description: 'Full messaging access', enabled: true },
        { id: 'files', name: 'Files', description: 'Full file system access', enabled: true },
        { id: 'projects', name: 'Projects', description: 'Full project management', enabled: true },
        { id: 'cost-contracts', name: 'Cost & Contracts', description: 'Full financial management', enabled: true },
        { id: 'finance', name: 'Finance', description: 'Full financial control', enabled: true },
        { id: 'sales', name: 'Sales', description: 'Full sales management', enabled: true },
        { id: 'settings', name: 'Settings', description: 'Full system configuration', enabled: true },
        { id: 'user-management', name: 'User Management', description: 'Manage all users', enabled: true },
        { id: 'support', name: 'Help Center', description: 'Access to support resources', enabled: true },
      ],
      projectPermissions: [
        { id: 'insights', name: 'Dashboard', description: 'Full project dashboard control', enabled: true },
        { id: 'tasks', name: 'Tasks', description: 'Full project task control', enabled: true },
        { id: 'files', name: 'Files', description: 'Full project file control', enabled: true },
        { id: 'schedule', name: 'Schedule', description: 'Full schedule control', enabled: true },
        { id: 'cost', name: 'Cost & Contracts', description: 'Full financial control', enabled: true },
        { id: 'team', name: 'Team', description: 'Full team management', enabled: true },
        { id: 'digital-twin', name: 'Digital Twin', description: 'Full digital twin control', enabled: true },
        { id: 'digital-objects', name: 'Digital Objects', description: 'Full digital objects control', enabled: true },
      ]
    },
    {
      id: 'viewer',
      name: 'Client',
      description: 'Read-only access to view content without modification rights',
      icon: Eye,
      enabled: false,
      level: 'low',
      companyPermissions: [
        { id: 'home', name: 'Home Dashboard', description: 'View main dashboard', enabled: true },
        { id: 'my-tasks', name: 'My Tasks', description: 'View assigned tasks only', enabled: true },
        { id: 'schedules', name: 'My Schedules', description: 'View schedules only', enabled: true },
        { id: 'files', name: 'Files', description: 'View files only', enabled: true },
        { id: 'projects', name: 'Projects', description: 'View projects only', enabled: true },
        { id: 'support', name: 'Help Center', description: 'Access to support resources', enabled: true },
      ],
      projectPermissions: [
        { id: 'insights', name: 'Dashboard', description: 'View project dashboard only', enabled: true },
        { id: 'tasks', name: 'Tasks', description: 'View tasks only', enabled: true },
        { id: 'files', name: 'Files', description: 'View project files only', enabled: true },
        { id: 'schedule', name: 'Schedule', description: 'View schedule only', enabled: true },
        { id: 'team', name: 'Team', description: 'View team members only', enabled: true },
        { id: 'digital-twin', name: 'Digital Twin', description: 'View digital twin only', enabled: false },
        { id: 'digital-objects', name: 'Digital Objects', description: 'View digital objects only', enabled: false },
        { id: 'cost', name: 'Cost & Contracts', description: 'No access to financial data', enabled: false },
      ]
    }
  ]);

  const toggleRole = (roleId: string) => {
    setRoles(prev => prev.map(role => 
      role.id === roleId 
        ? { ...role, enabled: !role.enabled }
        : role
    ));
  };

  const toggleRoleExpansion = (roleId: string) => {
    setExpandedRoles(prev => ({
      ...prev,
      [roleId]: !prev[roleId]
    }));
  };

  const togglePermission = (roleId: string, section: 'company' | 'project', permissionId: string) => {
    setRoles(prev => prev.map(role => {
      if (role.id === roleId) {
        const permissionsKey = section === 'company' ? 'companyPermissions' : 'projectPermissions';
        return {
          ...role,
          [permissionsKey]: role[permissionsKey].map(permission =>
            permission.id === permissionId 
              ? { ...permission, enabled: !permission.enabled }
              : permission
          )
        };
      }
      return role;
    }));
  };

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case 'low': return 'secondary';
      case 'medium': return 'default';
      case 'high': return 'destructive';
      default: return 'secondary';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'low': return 'Basic';
      case 'medium': return 'Elevated';
      case 'high': return 'Critical';
      default: return 'Basic';
    }
  };

  const getPermissionIcon = (permissionId: string) => {
    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
      'home': Home,
      'my-tasks': Calendar,
      'schedules': Calendar,
      'inbox': Mail,
      'files': File,
      'projects': Briefcase,
      'cost-contracts': DollarSign,
      'finance': TrendingUp,
      'sales': TrendingUp,
      'settings': Settings,
      'support': HelpCircle,
      'user-management': Users,
      'insights': BarChart3,
      'tasks': CheckSquare,
      'schedule': Calendar,
      'cost': DollarSign,
      'team': Users,
      'digital-twin': Box,
      'digital-objects': Box,
    };
    
    return iconMap[permissionId] || Eye;
  };

  const handleSavePermissions = async () => {
    setIsSaving(true);
    try {
      // Here you would typically save to your permission database
      // For now, we'll simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Permissions Saved",
        description: "All role permissions have been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save permissions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="backdrop-blur-sm bg-white/60 border-white/30">
      <CardHeader className="pb-4 md:pb-6">
        <CardTitle className="text-lg md:text-xl flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Role Management
        </CardTitle>
        <CardDescription className="text-sm md:text-base">
          Configure role permissions and access levels for company and project sections
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {roles.map((role, index) => (
          <div key={role.id} className="border border-white/20 rounded-lg bg-white/20 backdrop-blur-sm">
            {/* Role Header */}
            <div className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 p-2 rounded-md bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <role.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {role.name}
                      </h4>
                      <Badge 
                        variant={getLevelBadgeVariant(role.level)}
                        className="text-xs px-2 py-0.5"
                      >
                        {getLevelText(role.level)}
                      </Badge>
                    </div>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {role.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {role.enabled ? 'Enabled' : 'Disabled'}
                    </p>
                    <div className={`w-2 h-2 rounded-full ${
                      role.enabled ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  </div>
                  <Switch
                    checked={role.enabled}
                    onCheckedChange={() => toggleRole(role.id)}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
              </div>
              
              {/* Expand/Collapse Trigger */}
              <Collapsible open={expandedRoles[role.id]} onOpenChange={() => toggleRoleExpansion(role.id)}>
                <CollapsibleTrigger className="w-full mt-3 p-2 rounded-md hover:bg-white/20 transition-colors">
                  <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {expandedRoles[role.id] ? (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Hide Permissions
                      </>
                    ) : (
                      <>
                        <ChevronRight className="w-4 h-4" />
                        Show Permissions
                      </>
                    )}
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="mt-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Company Permissions */}
                    <div className="space-y-3">
                      <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        Company Sections
                      </h5>
                      <div className="space-y-2">
                        {role.companyPermissions.map((permission) => {
                          const PermissionIcon = getPermissionIcon(permission.id);
                          return (
                            <div
                              key={permission.id}
                              className="flex items-center space-x-3 p-2 rounded-md hover:bg-white/20 transition-colors"
                            >
                              <Checkbox
                                id={`${role.id}-company-${permission.id}`}
                                checked={permission.enabled}
                                onCheckedChange={() => togglePermission(role.id, 'company', permission.id)}
                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                              />
                              <PermissionIcon className="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <label
                                  htmlFor={`${role.id}-company-${permission.id}`}
                                  className="text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                                >
                                  {permission.name}
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {permission.description}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Project Permissions */}
                    <div className="space-y-3">
                      <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <Box className="w-4 h-4" />
                        Project Sections
                      </h5>
                      <div className="space-y-2">
                        {role.projectPermissions.map((permission) => {
                          const PermissionIcon = getPermissionIcon(permission.id);
                          return (
                            <div
                              key={permission.id}
                              className="flex items-center space-x-3 p-2 rounded-md hover:bg-white/20 transition-colors"
                            >
                              <Checkbox
                                id={`${role.id}-project-${permission.id}`}
                                checked={permission.enabled}
                                onCheckedChange={() => togglePermission(role.id, 'project', permission.id)}
                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                              />
                              <PermissionIcon className="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <label
                                  htmlFor={`${role.id}-project-${permission.id}`}
                                  className="text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                                >
                                  {permission.name}
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {permission.description}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        ))}
        
        <div className="flex justify-end mb-6">
          <Button 
            onClick={handleSavePermissions}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Permissions'}
          </Button>
        </div>

        <div className="mt-6 p-4 rounded-lg bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-700/50">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                Security Notice
              </h5>
              <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                Changes to role permissions will affect user access across the platform. 
                Only enable permissions that are necessary for your organization's security requirements.
                Click "Show Permissions" under each role to configure specific access rights.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};