import React, { useState, useEffect } from 'react';
import { Shield, Plus, Settings, UserCog, Edit, Trash2, RefreshCw, ChevronDown, ChevronRight, Building, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { fetchRoleData, getRoleStats, type RoleData, type PermissionSection } from '@/services/roleService';

interface RoleManagementProps {
  onNavigate: (page: string) => void;
}

export const RoleManagement = ({ onNavigate }: RoleManagementProps) => {
  const { isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({
    totalRoles: 0,
    totalUsers: 0,
    customRoles: 0,
    systemRoles: 0
  });

  const loadRoleData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [rolesData, roleStats] = await Promise.all([
        fetchRoleData(),
        getRoleStats()
      ]);
      
      setRoles(rolesData);
      setStats(roleStats);
    } catch (err) {
      console.error('Error loading role data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load role data');
      toast({
        title: "Error",
        description: "Failed to load role data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      loadRoleData();
    }
  }, [isSuperAdmin]);

  const handleRefresh = () => {
    loadRoleData();
  };

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
      description: "Role deletion functionality will be implemented here.",
    });
  };

  const toggleRoleExpansion = (roleId: string) => {
    setExpandedRoles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(roleId)) {
        newSet.delete(roleId);
      } else {
        newSet.add(roleId);
      }
      return newSet;
    });
  };

  const handlePermissionToggle = (roleId: string, section: 'company' | 'project', permissionId: string, enabled: boolean) => {
    // Update the role permissions
    setRoles(prevRoles => 
      prevRoles.map(role => 
        role.id === roleId 
          ? {
              ...role,
              permissions: {
                ...role.permissions,
                [section]: role.permissions[section].map(perm => 
                  perm.id === permissionId 
                    ? { ...perm, enabled } 
                    : perm
                )
              }
            }
          : role
      )
    );

    toast({
      title: "Permission Updated",
      description: `${enabled ? 'Enabled' : 'Disabled'} permission for ${roleId}`,
    });
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
        <div className="flex items-center space-x-2">
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          <Button onClick={handleCreateRole} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Create Role</span>
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="backdrop-blur-sm bg-red-50/60 border-red-200/30">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-600">
              <Shield className="w-5 h-5" />
              <div>
                <p className="font-medium">Error loading role data</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Role Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="backdrop-blur-sm bg-white/60 border-white/30">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-slate-500">Total Roles</p>
                <p className="text-2xl font-bold">{loading ? '...' : stats.totalRoles}</p>
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
                <p className="text-2xl font-bold">{loading ? '...' : stats.totalUsers}</p>
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
                <p className="text-2xl font-bold">{loading ? '...' : stats.customRoles}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-sm bg-white/60 border-white/30">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-slate-500">System Roles</p>
                <p className="text-2xl font-bold">{loading ? '...' : stats.systemRoles}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roles List */}
      {loading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="backdrop-blur-sm bg-white/60 border-white/30">
              <CardHeader>
                <div className="animate-pulse">
                  <div className="h-6 bg-slate-200 rounded mb-2 w-1/3"></div>
                  <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="animate-pulse">
                  <div className="h-4 bg-slate-200 rounded mb-2 w-1/4"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-slate-200 rounded w-20"></div>
                    <div className="h-6 bg-slate-200 rounded w-24"></div>
                    <div className="h-6 bg-slate-200 rounded w-16"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : roles.length === 0 ? (
        <Card className="backdrop-blur-sm bg-white/60 border-white/30">
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">No Roles Found</h3>
            <p className="text-slate-500 mb-4">There are no roles configured in the system.</p>
            <Button onClick={handleCreateRole} className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Create First Role</span>
            </Button>
          </CardContent>
        </Card>
      ) : (
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
                <Collapsible 
                  open={expandedRoles.has(role.id)} 
                  onOpenChange={() => toggleRoleExpansion(role.id)}
                >
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-between p-0 h-auto font-normal"
                    >
                      <span className="text-sm font-medium text-slate-700">View Permissions</span>
                      {expandedRoles.has(role.id) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="space-y-4 mt-4">
                    {/* Company Permissions */}
                    <div className="border rounded-lg p-4 bg-slate-50/50">
                      <div className="flex items-center space-x-2 mb-3">
                        <Building className="w-4 h-4 text-blue-600" />
                        <h5 className="font-medium text-slate-700">Company Permissions</h5>
                      </div>
                      <div className="space-y-2">
                        {role.permissions.company.map((permission) => (
                          <div key={permission.id} className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">{permission.name}</span>
                            <Switch
                              checked={permission.enabled}
                              onCheckedChange={(enabled) => 
                                handlePermissionToggle(role.id, 'company', permission.id, enabled)
                              }
                              disabled={role.system}
                            />
                          </div>
                        ))}
                        {role.permissions.company.length === 0 && (
                          <p className="text-sm text-slate-400 italic">No company permissions assigned</p>
                        )}
                      </div>
                    </div>

                    {/* Project Permissions */}
                    <div className="border rounded-lg p-4 bg-slate-50/50">
                      <div className="flex items-center space-x-2 mb-3">
                        <FolderOpen className="w-4 h-4 text-green-600" />
                        <h5 className="font-medium text-slate-700">Project Permissions</h5>
                      </div>
                      <div className="space-y-2">
                        {role.permissions.project.map((permission) => (
                          <div key={permission.id} className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">{permission.name}</span>
                            <Switch
                              checked={permission.enabled}
                              onCheckedChange={(enabled) => 
                                handlePermissionToggle(role.id, 'project', permission.id, enabled)
                              }
                              disabled={role.system}
                            />
                          </div>
                        ))}
                        {role.permissions.project.length === 0 && (
                          <p className="text-sm text-slate-400 italic">No project permissions assigned</p>
                        )}
                      </div>
                    </div>

                    {role.system && (
                      <div className="text-xs text-slate-500 italic bg-slate-100 p-2 rounded">
                        System roles have protected permissions that cannot be modified.
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};