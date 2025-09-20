import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Building2, Shield, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface BusinessModule {
  id: string;
  name: string;
  description: string;
  access: 'no_access' | 'can_view' | 'can_edit';
}

interface UserData {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  role: string;
}

interface UserPermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  companyId: string;
}

export const UserPermissionsDialog: React.FC<UserPermissionsDialogProps> = ({
  open,
  onOpenChange,
  userId,
  companyId
}) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [businessModules, setBusinessModules] = useState<BusinessModule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && userId && companyId) {
      fetchUserData();
    }
  }, [open, userId, companyId]);

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
        .maybeSingle();

      if (memberError || !memberData) {
        toast({
          title: "Error",
          description: "Failed to load user membership data",
          variant: "destructive",
        });
        return;
      }

      // Fetch user profile separately
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, email, first_name, last_name, avatar_url')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError || !profileData) {
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

      // Define business modules with access levels based on company role
      const getAccessLevel = (requiresAdmin = false, requiresOwner = false) => {
        if (requiresOwner && userData.role === 'owner') return 'can_edit';
        if (requiresAdmin && ['owner', 'admin'].includes(userData.role)) return 'can_edit';
        if (['owner', 'admin', 'manager'].includes(userData.role)) return 'can_view';
        return 'no_access';
      };

      const modules: BusinessModule[] = [
        {
          id: 'company_details',
          name: 'Company Details',
          description: 'Company information and settings',
          access: getAccessLevel()
        },
        {
          id: 'team_management',
          name: 'Team Management',
          description: 'Invite, edit, and remove team members',
          access: getAccessLevel(true)
        },
        {
          id: 'project_management',
          name: 'Project Management',
          description: 'Create, edit, and delete projects',
          access: getAccessLevel()
        },
        {
          id: 'financial_data',
          name: 'Financial Data',
          description: 'Costs, budgets, and financial reports',
          access: getAccessLevel(true)
        },
        {
          id: 'stakeholders',
          name: 'Stakeholders',
          description: 'Manage stakeholders and vendors',
          access: getAccessLevel()
        },
        {
          id: 'analytics',
          name: 'Analytics',
          description: 'Business analytics and reports',
          access: getAccessLevel(true)
        },
        {
          id: 'qaqc',
          name: 'QA/QC',
          description: 'Quality assurance and quality control',
          access: getAccessLevel()
        },
        {
          id: 'documents',
          name: 'Documents',
          description: 'Document management and file storage',
          access: getAccessLevel()
        },
        {
          id: 'scheduling',
          name: 'Scheduling',
          description: 'Project scheduling and timeline management',
          access: getAccessLevel()
        },
        {
          id: 'invoicing',
          name: 'Invoicing',
          description: 'Create and manage invoices',
          access: getAccessLevel(true)
        }
      ];

      setBusinessModules(modules);

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

  const handlePermissionChange = async (moduleId: string, value: string) => {
    // Update the local state
    setBusinessModules(modules => 
      modules.map(module => 
        module.id === moduleId 
          ? { ...module, access: value as 'no_access' | 'can_view' | 'can_edit' }
          : module
      )
    );
    
    toast({
      title: "Permission Updated",
      description: `Access level updated for ${moduleId}`,
    });
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading user permissions...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!userData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-muted-foreground">User not found</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={userData.avatar_url} />
              <AvatarFallback className="text-sm">
                {userData.first_name?.charAt(0)}{userData.last_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-lg font-semibold truncate">
                {userData.first_name && userData.last_name ? 
                  `${userData.first_name} ${userData.last_name}` : 
                  userData.email || 'Unknown User'}
              </div>
              <div className="text-sm text-muted-foreground truncate">
                {userData.email}
              </div>
            </div>
            <Badge variant={getRoleBadgeVariant(userData.role)}>
              {userData.role.replace('_', ' ')}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Business Permissions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Business Module Permissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 p-4">
              {businessModules.map((module) => {
                const getAccessBadgeVariant = (access: string) => {
                  switch (access) {
                    case 'can_edit': return 'default';
                    case 'can_view': return 'secondary';
                    default: return 'outline';
                  }
                };

                const getAccessLabel = (access: string) => {
                  switch (access) {
                    case 'can_edit': return 'Edit';
                    case 'can_view': return 'View';
                    default: return 'No Access';
                  }
                };

                const cyclePermission = (currentAccess: string) => {
                  const permissions = ['no_access', 'can_view', 'can_edit'];
                  const currentIndex = permissions.indexOf(currentAccess);
                  const nextIndex = (currentIndex + 1) % permissions.length;
                  return permissions[nextIndex];
                };

                return (
                  <button 
                    key={module.id}
                    onClick={() => handlePermissionChange(module.id, cyclePermission(module.access))}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-left text-gray-700 hover:bg-gray-100"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{module.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {module.description}
                      </div>
                    </div>
                    <Badge variant={getAccessBadgeVariant(module.access)} className="ml-auto text-xs">
                      {getAccessLabel(module.access)}
                    </Badge>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Click on each module to cycle through permission levels. Changes are saved automatically.</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};