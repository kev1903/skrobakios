import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Building2, FolderOpen, Shield, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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

interface UserData {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  role: string;
}

export default function UserPermissionsPage() {
  const { userId, companyId } = useParams<{ userId: string; companyId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [businessPermissions, setBusinessPermissions] = useState<Permission[]>([]);
  const [projectMemberships, setProjectMemberships] = useState<ProjectMembership[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId && companyId) {
      fetchUserData();
    }
  }, [userId, companyId]);

  const fetchUserData = async () => {
    if (!userId || !companyId) return;
    
    setLoading(true);
    try {
      // Fetch company membership
      const { data: memberData, error: memberError } = await supabase
        .from('company_members')
        .select('user_id, role')
        .eq('user_id', userId)
        .eq('company_id', companyId)
        .single();

      if (memberError || !memberData) {
        console.error('Error fetching member data:', memberError);
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive",
        });
        return;
      }

      // Fetch user profile separately
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, email, first_name, last_name, avatar_url')
        .eq('user_id', userId)
        .single();

      if (profileError || !profileData) {
        console.error('Error fetching profile data:', profileError);
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive",
        });
        return;
      }

      const userData = {
        user_id: profileData.user_id,
        email: profileData.email,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        avatar_url: profileData.avatar_url,
        role: memberData.role
      };

      setUserData(userData);

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
        .eq('user_id', userId)
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
          granted: ['owner', 'admin', 'manager'].includes(userData.role)
        },
        {
          id: 'manage_team_members',
          name: 'Manage Team Members',
          description: 'Can invite, edit, and remove team members',
          category: 'business',
          granted: ['owner', 'admin'].includes(userData.role)
        },
        {
          id: 'manage_projects',
          name: 'Manage Projects',
          description: 'Can create, edit, and delete projects',
          category: 'business',
          granted: ['owner', 'admin', 'manager'].includes(userData.role)
        },
        {
          id: 'view_financial_data',
          name: 'View Financial Data',
          description: 'Can access costs, budgets, and financial reports',
          category: 'business',
          granted: ['owner', 'admin'].includes(userData.role)
        },
        {
          id: 'manage_stakeholders',
          name: 'Manage Stakeholders',
          description: 'Can add and manage stakeholders and vendors',
          category: 'business',
          granted: ['owner', 'admin', 'manager'].includes(userData.role)
        },
        {
          id: 'view_analytics',
          name: 'View Analytics',
          description: 'Can access business analytics and reports',
          category: 'business',
          granted: ['owner', 'admin'].includes(userData.role)
        }
      ];

      setBusinessPermissions(businessPerms);

    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Error",
        description: "Failed to load user data",
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

  const handleBack = () => {
    navigate('/?page=settings');
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading user permissions...</div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-muted-foreground">User not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Team
        </Button>
      </div>

      {/* User Info Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={userData.avatar_url} />
              <AvatarFallback className="text-lg">
                {userData.first_name?.charAt(0)}{userData.last_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-2xl font-bold">
                {userData.first_name && userData.last_name ? 
                  `${userData.first_name} ${userData.last_name}` : 
                  userData.email || 'Unknown User'}
              </div>
              <div className="text-muted-foreground">
                {userData.email}
              </div>
              <Badge variant={getRoleBadgeVariant(userData.role)} className="mt-2">
                {userData.role.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

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
    </div>
  );
}