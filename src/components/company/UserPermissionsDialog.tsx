import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Building2, FolderOpen, Shield, User, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UserPermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: {
    user_id: string;
    email: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
    role: string;
  };
  companyId: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'business' | 'project';
  granted: boolean;
}

interface ProjectMembership {
  project_id: string;
  project_name: string;
  role: string;
  status: string;
}

export function UserPermissionsDialog({ 
  open, 
  onOpenChange, 
  member, 
  companyId 
}: UserPermissionsDialogProps) {
  const [businessPermissions, setBusinessPermissions] = useState<Permission[]>([]);
  const [projectMemberships, setProjectMemberships] = useState<ProjectMembership[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && member.user_id) {
      fetchUserPermissions();
    }
  }, [open, member.user_id]);

  const fetchUserPermissions = async () => {
    setLoading(true);
    try {
      // Fetch project memberships
      const { data: projectData, error: projectError } = await supabase
        .from('project_members')
        .select(`
          project_id,
          role,
          status,
          projects!inner(
            id,
            name,
            company_id
          )
        `)
        .eq('user_id', member.user_id)
        .eq('projects.company_id', companyId);

      if (projectError) {
        console.error('Error fetching project memberships:', projectError);
      } else {
        const memberships = projectData?.map((pm: any) => ({
          project_id: pm.project_id,
          project_name: pm.projects.name,
          role: pm.role,
          status: pm.status
        })) || [];
        setProjectMemberships(memberships);
      }

      // Define business permissions based on company role
      const businessPerms: Permission[] = [
        {
          id: 'view_company_details',
          name: 'View Company Details',
          description: 'Can view company information and settings',
          category: 'business',
          granted: ['owner', 'admin', 'manager'].includes(member.role)
        },
        {
          id: 'manage_team_members',
          name: 'Manage Team Members',
          description: 'Can invite, edit, and remove team members',
          category: 'business',
          granted: ['owner', 'admin'].includes(member.role)
        },
        {
          id: 'manage_projects',
          name: 'Manage Projects',
          description: 'Can create, edit, and delete projects',
          category: 'business',
          granted: ['owner', 'admin', 'manager'].includes(member.role)
        },
        {
          id: 'view_financial_data',
          name: 'View Financial Data',
          description: 'Can access costs, budgets, and financial reports',
          category: 'business',
          granted: ['owner', 'admin'].includes(member.role)
        },
        {
          id: 'manage_stakeholders',
          name: 'Manage Stakeholders',
          description: 'Can add and manage stakeholders and vendors',
          category: 'business',
          granted: ['owner', 'admin', 'manager'].includes(member.role)
        },
        {
          id: 'view_analytics',
          name: 'View Analytics',
          description: 'Can access business analytics and reports',
          category: 'business',
          granted: ['owner', 'admin'].includes(member.role)
        }
      ];

      setBusinessPermissions(businessPerms);

    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast({
        title: "Error",
        description: "Failed to load user permissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'admin':
        return 'secondary';
      case 'manager':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={member.avatar_url} />
              <AvatarFallback>
                {member.first_name?.charAt(0)}{member.last_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-lg font-semibold">
                {member.first_name && member.last_name ? 
                  `${member.first_name} ${member.last_name}` : 
                  member.email || 'Unknown User'}
              </div>
              <div className="text-sm text-muted-foreground font-normal">
                {member.email}
              </div>
            </div>
            <Badge variant={getRoleBadgeVariant(member.role)} className="ml-auto">
              {member.role.replace('_', ' ')}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Manage permissions and view project access for this team member
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Business Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Business Permissions
              </CardTitle>
              <CardDescription>
                Company-level access and capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {businessPermissions.map((permission) => (
                <div key={permission.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="mt-1">
                    {permission.granted ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{permission.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {permission.description}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Project Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Project Access
              </CardTitle>
              <CardDescription>
                Project memberships and roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {projectMemberships.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No project memberships found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {projectMemberships.map((membership) => (
                    <div key={membership.project_id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">
                            {membership.project_name}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Project ID: {membership.project_id}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={getRoleBadgeVariant(membership.role)}>
                            {membership.role}
                          </Badge>
                          <Badge variant={getStatusBadgeVariant(membership.status)}>
                            {membership.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>Permissions are automatically assigned based on company role and project memberships</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}