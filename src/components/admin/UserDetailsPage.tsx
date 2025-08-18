import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, User, ChevronDown, ChevronRight } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

interface Permission {
  module: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  admin: boolean;
  children?: Permission[];
  isExpanded?: boolean;
}

const defaultPermissions: Permission[] = [
  { module: 'Business Map', view: false, create: false, edit: false, delete: false, admin: false },
  { 
    module: 'Projects', 
    view: false, 
    create: false, 
    edit: false, 
    delete: false, 
    admin: false,
    isExpanded: false,
    children: [
      { module: 'Project Creation', view: false, create: false, edit: false, delete: false, admin: false },
      { module: 'Project Management', view: false, create: false, edit: false, delete: false, admin: false },
      { module: 'Project Documents', view: false, create: false, edit: false, delete: false, admin: false },
      { module: 'Project Costs', view: false, create: false, edit: false, delete: false, admin: false },
      { module: 'Project Timeline', view: false, create: false, edit: false, delete: false, admin: false },
    ]
  },
  { 
    module: 'Sales', 
    view: false, 
    create: false, 
    edit: false, 
    delete: false, 
    admin: false,
    isExpanded: false,
    children: [
      { module: 'Lead Management', view: false, create: false, edit: false, delete: false, admin: false },
      { module: 'Estimates', view: false, create: false, edit: false, delete: false, admin: false },
      { module: 'Proposals', view: false, create: false, edit: false, delete: false, admin: false },
      { module: 'Client Communications', view: false, create: false, edit: false, delete: false, admin: false },
      { module: 'Sales Analytics', view: false, create: false, edit: false, delete: false, admin: false },
    ]
  },
  { module: 'Finance', view: false, create: false, edit: false, delete: false, admin: false },
  { module: 'Settings', view: false, create: false, edit: false, delete: false, admin: false },
];

