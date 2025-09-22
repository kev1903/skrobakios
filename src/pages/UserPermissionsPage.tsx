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
         MessageCircle, Users, Clock, BarChart3, UserCheck, Settings } from 'lucide-react';
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
      return <Edit className="w-4 h-4 text-emerald-600" />;
    case 'can_view':
      return <Eye className="w-4 h-4 text-blue-600" />;
    default:
      return <X className="w-4 h-4 text-red-500" />;
  }
};

const getModuleIcon = (iconName: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    'Building2': <Building2 className="w-5 h-5 text-blue-600" />,
    'CheckSquare': <CheckSquare className="w-5 h-5 text-green-600" />,
    'FileText': <FileText className="w-5 h-5 text-purple-600" />,
    'DollarSign': <DollarSign className="w-5 h-5 text-emerald-600" />,
    'Shield': <Shield className="w-5 h-5 text-orange-600" />,
    'Calendar': <Calendar className="w-5 h-5 text-indigo-600" />,
    'Package': <Package className="w-5 h-5 text-amber-600" />,
    'AlertTriangle': <AlertTriangle className="w-5 h-5 text-red-600" />,
    'ShoppingCart': <ShoppingCart className="w-5 h-5 text-teal-600" />,
    'Archive': <Archive className="w-5 h-5 text-slate-600" />,
    'FileCheck': <FileCheck className="w-5 h-5 text-cyan-600" />,
    'MessageCircle': <MessageCircle className="w-5 h-5 text-pink-600" />,
    'Users': <Users className="w-5 h-5 text-violet-600" />,
    'Clock': <Clock className="w-5 h-5 text-rose-600" />,
    'BarChart3': <BarChart3 className="w-5 h-5 text-blue-700" />,
    'UserCheck': <UserCheck className="w-5 h-5 text-green-700" />,
    'Settings': <Settings className="w-5 h-5 text-gray-600" />
  };
  
  return iconMap[iconName] || <FileText className="w-5 h-5 text-gray-600" />;
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

  // Comprehensive business modules for construction management
  const businessModules = useMemo(() => {
    if (!userData) return [];
    
    return [
      {
        id: 'projects',
        name: 'Project Management',
        description: 'Manage construction projects, timelines, and resources',
        icon: 'Building2',
        accessLevel: getAccessLevel(userData.role, ['owner', 'admin', 'team_member', 'manager'])
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
        id: 'finance',
        name: 'Financial Management',
        description: 'Handle invoicing, estimates, and financial reporting',
        icon: 'DollarSign',
        accessLevel: getAccessLevel(userData.role, ['owner', 'admin'])
      },
      {
        id: 'qaqc',
        name: 'Quality Assurance',
        description: 'Manage quality control processes and inspections',
        icon: 'Shield',
        accessLevel: getAccessLevel(userData.role, ['owner', 'admin', 'manager'])
      },
      {
        id: 'scheduling',
        name: 'Scheduling & Planning',
        description: 'Create and manage project schedules and timelines',
        icon: 'Calendar',
        accessLevel: getAccessLevel(userData.role, ['owner', 'admin', 'manager', 'team_member'])
      },
      {
        id: 'resources',
        name: 'Resource Management',
        description: 'Manage equipment, materials, and workforce allocation',
        icon: 'Package',
        accessLevel: getAccessLevel(userData.role, ['owner', 'admin', 'manager'])
      },
      {
        id: 'safety',
        name: 'Safety Management',
        description: 'Track safety incidents, compliance, and protocols',
        icon: 'AlertTriangle',
        accessLevel: getAccessLevel(userData.role, ['owner', 'admin', 'manager'])
      },
      {
        id: 'procurement',
        name: 'Procurement & Purchasing',
        description: 'Manage vendor relationships and purchase orders',
        icon: 'ShoppingCart',
        accessLevel: getAccessLevel(userData.role, ['owner', 'admin'])
      },
      {
        id: 'inventory',
        name: 'Inventory Management',
        description: 'Track materials, tools, and equipment inventory',
        icon: 'Archive',
        accessLevel: getAccessLevel(userData.role, ['owner', 'admin', 'manager', 'team_member'])
      },
      {
        id: 'compliance',
        name: 'Compliance & Permits',
        description: 'Manage regulatory compliance and permit tracking',
        icon: 'FileCheck',
        accessLevel: getAccessLevel(userData.role, ['owner', 'admin', 'manager'])
      },
      {
        id: 'communications',
        name: 'Communications',
        description: 'Manage client communications and correspondence',
        icon: 'MessageCircle',
        accessLevel: getAccessLevel(userData.role, ['owner', 'admin', 'manager', 'team_member'])
      },
      {
        id: 'crm',
        name: 'Customer Relations',
        description: 'Manage leads, clients, and business relationships',
        icon: 'Users',
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
        name: 'Company Settings',
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

  if (!userData && !loading) {
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-white to-slate-100/50 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="icon"  
              onClick={() => {
                window.location.href = '/?page=settings&section=teams';
              }}
              className="backdrop-blur-xl bg-white/90 border-border/50 hover:bg-white shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">User Permissions</h1>
              <p className="text-muted-foreground mt-1">Manage access levels for business modules</p>
            </div>
          </div>

          {/* User Info Card */}
          <Card className="backdrop-blur-xl bg-white/90 border-border/50 mb-8 shadow-sm">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                  <AvatarImage src={userData.avatar} alt={userData.name} />
                  <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-primary/20 to-primary/10">
                    {userData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h2 className="text-2xl font-bold text-foreground">{userData.name}</h2>
                    <Badge variant={getRoleBadgeVariant(userData.role)} className="flex items-center gap-2 text-sm font-medium px-3 py-1">
                      {getRoleIcon(userData.role)}
                      {userData.role.charAt(0).toUpperCase() + userData.role.slice(1).replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-lg mb-2">{userData.email}</p>
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
              <h3 className="text-xl font-semibold text-foreground">Business Module Access</h3>
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
                  className="backdrop-blur-xl bg-white/90 border-border/50 hover:bg-white/95 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-background/80 border border-border/50">
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
                        <p className="text-muted-foreground leading-relaxed">{module.description}</p>
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

          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-xl backdrop-blur-xl border border-blue-100/50">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-blue-100/50">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Permission Management</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
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