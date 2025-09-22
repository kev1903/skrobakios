import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Crown, Shield, User, Eye, Edit, X } from 'lucide-react';
import { toast } from 'sonner';
import { PageShell } from '@/components/layout/PageShell';

interface BusinessModule {
  id: string;
  name: string;
  description: string;
  accessLevel: 'no_access' | 'can_view' | 'can_edit';
}

interface UserData {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'team_member' | 'viewer' | 'manager' | 'supplier' | 'sub_contractor' | 'consultant' | 'client';
}

// Helper functions moved outside component for better performance
const getAccessLevel = (userRole: string, allowedRoles: string[]): 'no_access' | 'can_view' | 'can_edit' => {
  if (!allowedRoles.includes(userRole)) {
    return 'no_access';
  }
  
  // Owners and admins typically have edit access, others have view access
  if (userRole === 'owner' || userRole === 'admin') {
    return 'can_edit';
  }
  
  return 'can_view';
};

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'owner':
      return 'default';
    case 'admin':
      return 'secondary';
    case 'team_member':
      return 'outline';
    case 'viewer':
      return 'outline';
    default:
      return 'outline';
  }
};

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'owner':
      return <Crown className="w-3 h-3" />;
    case 'admin':
      return <Shield className="w-3 h-3" />;
    default:
      return <User className="w-3 h-3" />;
  }
};

const getAccessIcon = (accessLevel: string) => {
  switch (accessLevel) {
    case 'can_edit':
      return <Edit className="w-4 h-4 text-green-600" />;
    case 'can_view':
      return <Eye className="w-4 h-4 text-blue-600" />;
    default:
      return <X className="w-4 h-4 text-red-600" />;
  }
};

const getAccessText = (accessLevel: string) => {
  switch (accessLevel) {
    case 'can_edit':
      return 'Full Access';
    case 'can_view':
      return 'View Only';
    default:
      return 'No Access';
  }
};

const getAccessBadgeVariant = (accessLevel: string) => {
  switch (accessLevel) {
    case 'can_edit':
      return 'default';
    case 'can_view':
      return 'secondary';
    default:
      return 'destructive';
  }
};

