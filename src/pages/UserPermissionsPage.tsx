import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserDetails } from '@/hooks/useUserDetails';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Crown, Shield, User, Eye, Edit, X, 
         Building2, CheckSquare, FileText, DollarSign, Calendar, 
         Package, AlertTriangle, ShoppingCart, Archive, FileCheck, 
         MessageCircle, Users, Clock, BarChart3, UserCheck, Settings, 
         Map, TrendingUp, ChevronDown, Save } from 'lucide-react';
import { toast } from 'sonner';
import { PageShell } from '@/components/layout/PageShell';
import { supabase } from '@/integrations/supabase/client';

interface BusinessModule {
  id: string;
  name: string;
  description: string;
  accessLevel: 'no_access' | 'can_view' | 'can_edit';
  subModules?: {
    id: string;
    name: string;
    description: string;
    accessLevel: 'no_access' | 'can_view' | 'can_edit';
  }[];
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
  const navigate = useNavigate();
  const { userData, loading: userLoading, error } = useUserDetails(userId || '', companyId || '');
  const { permissions, loading: permissionsLoading, hasSubModuleAccess, refetch: refetchPermissions } = useUserPermissions(companyId || '', userId || '');
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [permissionChanges, setPermissionChanges] = useState<Record<string, 'no_access' | 'can_view' | 'can_edit'>>({});
  const [isSaving, setIsSaving] = useState(false);
  
  // Rate settings state
  const [hourlyRate, setHourlyRate] = useState<string>('');
  const [dailyRate, setDailyRate] = useState<string>('');
  const [rateType, setRateType] = useState<'hourly' | 'daily'>('hourly');
  const [originalRateData, setOriginalRateData] = useState<{ rate_type: string; rate_amount: number } | null>(null);
  const [rateChanged, setRateChanged] = useState(false);

  const loading = userLoading || permissionsLoading;

  // Load existing rate data
  useEffect(() => {
    const loadUserRate = async () => {
      if (!userId || !companyId) return;

      try {
        const { data, error } = await supabase
          .from('user_rates')
          .select('*')
          .eq('user_id', userId)
          .eq('company_id', companyId)
          .maybeSingle();

        if (error) {
          console.error('Error loading user rate:', error);
          return;
        }

        if (data) {
          setOriginalRateData({
            rate_type: data.rate_type,
            rate_amount: data.rate_amount
          });
          setRateType(data.rate_type as 'hourly' | 'daily');
          if (data.rate_type === 'hourly') {
            setHourlyRate(data.rate_amount.toString());
          } else {
            setDailyRate(data.rate_amount.toString());
          }
        }
      } catch (error) {
        console.error('Error loading user rate:', error);
      }
    };

    loadUserRate();
  }, [userId, companyId]);

  // Track rate changes
  useEffect(() => {
    const currentAmount = rateType === 'hourly' ? hourlyRate : dailyRate;
    const hasChanged = originalRateData 
      ? (originalRateData.rate_type !== rateType || originalRateData.rate_amount.toString() !== currentAmount)
      : (currentAmount !== '' && parseFloat(currentAmount) > 0);
    
    setRateChanged(hasChanged);
  }, [rateType, hourlyRate, dailyRate, originalRateData]);

