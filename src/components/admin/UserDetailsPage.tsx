import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, User, Shield, Settings, Save, Mail, Building2, Calendar, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { defaultPermissions } from "@/constants/permissions";
import { Permission } from '@/types/permission';
import { useMenuBarSpacing } from "@/hooks/useMenuBarSpacing";

interface UserDetails {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
  company?: string;
  role: string;
  status: string;
  created_at: string;
}

interface UserPermission {
  id: string;
  name: string;
  description: string;
  category: string;
  granted: boolean;
}

export const UserDetailsPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { spacingClasses, minHeightClasses } = useMenuBarSpacing();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      const { data, error } = await supabase.rpc('get_manageable_users_for_user', {
        requesting_user_id: (await supabase.auth.getUser()).data.user?.id
      });

      if (error) throw error;

      const foundUser = data?.find((u: any) => u.user_id === userId);
      if (foundUser) {
        setUser({
          id: foundUser.user_id,
          first_name: foundUser.first_name || '',
          last_name: foundUser.last_name || '',
          email: foundUser.email,
          avatar_url: foundUser.avatar_url,
          company: foundUser.company,
          role: foundUser.app_role,
          status: foundUser.status,
          created_at: foundUser.created_at
        });
        
        // Convert permissions to the new format and load based on role
        loadPermissionsForRole(foundUser.app_role);
      }
    } catch (error: any) {
      console.error('Error fetching user details:', error);
      toast({
        title: "Error",
        description: "Failed to load user details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPermissionsForRole = (role: string) => {
    const permissions: UserPermission[] = defaultPermissions.map(permission => {
      let granted = false;
      
      // Set default permissions based on role
      switch (role) {
        case 'superadmin':
          granted = true;
          break;
        case 'business_admin':
          granted = permission.category === 'Company Permissions' || 
                   ['view_platform_analytics', 'view_all_companies', 'view_all_projects'].includes(permission.id);
          break;
        case 'project_admin':
          granted = ['projects', 'tasks', 'files', 'dashboard'].includes(permission.id);
          break;
        case 'user':
          granted = ['projects', 'dashboard'].includes(permission.id);
          break;
        default:
          granted = false;
      }

      return {
        id: permission.id,
        name: permission.name,
        description: permission.description,
        category: permission.category,
        granted
      };
    });

    setUserPermissions(permissions);
  };

  const togglePermission = (permissionId: string) => {
    setUserPermissions(prev => 
      prev.map(perm => 
        perm.id === permissionId 
          ? { ...perm, granted: !perm.granted }
          : perm
      )
    );
    setHasUnsavedChanges(true);
  };

  const savePermissions = async () => {
    try {
      // Here you would save permissions to your database
      console.log('Saving permissions:', userPermissions);
      
      toast({
        title: "Success",
        description: "User permissions updated successfully"
      });
      setHasUnsavedChanges(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update permissions",
        variant: "destructive"
      });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'superadmin': return 'destructive';
      case 'business_admin': return 'default';
      case 'project_admin': return 'secondary';
      case 'user': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    return status === 'active' 
      ? <CheckCircle2 className="h-4 w-4 text-green-500" />
      : <XCircle className="h-4 w-4 text-red-500" />;
  };

  if (loading) {
    return (
      <div className={`${minHeightClasses} bg-gradient-to-br from-background via-background to-muted/20 ${spacingClasses}`}>
        <div className="container mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-10 bg-muted rounded w-20"></div>
              <div className="h-8 bg-muted rounded w-48"></div>
            </div>
            <div className="grid gap-6">
              <div className="h-48 bg-muted rounded-lg"></div>
              <div className="h-96 bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`${minHeightClasses} bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center ${spacingClasses}`}>
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h1 className="text-2xl font-semibold mb-2">User not found</h1>
            <p className="text-muted-foreground mb-6">The requested user could not be found or you don't have permission to view them.</p>
            <Button onClick={() => navigate(-1)} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const groupedPermissions = userPermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, UserPermission[]>);

  return (
    <div className={`${minHeightClasses} bg-gradient-to-br from-background via-background to-muted/20 ${spacingClasses}`}>
      <div className="container mx-auto p-6 space-y-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="shrink-0 hover:bg-muted"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
              <p className="text-sm text-muted-foreground">Configure user permissions and access levels</p>
            </div>
          </div>
          {hasUnsavedChanges && (
            <Button onClick={savePermissions} className="gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          )}
        </div>

        {/* User Profile Card */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4">
            <CardTitle className="flex items-center gap-2 mb-3 text-lg">
              <Shield className="h-4 w-4" />
              Profile Information
            </CardTitle>
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16 border-2 border-background shadow-lg">
                <AvatarImage src={user.avatar_url} alt={`${user.first_name} ${user.last_name}`} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-sm">
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 space-y-3">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-1">
                    {user.first_name && user.last_name 
                      ? `${user.first_name} ${user.last_name}`
                      : 'No name provided'
                    }
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span>{user.email}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={getRoleBadgeVariant(user.role)} className="gap-1 text-xs">
                      <Shield className="h-3 w-3" />
                      {user.role}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Role</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {getStatusIcon(user.status)}
                      <span className="text-sm font-medium capitalize">{user.status}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Status</span>
                  </div>
                  
                  {user.company && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{user.company}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Member since {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Permissions Matrix */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-4 w-4" />
                  Permissions Matrix
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage user permissions for different modules and features
                </p>
              </div>
              {!hasUnsavedChanges && (
                <Button variant="outline" onClick={savePermissions} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {Object.entries(groupedPermissions).map(([category, permissions]) => (
              <div key={category} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-base text-foreground">{category}</h3>
                  <div className="h-px flex-1 bg-border"></div>
                </div>
                
                <div className="grid gap-2">
                  {permissions.map((permission) => (
                    <div 
                      key={permission.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-md ${
                            permission.granted 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                              : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            {permission.granted ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : (
                              <XCircle className="h-3 w-3" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm text-foreground">{permission.name}</p>
                            <p className="text-xs text-muted-foreground">{permission.description}</p>
                          </div>
                        </div>
                      </div>
                      <Switch
                        checked={permission.granted}
                        onCheckedChange={() => togglePermission(permission.id)}
                        className="ml-3"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {hasUnsavedChanges && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <AlertCircle className="h-3 w-3" />
                  <span className="text-xs font-medium">You have unsaved changes</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};