export const UserPermissionsPage = () => {
  const { userId, companyId } = useParams<{ userId: string; companyId: string }>();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId && companyId) {
      fetchUserData();
    }
  }, [userId, companyId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);

      // Optimized: Run both queries in parallel for faster loading
      const [membershipResult, profileResult] = await Promise.all([
        supabase
          .from('company_members')
          .select('role')
          .eq('user_id', userId)
          .eq('company_id', companyId)
          .maybeSingle(),
        supabase
          .from('profiles')
          .select('user_id, email, first_name, last_name, avatar_url')
          .eq('user_id', userId)
          .maybeSingle()
      ]);

      const { data: membershipData, error: membershipError } = membershipResult;
      const { data: profileData, error: profileError } = profileResult;

      if (membershipError) {
        console.error('Error fetching membership data:', membershipError);
        toast.error('Failed to load user membership');
        return;
      }

      if (profileError) {
        console.error('Error fetching profile data:', profileError);
        toast.error('Failed to load user profile');
        return;
      }

      if (!membershipData) {
        toast.error('User is not a member of this company');
        return;
      }

      if (!profileData) {
        toast.error('User profile not found');
        return;
      }

      const user: UserData = {
        id: profileData.user_id,
        email: profileData.email || 'No email provided',
        name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || 'Unknown User',
        avatar: profileData.avatar_url,
        role: membershipData.role as 'owner' | 'admin' | 'manager' | 'supplier' | 'sub_contractor' | 'consultant' | 'client' | 'team_member' | 'viewer'
      };

      setUserData(user);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load user permissions');
    } finally {
      setLoading(false);
    }
  };

  // Memoized business modules for better performance
  const businessModules = useMemo(() => {
    if (!userData) return [];
    
    return [
      {
        id: 'projects',
        name: 'Project Management',
        description: 'Manage construction projects, timelines, and resources',
        accessLevel: getAccessLevel(userData.role, ['owner', 'admin', 'team_member'])
      },
      {
        id: 'tasks',
        name: 'Task Management',
        description: 'Create, assign, and track project tasks',
        accessLevel: getAccessLevel(userData.role, ['owner', 'admin', 'team_member'])
      },
      {
        id: 'documents',
        name: 'Document Management',
        description: 'Upload, organize, and share project documents',
        accessLevel: getAccessLevel(userData.role, ['owner', 'admin', 'team_member'])
      },
      {
        id: 'qaqc',
        name: 'Quality Assurance',
        description: 'Manage quality control processes and inspections',
        accessLevel: getAccessLevel(userData.role, ['owner', 'admin'])
      },
      {
        id: 'finance',
        name: 'Financial Management',
        description: 'Handle invoicing, estimates, and financial reporting',
        accessLevel: getAccessLevel(userData.role, ['owner', 'admin'])
      },
      {
        id: 'team',
        name: 'Team Management',
        description: 'Manage team members, roles, and permissions',
        accessLevel: getAccessLevel(userData.role, ['owner'])
      },
      {
        id: 'analytics',
        name: 'Analytics & Reporting',
        description: 'View project analytics and generate reports',
        accessLevel: getAccessLevel(userData.role, ['owner', 'admin', 'team_member'])
      },
      {
        id: 'settings',
        name: 'Company Settings',
        description: 'Configure company-wide settings and preferences',
        accessLevel: getAccessLevel(userData.role, ['owner'])
      }
    ];
  }, [userData]);

  const handlePermissionChange = (moduleId: string) => {
    // For demo purposes - in a real app this would update the database
    const module = businessModules.find(m => m.id === moduleId);
    if (module) {
      const levels: ('no_access' | 'can_view' | 'can_edit')[] = ['no_access', 'can_view', 'can_edit'];
      const currentIndex = levels.indexOf(module.accessLevel);
      const nextIndex = (currentIndex + 1) % levels.length;
      const newLevel = levels[nextIndex];
      
      toast.success(`${module.name} access updated to ${getAccessText(newLevel)}`);
    }
  };

  if (loading) {
    return (
      <PageShell>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-6 pb-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                window.location.href = '/?page=settings&section=teams';
              }}
              className="backdrop-blur-xl bg-white/80"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
              <div className="h-8 w-64 bg-muted animate-pulse rounded" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <Card key={i} className="backdrop-blur-xl bg-white/80">
                  <CardContent className="p-6">
                    <div className="h-16 bg-muted animate-pulse rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  if (!userData) {
    return (
      <PageShell>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-6 pb-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                window.location.href = '/?page=settings&section=teams';
              }}
              className="backdrop-blur-xl bg-white/80"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
              <h1 className="text-2xl font-bold text-foreground">User Not Found</h1>
            </div>
            <Card className="backdrop-blur-xl bg-white/80">
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">The requested user could not be found or you don't have permission to view their details.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="icon"  
              onClick={() => {
                window.location.href = '/?page=settings&section=teams';
              }}
              className="backdrop-blur-xl bg-white/80 border-border/50"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">User Permissions</h1>
          </div>

          {/* User Info Card */}
          <Card className="backdrop-blur-xl bg-white/80 border-border/50 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={userData.avatar} alt={userData.name} />
                  <AvatarFallback className="text-lg font-semibold">
                    {userData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-semibold text-foreground">{userData.name}</h2>
                    <Badge variant={getRoleBadgeVariant(userData.role)} className="flex items-center gap-1">
                      {getRoleIcon(userData.role)}
                      {userData.role.charAt(0).toUpperCase() + userData.role.slice(1).replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{userData.email}</p>
                </div>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Business Modules */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Business Module Access</h3>
            {businessModules.map((module) => (
              <Card 
                key={module.id} 
                className="backdrop-blur-xl bg-white/80 border-border/50 cursor-pointer transition-all hover:shadow-md"
                onClick={() => handlePermissionChange(module.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getAccessIcon(module.accessLevel)}
                        <h4 className="font-semibold text-foreground">{module.name}</h4>
                        <Badge variant={getAccessBadgeVariant(module.accessLevel)}>
                          {getAccessText(module.accessLevel)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 p-4 bg-muted/50 rounded-lg backdrop-blur-xl">
            <p className="text-sm text-muted-foreground text-center">
              Click on any module to cycle through permission levels: No Access → View Only → Full Access
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
};