  // Show error toast if there's an error
  React.useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Business modules aligned with database schema and actual functionality
  const businessModules = useMemo(() => {
    if (!userData) return [];
    
    // Helper function to get effective access level (stored permission or role-based default)
    const getEffectiveAccessLevel = (moduleId: string, subModuleId: string, roleBasedLevel: 'no_access' | 'can_view' | 'can_edit') => {
      // Check if there are any pending changes
      if (permissionChanges[subModuleId]) {
        return permissionChanges[subModuleId];
      }
      
      // Check stored permissions
      const storedLevel = hasSubModuleAccess(moduleId, subModuleId);
      if (storedLevel !== 'can_view' || permissions.length > 0) {
        return storedLevel;
      }
      
      // Fall back to role-based level
      return roleBasedLevel;
    };
    
    return [
      {
        id: 'business_map',
        name: 'Business Map',
        description: 'Dashboard overview and business intelligence',
        icon: 'Map',
        accessLevel: getEffectiveAccessLevel('business_map', 'business_map', getAccessLevel(userData.role, ['owner', 'admin', 'manager', 'team_member'])),
        subModules: [
          {
            id: 'business_map',
            name: 'Business Map',
            description: 'Dashboard overview and business intelligence',
            accessLevel: getEffectiveAccessLevel('business_map', 'business_map', getAccessLevel(userData.role, ['owner', 'admin', 'manager', 'team_member']))
          }
        ]
      },
      {
        id: 'projects',
        name: 'Projects',
        description: 'Manage construction projects, timelines, and resources',
        icon: 'Building2',
        accessLevel: getEffectiveAccessLevel('projects', 'dashboard', getAccessLevel(userData.role, ['owner', 'admin', 'team_member', 'manager'])), // Use first submodule for main level
        subModules: [
          {
            id: 'dashboard',
            name: 'Dashboard',
            description: 'Project overview and key metrics',
            accessLevel: getEffectiveAccessLevel('projects', 'dashboard', getAccessLevel(userData.role, ['owner', 'admin', 'team_member', 'manager']))
          },
          {
            id: 'bim',
            name: 'BIM',
            description: 'Building Information Modeling',
            accessLevel: getEffectiveAccessLevel('projects', 'bim', getAccessLevel(userData.role, ['owner', 'admin', 'manager']))
          },
          {
            id: 'cost',
            name: 'Cost',
            description: 'Project cost management and tracking',
            accessLevel: getEffectiveAccessLevel('projects', 'cost', getAccessLevel(userData.role, ['owner', 'admin', 'manager']))
          },
          {
            id: 'qa_qc',
            name: 'QA/QC',
            description: 'Quality assurance and quality control',
            accessLevel: getEffectiveAccessLevel('projects', 'qa_qc', getAccessLevel(userData.role, ['owner', 'admin', 'manager', 'team_member']))
          },
          {
            id: 'project_docs',
            name: 'Project Docs',
            description: 'Project documents and files',
            accessLevel: getEffectiveAccessLevel('projects', 'project_docs', getAccessLevel(userData.role, ['owner', 'admin', 'manager', 'team_member']))
          },
          {
            id: 'project_links',
            name: 'Project Links',
            description: 'External links and references',
            accessLevel: getEffectiveAccessLevel('projects', 'project_links', getAccessLevel(userData.role, ['owner', 'admin', 'manager', 'team_member']))
          },
          {
            id: 'specification',
            name: 'Specification',
            description: 'Project specifications and requirements',
            accessLevel: getEffectiveAccessLevel('projects', 'specification', getAccessLevel(userData.role, ['owner', 'admin', 'manager']))
          },
          {
            id: 'gallery',
            name: 'Gallery',
            description: 'Project images and media',
            accessLevel: getEffectiveAccessLevel('projects', 'gallery', getAccessLevel(userData.role, ['owner', 'admin', 'manager', 'team_member']))
          },
          {
            id: 'task',
            name: 'Task',
            description: 'Task management and assignments',
            accessLevel: getEffectiveAccessLevel('projects', 'task', getAccessLevel(userData.role, ['owner', 'admin', 'manager', 'team_member']))
          },
          {
            id: 'team',
            name: 'Team',
            description: 'Team management and collaboration',
            accessLevel: getEffectiveAccessLevel('projects', 'team', getAccessLevel(userData.role, ['owner', 'admin', 'manager']))
          },
          {
            id: 'procurement',
            name: 'Procurement',
            description: 'Procurement and purchasing management',
            accessLevel: getEffectiveAccessLevel('projects', 'procurement', getAccessLevel(userData.role, ['owner', 'admin', 'manager']))
          },
          {
            id: 'contracts',
            name: 'Contracts',
            description: 'Contract management and administration',
            accessLevel: getEffectiveAccessLevel('projects', 'contracts', getAccessLevel(userData.role, ['owner', 'admin']))
          },
          {
            id: 'settings',
            name: 'Settings',
            description: 'Project configuration and settings',
            accessLevel: getEffectiveAccessLevel('projects', 'settings', getAccessLevel(userData.role, ['owner', 'admin']))
          },
          {
            id: 'create_project',
            name: 'Create Project',
            description: 'Create new projects',
            accessLevel: getEffectiveAccessLevel('projects', 'create_project', getAccessLevel(userData.role, ['owner', 'admin']))
          },
          {
            id: 'edit_project',
            name: 'Edit Project',
            description: 'Edit existing projects',
            accessLevel: getEffectiveAccessLevel('projects', 'edit_project', getAccessLevel(userData.role, ['owner', 'admin', 'manager']))
          },
          {
            id: 'delete_project',
            name: 'Delete Project',
            description: 'Delete projects',
            accessLevel: getEffectiveAccessLevel('projects', 'delete_project', getAccessLevel(userData.role, ['owner', 'admin']))
          }
        ]
      },
      {
        id: 'sales',
        name: 'Sales',
        description: 'Lead management and customer relationship management',
        icon: 'TrendingUp',
        accessLevel: getEffectiveAccessLevel('sales', 'leads', getAccessLevel(userData.role, ['owner', 'admin', 'manager'])),
        subModules: [
          {
            id: 'leads',
            name: 'Leads',
            description: 'Manage sales leads and opportunities',
            accessLevel: getEffectiveAccessLevel('sales', 'leads', getAccessLevel(userData.role, ['owner', 'admin', 'manager']))
          },
          {
            id: 'crm',
            name: 'CRM',
            description: 'Customer relationship management',
            accessLevel: getEffectiveAccessLevel('sales', 'crm', getAccessLevel(userData.role, ['owner', 'admin', 'manager']))
          }
        ]
      },
      {
        id: 'finance',
        name: 'Finance',
        description: 'Invoicing, estimates, costs, and financial reporting',
        icon: 'DollarSign',
        accessLevel: getEffectiveAccessLevel('finance', 'invoicing', getAccessLevel(userData.role, ['owner', 'admin'])),
        subModules: [
          {
            id: 'invoicing',
            name: 'Invoicing',
            description: 'Create and manage invoices',
            accessLevel: getEffectiveAccessLevel('finance', 'invoicing', getAccessLevel(userData.role, ['owner', 'admin']))
          },
          {
            id: 'estimates',
            name: 'Estimates',
            description: 'Project cost estimation',
            accessLevel: getEffectiveAccessLevel('finance', 'estimates', getAccessLevel(userData.role, ['owner', 'admin']))
          },
          {
            id: 'reporting',
            name: 'Financial Reporting',
            description: 'Financial analysis and reports',
            accessLevel: getEffectiveAccessLevel('finance', 'reporting', getAccessLevel(userData.role, ['owner']))
          }
        ]
      },
      {
        id: 'stakeholders',
        name: 'Stakeholders',
        description: 'Manage vendors, clients, and business relationships',
        icon: 'Users',
        accessLevel: getEffectiveAccessLevel('stakeholders', 'clients', getAccessLevel(userData.role, ['owner', 'admin', 'manager'])),
        subModules: [
          {
            id: 'clients',
            name: 'Clients',
            description: 'Manage client relationships',
            accessLevel: getEffectiveAccessLevel('stakeholders', 'clients', getAccessLevel(userData.role, ['owner', 'admin', 'manager']))
          },
          {
            id: 'vendors',
            name: 'Vendors',
            description: 'Manage vendor relationships',
            accessLevel: getEffectiveAccessLevel('stakeholders', 'vendors', getAccessLevel(userData.role, ['owner', 'admin']))
          }
        ]
      }
    ];
  }, [userData, permissions, permissionChanges, hasSubModuleAccess]);