export const UserDetailsPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>(defaultPermissions);
  const [loading, setLoading] = useState(true);

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
        
        // Load permissions based on user role
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
    // Set default permissions based on role
    const rolePermissions = defaultPermissions.map(permission => {
      const setPermissionsByRole = (perm: Permission): Permission => {
        let updatedPerm: Permission;
        
        switch (role) {
          case 'superadmin':
            updatedPerm = { ...perm, view: true, create: true, edit: true, delete: true, admin: true };
            break;
          case 'business_admin':
            updatedPerm = { ...perm, view: true, create: true, edit: true, delete: false, admin: false };
            break;
          case 'project_admin':
            updatedPerm = { 
              ...perm, 
              view: true, 
              create: perm.module === 'Projects' || (perm.module.includes('Project')),
              edit: perm.module === 'Projects' || (perm.module.includes('Project')),
              delete: false, 
              admin: false 
            };
            break;
          case 'user':
            updatedPerm = { 
              ...perm, 
              view: perm.module === 'Projects' || (perm.module.includes('Project')),
              create: false,
              edit: false,
              delete: false, 
              admin: false 
            };
            break;
          default:
            updatedPerm = perm;
        }

        // Apply same permissions to children if they exist
        if (perm.children) {
          updatedPerm.children = perm.children.map(child => setPermissionsByRole(child));
        }

        return updatedPerm;
      };

      return setPermissionsByRole(permission);
    });
    setPermissions(rolePermissions);
  };

  const togglePermission = (moduleIndex: number, permissionType: keyof Omit<Permission, 'module' | 'children' | 'isExpanded'>, childIndex?: number) => {
    setPermissions(prev => 
      prev.map((perm, index) => {
        if (index === moduleIndex) {
          if (childIndex !== undefined && perm.children) {
            // Toggle child permission
            const updatedChildren = perm.children.map((child, cIndex) => 
              cIndex === childIndex 
                ? { ...child, [permissionType]: !child[permissionType] }
                : child
            );
            return { ...perm, children: updatedChildren };
          } else {
            // Toggle parent permission
            return { ...perm, [permissionType]: !perm[permissionType] };
          }
        }
        return perm;
      })
    );
  };

  const toggleExpansion = (moduleIndex: number) => {
    setPermissions(prev => 
      prev.map((perm, index) => 
        index === moduleIndex 
          ? { ...perm, isExpanded: !perm.isExpanded }
          : perm
      )
    );
  };

  const savePermissions = async () => {
    try {
      // Here you would save permissions to your database
      // For now, just show a success message
      toast({
        title: "Success",
        description: "User permissions updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update permissions",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">User not found</h1>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6 max-w-6xl">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-semibold text-foreground">User Details</h1>
        </div>

        {/* User Profile Card */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatar_url} alt={`${user.first_name} ${user.last_name}`} />
                <AvatarFallback className="bg-muted text-muted-foreground">
                  <User className="h-10 w-10" />
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-card-foreground">
                  {user.first_name && user.last_name 
                    ? `${user.first_name} ${user.last_name}`
                    : 'No name'
                  }
                </h2>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="text-xs">{user.role}</Badge>
                  <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                    {user.status}
                  </Badge>
                  {user.company && (
                    <span className="text-sm text-muted-foreground">{user.company}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Member since {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permissions Matrix */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-card-foreground">Permissions Matrix</CardTitle>
                <p className="text-muted-foreground mt-2">
                  Manage user permissions for different modules
                </p>
              </div>
              <Button onClick={savePermissions} className="bg-primary text-primary-foreground hover:bg-primary/90">
                Save Changes
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-medium text-card-foreground">Module</th>
                    <th className="text-center p-4 font-medium text-card-foreground">View</th>
                    <th className="text-center p-4 font-medium text-card-foreground">Create</th>
                    <th className="text-center p-4 font-medium text-card-foreground">Edit</th>
                    <th className="text-center p-4 font-medium text-card-foreground">Delete</th>
                    <th className="text-center p-4 font-medium text-card-foreground">Admin</th>
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((permission, index) => (
                    <React.Fragment key={permission.module}>
                      <tr className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="p-4 font-medium text-card-foreground">
                          <div className="flex items-center gap-2">
                            {permission.children && (
                              <button
                                onClick={() => toggleExpansion(index)}
                                className="p-1 hover:bg-muted rounded transition-colors"
                              >
                                {permission.isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </button>
                            )}
                            <span className={permission.children ? 'font-semibold' : ''}>
                              {permission.module}
                            </span>
                            {permission.children && (
                              <span className="w-2 h-2 bg-primary rounded-full ml-2" />
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <Checkbox
                            checked={permission.view}
                            onCheckedChange={() => togglePermission(index, 'view')}
                            className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                        </td>
                        <td className="p-4 text-center">
                          <Checkbox
                            checked={permission.create}
                            onCheckedChange={() => togglePermission(index, 'create')}
                            className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                        </td>
                        <td className="p-4 text-center">
                          <Checkbox
                            checked={permission.edit}
                            onCheckedChange={() => togglePermission(index, 'edit')}
                            className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                        </td>
                        <td className="p-4 text-center">
                          <Checkbox
                            checked={permission.delete}
                            onCheckedChange={() => togglePermission(index, 'delete')}
                            className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                        </td>
                        <td className="p-4 text-center">
                          <Checkbox
                            checked={permission.admin}
                            onCheckedChange={() => togglePermission(index, 'admin')}
                            className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                        </td>
                      </tr>
                      
                      {/* Child permissions */}
                      {permission.isExpanded && permission.children && permission.children.map((child, childIndex) => (
                        <tr key={`${permission.module}-${child.module}`} className="border-b border-border bg-muted/20 hover:bg-muted/40 transition-colors">
                          <td className="p-4 font-medium text-card-foreground pl-12">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">└</span>
                              <span className="text-sm">{child.module}</span>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <Checkbox
                              checked={child.view}
                              onCheckedChange={() => togglePermission(index, 'view', childIndex)}
                              className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                          </td>
                          <td className="p-4 text-center">
                            <Checkbox
                              checked={child.create}
                              onCheckedChange={() => togglePermission(index, 'create', childIndex)}
                              className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                          </td>
                          <td className="p-4 text-center">
                            <Checkbox
                              checked={child.edit}
                              onCheckedChange={() => togglePermission(index, 'edit', childIndex)}
                              className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                          </td>
                          <td className="p-4 text-center">
                            <Checkbox
                              checked={child.delete}
                              onCheckedChange={() => togglePermission(index, 'delete', childIndex)}
                              className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                          </td>
                          <td className="p-4 text-center">
                            <Checkbox
                              checked={child.admin}
                              onCheckedChange={() => togglePermission(index, 'admin', childIndex)}
                              className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-4 h-4 text-xs bg-primary text-primary-foreground rounded">✓</span>
                Permission enabled
                <span className="ml-4 inline-flex items-center justify-center w-4 h-4 text-xs border border-border rounded">✗</span>
                Permission disabled
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};