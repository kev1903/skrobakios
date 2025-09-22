import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useUserDetails } from '@/hooks/useUserDetails';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Crown, Shield, User, Eye, Edit, X, 
         Building2, CheckSquare, FileText, DollarSign, Calendar, 
         Package, AlertTriangle, ShoppingCart, Archive, FileCheck, 
         MessageCircle, Users, Clock, BarChart3, UserCheck, Settings, 
         Map, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { PageShell } from '@/components/layout/PageShell';

interface BusinessModule {
  id: string;
  name: string;
  description: string;
  accessLevel: 'no_access' | 'can_view' | 'can_edit';
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
      return <Edit className="w-4 h-4 text-success" />;
    case 'can_view':
      return <Eye className="w-4 h-4 text-primary" />;
    default:
      return <X className="w-4 h-4 text-destructive" />;
  }
};

const getModuleIcon = (iconName: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    'Map': <Map className="w-5 h-5 text-primary" />,
    'Building2': <Building2 className="w-5 h-5 text-primary" />,
    'TrendingUp': <TrendingUp className="w-5 h-5 text-success" />,
    'DollarSign': <DollarSign className="w-5 h-5 text-success" />,
    'Users': <Users className="w-5 h-5 text-accent-foreground" />,
    'CheckSquare': <CheckSquare className="w-5 h-5 text-success" />,
    'FileText': <FileText className="w-5 h-5 text-foreground" />,
    'Calendar': <Calendar className="w-5 h-5 text-primary" />,
    'Shield': <Shield className="w-5 h-5 text-warning" />,
    'Package': <Package className="w-5 h-5 text-muted-foreground" />,
    'AlertTriangle': <AlertTriangle className="w-5 h-5 text-destructive" />,
    'ShoppingCart': <ShoppingCart className="w-5 h-5 text-accent-foreground" />,
    'Archive': <Archive className="w-5 h-5 text-muted-foreground" />,
    'FileCheck': <FileCheck className="w-5 h-5 text-success" />,
    'MessageCircle': <MessageCircle className="w-5 h-5 text-accent-foreground" />,
    'Clock': <Clock className="w-5 h-5 text-warning" />,
    'BarChart3': <BarChart3 className="w-5 h-5 text-primary" />,
    'UserCheck': <UserCheck className="w-5 h-5 text-success" />,
    'Settings': <Settings className="w-5 h-5 text-muted-foreground" />
  };
  
  return iconMap[iconName] || <FileText className="w-5 h-5 text-muted-foreground" />;
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
  const { userData, loading, error } = useUserDetails(userId || '', companyId || '');

  // Show error toast if there's an error
  React.useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Business modules aligned with database schema and actual functionality
  const businessModules = useMemo(() => {
    if (!userData) return [];
    
    return [
      {
        id: 'business_map',
        name: 'Business Map',
        description: 'Dashboard overview and business intelligence',
        icon: 'Map',
        accessLevel: getAccessLevel(userData.role, ['owner', 'admin', 'manager', 'team_member'])
      },
      {
        id: 'projects',
        name: 'Projects',
        description: 'Manage construction projects, timelines, and resources',
        icon: 'Building2',
        accessLevel: getAccessLevel(userData.role, ['owner', 'admin', 'team_member', 'manager'])
      },
      {
        id: 'sales',
        name: 'Sales',
        description: 'Lead management and customer relationship management',
        icon: 'TrendingUp',
        accessLevel: getAccessLevel(userData.role, ['owner', 'admin', 'manager'])
      },
      {
        id: 'finance',
        name: 'Finance',
        description: 'Invoicing, estimates, costs, and financial reporting',
        icon: 'DollarSign',
        accessLevel: getAccessLevel(userData.role, ['owner', 'admin'])
      },
      {
        id: 'stakeholders',
        name: 'Stakeholders',
        description: 'Manage vendors, clients, and business relationships',
        icon: 'Users',
        accessLevel: getAccessLevel(userData.role, ['owner', 'admin', 'manager'])
      },
      {
        id: 'tasks',
        name: 'Task Management', 
        description: 'Create, assign, and track project tasks',
        icon: 'CheckSquare',
        accessLevel: getAccessLevel(userData.role, ['owner', 'admin', 'team_member', 'manager'])
      },
      {
        id: 'documents',
        name: 'Document Management',
        description: 'Upload, organize, and share project documents',
        icon: 'FileText',
        accessLevel: getAccessLevel(userData.role, ['owner', 'admin', 'team_member', 'manager'])
      },
      {
        id: 'scheduling',
        name: 'Scheduling & Planning',
        description: 'Create and manage project schedules and timelines',
        icon: 'Calendar',
        accessLevel: getAccessLevel(userData.role, ['owner', 'admin', 'manager', 'team_member'])
      },
      {
        id: 'qaqc',
        name: 'Quality Assurance',
        description: 'Manage quality control processes and inspections',
        icon: 'Shield',
        accessLevel: getAccessLevel(userData.role, ['owner', 'admin', 'manager'])
      },
      {
        id: 'compliance',
        name: 'Compliance & Permits',
        description: 'Manage regulatory compliance and permit tracking',
        icon: 'FileCheck',
        accessLevel: getAccessLevel(userData.role, ['owner', 'admin', 'manager'])
      },
      {
        id: 'timetracking',
        name: 'Time Tracking',
        description: 'Track work hours and project time allocation',
        icon: 'Clock',
        accessLevel: getAccessLevel(userData.role, ['owner', 'admin', 'manager', 'team_member'])
      },
      {
        id: 'analytics',
        name: 'Analytics & Reporting',
        description: 'View project analytics and generate reports',
        icon: 'BarChart3',
        accessLevel: getAccessLevel(userData.role, ['owner', 'admin', 'manager'])
      },
      {
        id: 'team',
        name: 'Team Management',
        description: 'Manage team members, roles, and permissions',
        icon: 'UserCheck',
        accessLevel: getAccessLevel(userData.role, ['owner', 'admin'])
      },
      {
        id: 'settings',
        name: 'Settings',
        description: 'Configure company-wide settings and preferences',
        icon: 'Settings',
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
        <div className="min-h-screen bg-background p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                window.location.href = '/?page=settings&section=teams';
              }}
              className="glass button-ghost"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
              <div className="h-8 w-64 bg-muted animate-pulse rounded" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <Card key={i} className="glass-card">
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

  if (!userData && !loading) {
    return (
      <PageShell>
        <div className="min-h-screen bg-background p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                window.location.href = '/?page=settings&section=teams';
              }}
              className="glass button-ghost"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
              <h1 className="heading-md text-foreground">User Not Found</h1>
            </div>
            <Card className="glass-card">
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">{error || 'The requested user could not be found or you don\'t have permission to view their details.'}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="icon"  
              onClick={() => {
                window.location.href = '/?page=settings&section=teams';
              }}
              className="glass button-ghost interactive-minimal"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="heading-lg text-foreground">User Permissions</h1>
              <p className="text-muted-foreground mt-1 body-md">Manage access levels for business modules</p>
            </div>
          </div>

          {/* User Info Card */}
          <Card className="glass-card mb-8 interactive-minimal">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <Avatar className="w-20 h-20 border-4 border-background shadow-lg">
                  <AvatarImage src={userData.avatar} alt={userData.name} />
                  <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                    {userData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h2 className="heading-md text-foreground">{userData.name}</h2>
                    <Badge variant={getRoleBadgeVariant(userData.role)} className="flex items-center gap-2 text-sm font-medium px-3 py-1">
                      {getRoleIcon(userData.role)}
                      {userData.role.charAt(0).toUpperCase() + userData.role.slice(1).replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-lg mb-2 body-md">{userData.email}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Member since</span>
                    <span className="font-medium">March 2024</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Modules */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="heading-md text-foreground">Business Module Access</h3>
              <div className="text-sm text-muted-foreground">
                {businessModules.filter(m => m.accessLevel === 'can_edit').length} Full Access • {' '}
                {businessModules.filter(m => m.accessLevel === 'can_view').length} View Only • {' '} 
                {businessModules.filter(m => m.accessLevel === 'no_access').length} No Access
              </div>
            </div>
            
            <div className="grid gap-4">
              {businessModules.map((module) => (
                <Card 
                  key={module.id} 
                  className="glass-card interactive-minimal"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-card border">
                        {getModuleIcon(module.icon)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-foreground text-lg">{module.name}</h4>
                          <Badge 
                            variant={getAccessBadgeVariant(module.accessLevel)}
                            className="font-medium"
                          >
                            {getAccessText(module.accessLevel)}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground leading-relaxed body-md">{module.description}</p>
                      </div>
                      
                      <div className="flex items-center">
                        {getAccessIcon(module.accessLevel)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="mt-8 p-6 bg-accent/50 rounded-xl glass border">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Permission Management</h4>
                <p className="text-sm text-muted-foreground leading-relaxed body-md">
                  Access levels are automatically determined by the user's role within the company. 
                  Contact your system administrator to modify user permissions or change role assignments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
};