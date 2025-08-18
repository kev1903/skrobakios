import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, User } from 'lucide-react';
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
}

const defaultPermissions: Permission[] = [
  { module: 'Business Map', view: false, create: false, edit: false, delete: false, admin: false },
  { module: 'Projects', view: false, create: false, edit: false, delete: false, admin: false },
  { module: 'Sales', view: false, create: false, edit: false, delete: false, admin: false },
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
      switch (role) {
        case 'superadmin':
          return { ...permission, view: true, create: true, edit: true, delete: true, admin: true };
        case 'business_admin':
          return { ...permission, view: true, create: true, edit: true, delete: false, admin: false };
        case 'project_admin':
          return { 
            ...permission, 
            view: true, 
            create: permission.module === 'Projects',
            edit: permission.module === 'Projects',
            delete: false, 
            admin: false 
          };
        case 'user':
          return { 
            ...permission, 
            view: permission.module === 'Projects',
            create: false,
            edit: false,
            delete: false, 
            admin: false 
          };
        default:
          return permission;
      }
    });
    setPermissions(rolePermissions);
  };

  const togglePermission = (moduleIndex: number, permissionType: keyof Omit<Permission, 'module'>) => {
    setPermissions(prev => 
      prev.map((perm, index) => 
        index === moduleIndex 
          ? { ...perm, [permissionType]: !perm[permissionType] }
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="shrink-0"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-semibold">User Details</h1>
      </div>

      {/* User Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar_url} alt={`${user.first_name} ${user.last_name}`} />
              <AvatarFallback>
                <User className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">
                {user.first_name && user.last_name 
                  ? `${user.first_name} ${user.last_name}`
                  : 'No name'
                }
              </h2>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-4">
                <Badge variant="outline">{user.role}</Badge>
                <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                  {user.status}
                </Badge>
                {user.company && (
                  <span className="text-sm text-muted-foreground">{user.company}</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permissions Matrix */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Permissions Matrix</CardTitle>
              <p className="text-muted-foreground mt-2">
                Manage user permissions for different modules
              </p>
            </div>
            <Button onClick={savePermissions}>
              Save Changes
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Module</th>
                  <th className="text-center p-4 font-medium">View</th>
                  <th className="text-center p-4 font-medium">Create</th>
                  <th className="text-center p-4 font-medium">Edit</th>
                  <th className="text-center p-4 font-medium">Delete</th>
                  <th className="text-center p-4 font-medium">Admin</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((permission, index) => (
                  <tr key={permission.module} className="border-b">
                    <td className="p-4 font-medium">{permission.module}</td>
                    <td className="p-4 text-center">
                      <Checkbox
                        checked={permission.view}
                        onCheckedChange={() => togglePermission(index, 'view')}
                      />
                    </td>
                    <td className="p-4 text-center">
                      <Checkbox
                        checked={permission.create}
                        onCheckedChange={() => togglePermission(index, 'create')}
                      />
                    </td>
                    <td className="p-4 text-center">
                      <Checkbox
                        checked={permission.edit}
                        onCheckedChange={() => togglePermission(index, 'edit')}
                      />
                    </td>
                    <td className="p-4 text-center">
                      <Checkbox
                        checked={permission.delete}
                        onCheckedChange={() => togglePermission(index, 'delete')}
                      />
                    </td>
                    <td className="p-4 text-center">
                      <Checkbox
                        checked={permission.admin}
                        onCheckedChange={() => togglePermission(index, 'admin')}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>✓ means permission enabled; ✗ means disabled</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};