  // Settings feature
  const otherFeatures = useMemo(() => {
    if (!userData) return [];
    
    const getEffectiveAccessLevel = (moduleId: string, subModuleId: string, roleBasedLevel: 'no_access' | 'can_view' | 'can_edit') => {
      if (permissionChanges[subModuleId]) {
        return permissionChanges[subModuleId];
      }
      
      const storedLevel = hasSubModuleAccess(moduleId, subModuleId);
      if (storedLevel !== 'can_view' || permissions.length > 0) {
        return storedLevel;
      }
      
      return roleBasedLevel;
    };

    return [
      {
        id: 'settings',
        name: 'Settings',
        description: 'Application configuration and preferences',
        icon: 'Settings',
        accessLevel: getEffectiveAccessLevel('settings', 'general', getAccessLevel(userData.role, ['owner', 'admin'])),
        subModules: [
          {
            id: 'general',
            name: 'General Settings',
            description: 'Basic application settings',
            accessLevel: getEffectiveAccessLevel('settings', 'general', getAccessLevel(userData.role, ['owner', 'admin']))
          }
        ]
      }
    ];
  }, [userData, permissions, permissionChanges, hasSubModuleAccess]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

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

  const handleSubModulePermissionChange = (subModuleId: string, newLevel: 'no_access' | 'can_view' | 'can_edit') => {
    // Track the change locally
    setPermissionChanges(prev => ({
      ...prev,
      [subModuleId]: newLevel
    }));
    
    toast.success(`Submodule access will be updated to ${getAccessText(newLevel)} when saved`);
  };

  const savePermissions = async () => {
    if (!userId || !companyId) {
      toast.error('Missing user or company information');
      return;
    }

    const hasPermissionChanges = Object.keys(permissionChanges).length > 0;
    const hasRateChanges = rateChanged;

    if (!hasPermissionChanges && !hasRateChanges) {
      toast.error('No changes to save');
      return;
    }

    setIsSaving(true);
    try {
      // Save permission changes
      if (hasPermissionChanges) {
        for (const [subModuleId, accessLevel] of Object.entries(permissionChanges)) {
          // Find the module that contains this submodule
          let moduleId = '';
          
          // Search in business modules
          businessModules.forEach(module => {
            if (module.subModules?.some(sub => sub.id === subModuleId)) {
              moduleId = module.id;
            }
          });
          
          // Also search in other features if not found
          if (!moduleId) {
            otherFeatures.forEach(feature => {
              if (feature.subModules?.some(sub => sub.id === subModuleId)) {
                moduleId = feature.id;
              }
            });
          }

          // Use the RPC function (cast to any to bypass TypeScript type issue)
          const { error } = await (supabase as any).rpc('handle_user_permission_upsert', {
            p_user_id: userId,
            p_company_id: companyId,
            p_module_id: moduleId,
            p_sub_module_id: subModuleId,
            p_access_level: accessLevel
          });

          if (error) {
            console.error('Error saving permission:', error);
            throw error;
          }
        }
      }

      // Save rate changes
      if (hasRateChanges) {
        const currentAmount = rateType === 'hourly' ? hourlyRate : dailyRate;
        const rateAmount = parseFloat(currentAmount) || 0;

        const { error: rateError } = await supabase
          .from('user_rates')
          .upsert({
            user_id: userId,
            company_id: companyId,
            rate_type: rateType,
            rate_amount: rateAmount,
            currency: 'AUD',
            updated_by: (await supabase.auth.getUser()).data.user?.id
          }, {
            onConflict: 'user_id,company_id'
          });

        if (rateError) {
          console.error('Error saving rate:', rateError);
          throw rateError;
        }

        // Update original rate data
        setOriginalRateData({
          rate_type: rateType,
          rate_amount: rateAmount
        });
        setRateChanged(false);
      }

      // Clear the permission changes after successful save
      setPermissionChanges({});
      
      // Refetch permissions to get the updated data
      if (hasPermissionChanges) {
        await refetchPermissions();
      }
      
      const changeTypes = [];
      if (hasPermissionChanges) changeTypes.push('permissions');
      if (hasRateChanges) changeTypes.push('rates');
      
      toast.success(`${changeTypes.join(' and ')} saved successfully`.replace(/^./, str => str.toUpperCase()));
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const hasUnsavedChanges = Object.keys(permissionChanges).length > 0 || rateChanged;

  if (loading) {
    return (
      <PageShell>
        <div className="h-screen bg-background overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/?page=settings&section=teams')}
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
        <div className="h-screen bg-background overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="icon"  
              onClick={() => navigate('/?page=settings&section=teams')}
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
      <div className="h-screen bg-background overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6">
          {/* Compact Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"  
                onClick={() => navigate('/?page=settings&section=teams')}
                className="glass button-ghost h-10 w-10"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="font-inter text-xl font-bold text-foreground">User Permissions</h1>
                <p className="text-muted-foreground text-xs">Manage access levels for business modules</p>
              </div>
            </div>
            
            <Button
              onClick={savePermissions}
              disabled={!hasUnsavedChanges || isSaving}
              className="flex items-center gap-2"
              variant={hasUnsavedChanges ? "default" : "outline"}
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Permissions'}
            </Button>
          </div>

          {/* Compact User Info & Rate Card */}
          <Card className="glass-card mb-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-6">
                {/* User Profile Section */}
                <div className="flex items-center gap-3 flex-1">
                  <Avatar className="w-14 h-14 border-2 border-background shadow-sm">
                    <AvatarImage src={userData.avatar} alt={userData.name} />
                    <AvatarFallback className="text-base font-bold bg-primary/10 text-primary">
                      {userData.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h2 className="font-inter text-base font-semibold text-foreground truncate">{userData.name}</h2>
                      <Badge variant={getRoleBadgeVariant(userData.role)} className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5">
                        {getRoleIcon(userData.role)}
                        {userData.role.charAt(0).toUpperCase() + userData.role.slice(1).replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-xs truncate">{userData.email}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-inter mt-0.5">
                      <span className="font-medium">Member since March 2024</span>
                    </div>
                  </div>
                </div>

                {/* Rate Settings Section */}
                <div className="flex items-center gap-4 pl-6 border-l border-border/30">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="rate-type" className="text-xs font-semibold text-foreground whitespace-nowrap">
                      Rate Type
                    </Label>
                    <Select value={rateType} onValueChange={(value: 'hourly' | 'daily') => setRateType(value)}>
                      <SelectTrigger id="rate-type" className="w-28 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Label htmlFor="rate-amount" className="text-xs font-semibold text-foreground whitespace-nowrap">
                      {rateType === 'hourly' ? 'Hourly Rate' : 'Daily Rate'}
                    </Label>
                    <div className="relative w-36">
                      <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                      <Input
                        id="rate-amount"
                        type="number"
                        placeholder="0.00"
                        value={rateType === 'hourly' ? hourlyRate : dailyRate}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow empty or valid numbers with up to 2 decimal places
                          if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                            if (rateType === 'hourly') {
                              setHourlyRate(value);
                            } else {
                              setDailyRate(value);
                            }
                          }
                        }}
                        onBlur={(e) => {
                          // Format to 2 decimal places on blur if there's a value
                          const value = e.target.value;
                          if (value && !isNaN(parseFloat(value))) {
                            const formatted = parseFloat(value).toFixed(2);
                            if (rateType === 'hourly') {
                              setHourlyRate(formatted);
                            } else {
                              setDailyRate(formatted);
                            }
                          }
                        }}
                        className="h-8 pl-7 pr-12 text-xs"
                        step="0.01"
                        min="0"
                        max="9999.99"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-medium text-muted-foreground pointer-events-none">
                        AUD
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Modules */}
          <div className="space-y-3">
            <div className="space-y-0.5">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                BUSINESS MODULES
              </div>
              <div className="flex items-center justify-between">
                <h3 className="font-inter text-base font-semibold text-foreground">Module Access Control</h3>
                <div className="text-xs text-muted-foreground">
                  {businessModules.filter(m => m.accessLevel === 'can_edit').length} Full Access • {' '}
                  {businessModules.filter(m => m.accessLevel === 'can_view').length} View Only • {' '} 
                  {businessModules.filter(m => m.accessLevel === 'no_access').length} No Access
                </div>
              </div>
            </div>
            
            <div className="grid gap-2">
              {businessModules.map((module) => (
                <Collapsible
                  key={module.id}
                  open={expandedModules.has(module.id)}
                  onOpenChange={() => toggleModule(module.id)}
                >
                  <Card className="glass-card">
                    <CollapsibleTrigger asChild>
                      <CardContent className="p-4 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-card border">
                            {getModuleIcon(module.icon)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-inter font-semibold text-foreground">{module.name}</h4>
                              <Badge 
                                variant={getAccessBadgeVariant(module.accessLevel)}
                                className="font-inter font-medium text-xs"
                              >
                                {getAccessText(module.accessLevel)}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground text-sm body-md">{module.description}</p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {getAccessIcon(module.accessLevel)}
                            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${
                              expandedModules.has(module.id) ? 'rotate-180' : ''
                            }`} />
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="px-4 pb-4">
                        <div className="ml-11 space-y-2 border-l border-border pl-4">
                          {module.subModules?.map((subModule) => (
                            <div key={subModule.id} className="flex items-center gap-3 py-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                  <h5 className="font-inter font-medium text-foreground text-sm">{subModule.name}</h5>
                                </div>
                                <p className="text-muted-foreground text-xs">{subModule.description}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {getAccessIcon(permissionChanges[subModule.id] || subModule.accessLevel)}
                                <Select 
                                  value={permissionChanges[subModule.id] || subModule.accessLevel} 
                                  onValueChange={(value: 'no_access' | 'can_view' | 'can_edit') => 
                                    handleSubModulePermissionChange(subModule.id, value)
                                  }
                                >
                                  <SelectTrigger className="w-32 h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-popover">
                                    <SelectItem value="no_access">No Access</SelectItem>
                                    <SelectItem value="can_view">View Only</SelectItem>
                                    <SelectItem value="can_edit">Full Access</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
            </div>
          </div>

          {/* Additional Features */}
          <div className="space-y-3 mt-6">
            <div className="space-y-0.5">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                ADDITIONAL FEATURES
              </div>
              <div className="flex items-center justify-between">
                <h3 className="font-inter text-base font-semibold text-foreground">Extended Capabilities</h3>
                <div className="text-xs text-muted-foreground">
                  {otherFeatures.filter(m => m.accessLevel === 'can_edit').length} Full Access • {' '}
                  {otherFeatures.filter(m => m.accessLevel === 'can_view').length} View Only • {' '} 
                  {otherFeatures.filter(m => m.accessLevel === 'no_access').length} No Access
                </div>
              </div>
            </div>
            
            <div className="grid gap-2">
              {otherFeatures.map((feature) => (
                <Collapsible
                  key={feature.id}
                  open={expandedModules.has(feature.id)}
                  onOpenChange={() => toggleModule(feature.id)}
                >
                  <Card className="glass-card">
                    <CollapsibleTrigger asChild>
                      <CardContent className="p-4 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-card border">
                            {getModuleIcon(feature.icon)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-inter font-semibold text-foreground">{feature.name}</h4>
                              <Badge 
                                variant={getAccessBadgeVariant(feature.accessLevel)}
                                className="font-inter font-medium text-xs"
                              >
                                {getAccessText(feature.accessLevel)}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground text-sm body-md">{feature.description}</p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {getAccessIcon(feature.accessLevel)}
                            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${
                              expandedModules.has(feature.id) ? 'rotate-180' : ''
                            }`} />
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="px-4 pb-4">
                        <div className="ml-11 space-y-2 border-l border-border pl-4">
                          {feature.subModules?.map((subModule) => (
                            <div key={subModule.id} className="flex items-center gap-3 py-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                  <h5 className="font-inter font-medium text-foreground text-sm">{subModule.name}</h5>
                                </div>
                                <p className="text-muted-foreground text-xs">{subModule.description}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {getAccessIcon(permissionChanges[subModule.id] || subModule.accessLevel)}
                                <Select 
                                  value={permissionChanges[subModule.id] || subModule.accessLevel} 
                                  onValueChange={(value: 'no_access' | 'can_view' | 'can_edit') => 
                                    handleSubModulePermissionChange(subModule.id, value)
                                  }
                                >
                                  <SelectTrigger className="w-32 h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-popover">
                                    <SelectItem value="no_access">No Access</SelectItem>
                                    <SelectItem value="can_view">View Only</SelectItem>
                                    <SelectItem value="can_edit">Full Access</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
            </div>
          </div>

          <div className="mt-6 p-4 bg-accent/50 rounded-xl glass border">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-primary/10 mt-0.5">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="font-inter font-semibold text-foreground text-sm mb-1.5">Permission Management & Module Visibility</h4>
                <div className="space-y-1.5 text-xs text-muted-foreground leading-relaxed body-md">
                  <p>
                    <strong>How it works:</strong> When you set permissions for a user, it controls what they see in their interface:
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 ml-3">
                    <li><strong>No Access:</strong> The module is completely hidden from the user's navigation ribbon</li>
                    <li><strong>View Only:</strong> The module appears but with read-only functionality</li>
                    <li><strong>Full Access:</strong> The module appears with all features enabled</li>
                  </ul>
                  <p className="mt-2">
                    For example, if you set "Business Map" to "No Access", that user will not see the Business Map 
                    module in their interface at all. This ensures users only see the tools they're authorized to use.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
};