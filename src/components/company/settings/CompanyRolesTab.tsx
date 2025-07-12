import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useCompany } from '@/contexts/CompanyContext';
import { 
  Users, 
  Shield, 
  Crown, 
  User,
  ChevronDown,
  ChevronUp,
  Save
} from 'lucide-react';

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

export const CompanyRolesTab = () => {
  const { currentCompany } = useCompany();
  const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [roles, setRoles] = useState<RoleConfig[]>([
    {
      id: 'member',
      name: 'Member',
      description: 'Basic member permissions for accessing company features',
      icon: User,
      enabled: true,
      level: 'low',
      companyPermissions: [
        { id: 'view_company', name: 'View Company Info', description: 'Can view company details', enabled: true },
        { id: 'view_projects', name: 'View Projects', description: 'Can view company projects', enabled: true }
      ],
      projectPermissions: [
        { id: 'view_tasks', name: 'View Tasks', description: 'Can view project tasks', enabled: true },
        { id: 'comment_tasks', name: 'Comment on Tasks', description: 'Can add comments to tasks', enabled: true }
      ]
    },
    {
      id: 'admin',
      name: 'Admin',
      description: 'Administrative permissions for managing company operations',
      icon: Shield,
      enabled: true,
      level: 'high',
      companyPermissions: [
        { id: 'manage_company', name: 'Manage Company', description: 'Can edit company settings', enabled: true },
        { id: 'manage_members', name: 'Manage Members', description: 'Can invite and remove members', enabled: true },
        { id: 'manage_projects', name: 'Manage Projects', description: 'Can create and delete projects', enabled: true }
      ],
      projectPermissions: [
        { id: 'manage_tasks', name: 'Manage Tasks', description: 'Can create, edit, and delete tasks', enabled: true },
        { id: 'assign_tasks', name: 'Assign Tasks', description: 'Can assign tasks to team members', enabled: true }
      ]
    },
    {
      id: 'owner',
      name: 'Owner',
      description: 'Full control over the company and all its resources',
      icon: Crown,
      enabled: true,
      level: 'high',
      companyPermissions: [
        { id: 'full_control', name: 'Full Control', description: 'Complete access to all company features', enabled: true },
        { id: 'billing', name: 'Billing Management', description: 'Can manage billing and subscriptions', enabled: true }
      ],
      projectPermissions: [
        { id: 'full_project_control', name: 'Full Project Control', description: 'Complete access to all project features', enabled: true }
      ]
    }
  ]);

  const toggleRoleExpansion = (roleId: string) => {
    setExpandedRoles(prev => ({
      ...prev,
      [roleId]: !prev[roleId]
    }));
  };

  const handlePermissionToggle = (roleId: string, permissionId: string, isCompanyPermission: boolean) => {
    setRoles(prev => prev.map(role => {
      if (role.id === roleId) {
        if (isCompanyPermission) {
          return {
            ...role,
            companyPermissions: role.companyPermissions.map(perm =>
              perm.id === permissionId ? { ...perm, enabled: !perm.enabled } : perm
            )
          };
        } else {
          return {
            ...role,
            projectPermissions: role.projectPermissions.map(perm =>
              perm.id === permissionId ? { ...perm, enabled: !perm.enabled } : perm
            )
          };
        }
      }
      return role;
    }));
  };

  const handleSaveRoles = async () => {
    setIsSaving(true);
    try {
      // Here you would save to your backend/database
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Success",
        description: "Company role settings have been updated successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update role settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getLevelBadge = (level: string) => {
    const variants = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800', 
      high: 'bg-red-100 text-red-800'
    };
    return <Badge className={variants[level as keyof typeof variants]}>{level}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Company Role Management
          </CardTitle>
          <CardDescription>
            Configure roles and permissions for {currentCompany?.name || 'your company'}. 
            These settings control what team members can do within the company.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {roles.map((role) => {
            const IconComponent = role.icon;
            const isExpanded = expandedRoles[role.id];

            return (
              <Card key={role.id} className="border-slate-200">
                <CardHeader 
                  className="cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => toggleRoleExpansion(role.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <IconComponent className="h-5 w-5 text-slate-600" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{role.name}</h3>
                          {getLevelBadge(role.level)}
                        </div>
                        <p className="text-sm text-slate-500 mt-1">{role.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={role.enabled}
                        onCheckedChange={(checked) => {
                          setRoles(prev => prev.map(r => 
                            r.id === role.id ? { ...r, enabled: checked } : r
                          ));
                        }}
                      />
                      {isExpanded ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      }
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Company Permissions</h4>
                        <div className="space-y-2">
                          {role.companyPermissions.map((permission) => (
                            <div key={permission.id} className="flex items-center justify-between py-2">
                              <div>
                                <div className="text-sm font-medium">{permission.name}</div>
                                <div className="text-xs text-slate-500">{permission.description}</div>
                              </div>
                              <Switch
                                checked={permission.enabled}
                                onCheckedChange={() => handlePermissionToggle(role.id, permission.id, true)}
                                disabled={!role.enabled}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium text-sm mb-2">Project Permissions</h4>
                        <div className="space-y-2">
                          {role.projectPermissions.map((permission) => (
                            <div key={permission.id} className="flex items-center justify-between py-2">
                              <div>
                                <div className="text-sm font-medium">{permission.name}</div>
                                <div className="text-xs text-slate-500">{permission.description}</div>
                              </div>
                              <Switch
                                checked={permission.enabled}
                                onCheckedChange={() => handlePermissionToggle(role.id, permission.id, false)}
                                disabled={!role.enabled}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}

          <div className="flex justify-end pt-4">
            <Button onClick={handleSaveRoles} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Role Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};