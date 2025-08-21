import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Shield, Plus, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useActiveBusiness } from '@/hooks/useActiveBusiness';
import { RequirePerm } from './PermissionGuard';
import { useToast } from '@/hooks/use-toast';
import { PERMISSIONS } from '@/hooks/useUserPermissions';

interface Role {
  id: string;
  name: string;
  description: string;
  is_default: boolean;
  business_id: string;
  permissions: string[];
}

interface Permission {
  key: string;
  name: string;
  description: string;
  category: string;
}

const DEFAULT_PERMISSIONS: Permission[] = [
  // Members
  { key: 'members.view', name: 'View Members', description: 'View team members list', category: 'Members' },
  { key: 'members.invite', name: 'Invite Members', description: 'Send invitations to new members', category: 'Members' },
  { key: 'members.update_roles', name: 'Update Member Roles', description: 'Change member roles', category: 'Members' },
  { key: 'members.remove', name: 'Remove Members', description: 'Remove members from business', category: 'Members' },
  
  // Projects
  { key: 'projects.view', name: 'View Projects', description: 'View projects list', category: 'Projects' },
  { key: 'projects.create', name: 'Create Projects', description: 'Create new projects', category: 'Projects' },
  { key: 'projects.update', name: 'Update Projects', description: 'Edit project details', category: 'Projects' },
  { key: 'projects.delete', name: 'Delete Projects', description: 'Delete projects', category: 'Projects' },
  
  // Business
  { key: 'business.settings', name: 'Business Settings', description: 'Manage business settings', category: 'Business' },
  { key: 'business.billing', name: 'Billing Management', description: 'Manage billing and subscriptions', category: 'Business' },
  
  // Roles
  { key: 'roles.view', name: 'View Roles', description: 'View roles and permissions', category: 'Roles' },
  { key: 'roles.manage', name: 'Manage Roles', description: 'Create and modify roles', category: 'Roles' },
];

export const RolesPermissionsManagement: React.FC = () => {
  const { activeBusinessId } = useActiveBusiness();
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions] = useState<Permission[]>(DEFAULT_PERMISSIONS);
  const [loading, setLoading] = useState(true);
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '' });
  const [updatingPermission, setUpdatingPermission] = useState<string | null>(null);

  const loadRoles = async () => {
    if (!activeBusinessId) return;
    
    setLoading(true);
    try {
      // Load existing roles from company_members to see what roles are in use
      const { data: memberRoles, error } = await supabase
        .from('company_members')
        .select('role')
        .eq('company_id', activeBusinessId);

      if (error) throw error;

      const uniqueRoles = [...new Set(memberRoles.map(m => m.role))];
      
      // For now, create mock role data with permissions
      const mockRoles: Role[] = uniqueRoles.map(roleName => ({
        id: roleName,
        name: roleName.charAt(0).toUpperCase() + roleName.slice(1),
        description: `${roleName} role with default permissions`,
        is_default: ['owner', 'admin', 'member'].includes(roleName),
        business_id: activeBusinessId,
        permissions: getRolePermissions(roleName)
      }));

      setRoles(mockRoles);
    } catch (error) {
      console.error('Failed to load roles:', error);
      toast({
        title: "Error",
        description: "Failed to load roles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRolePermissions = (role: string): string[] => {
    switch (role.toLowerCase()) {
      case 'owner':
        return permissions.map(p => p.key); // All permissions
      case 'admin':
        return permissions.filter(p => !p.key.includes('billing')).map(p => p.key);
      case 'member':
        return permissions.filter(p => p.key.includes('view') || p.key === 'projects.create').map(p => p.key);
      default:
        return [];
    }
  };

  const togglePermission = async (roleId: string, permissionKey: string, granted: boolean) => {
    setUpdatingPermission(`${roleId}-${permissionKey}`);
    try {
      // Update role permissions
      const role = roles.find(r => r.id === roleId);
      if (!role) return;

      const updatedPermissions = granted 
        ? [...role.permissions, permissionKey]
        : role.permissions.filter(p => p !== permissionKey);

      setRoles(prev => prev.map(r => 
        r.id === roleId 
          ? { ...r, permissions: updatedPermissions }
          : r
      ));

      // Here you would update the database with role permissions
      // For now, just show success message
      toast({
        title: "Success",
        description: `Permission ${granted ? 'granted' : 'revoked'} for ${role.name}`,
      });

    } catch (error) {
      console.error('Failed to update permission:', error);
      toast({
        title: "Error",
        description: "Failed to update permission",
        variant: "destructive",
      });
    } finally {
      setUpdatingPermission(null);
    }
  };

  const createRole = async () => {
    if (!newRole.name.trim()) {
      toast({
        title: "Error",
        description: "Role name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const roleData: Role = {
        id: newRole.name.toLowerCase().replace(/\s+/g, '_'),
        name: newRole.name.trim(),
        description: newRole.description.trim(),
        is_default: false,
        business_id: activeBusinessId!,
        permissions: []
      };

      setRoles(prev => [...prev, roleData]);
      
      toast({
        title: "Success",
        description: `Role "${roleData.name}" created successfully`,
      });

      setNewRole({ name: '', description: '' });
      setShowCreateRole(false);

    } catch (error) {
      console.error('Failed to create role:', error);
      toast({
        title: "Error",
        description: "Failed to create role",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadRoles();
  }, [activeBusinessId]);

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Roles & Permissions</h1>
          <p className="text-muted-foreground">
            Manage roles and their permissions for your business
          </p>
        </div>
        <RequirePerm permission="roles.manage">
          <Button onClick={() => setShowCreateRole(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Role
          </Button>
        </RequirePerm>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading roles...</div>
      ) : (
        <div className="space-y-6">
          {/* Roles Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Roles ({roles.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {roles.map((role) => (
                  <div key={role.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{role.name}</h3>
                      {role.is_default && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {role.description}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      {role.permissions.length} permissions
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Permissions Matrix */}
          <RequirePerm 
            permission="roles.view"
            fallback={
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">
                    You don't have permission to view role permissions
                  </p>
                </CardContent>
              </Card>
            }
          >
            <Card>
              <CardHeader>
                <CardTitle>Permissions Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                    <div key={category}>
                      <h3 className="font-medium mb-3">{category}</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Permission</TableHead>
                            {roles.map(role => (
                              <TableHead key={role.id} className="text-center">
                                {role.name}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {categoryPermissions.map(permission => (
                            <TableRow key={permission.key}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{permission.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {permission.description}
                                  </div>
                                </div>
                              </TableCell>
                              {roles.map(role => {
                                const hasPermission = role.permissions.includes(permission.key);
                                const canEdit = role.name.toLowerCase() !== 'owner'; // Owner always has all permissions
                                
                                return (
                                  <TableCell key={role.id} className="text-center">
                                    <RequirePerm 
                                      permission="roles.manage"
                                      fallback={
                                        <Badge variant={hasPermission ? 'default' : 'outline'}>
                                          {hasPermission ? 'Yes' : 'No'}
                                        </Badge>
                                      }
                                    >
                                      <Switch
                                        checked={hasPermission}
                                        disabled={!canEdit || updatingPermission === `${role.id}-${permission.key}`}
                                        onCheckedChange={(checked) => 
                                          togglePermission(role.id, permission.key, checked)
                                        }
                                      />
                                    </RequirePerm>
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </RequirePerm>
        </div>
      )}

      {/* Create Role Dialog */}
      <Dialog open={showCreateRole} onOpenChange={setShowCreateRole}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Create a custom role for your business with specific permissions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="roleName">Role Name *</Label>
              <Input
                id="roleName"
                value={newRole.name}
                onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter role name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="roleDescription">Description</Label>
              <Textarea
                id="roleDescription"
                value={newRole.description}
                onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this role can do..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateRole(false)}
            >
              Cancel
            </Button>
            <Button onClick={createRole}>
              Create Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};