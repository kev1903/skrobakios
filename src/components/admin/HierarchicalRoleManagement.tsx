import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';
import { UserRole } from '@/hooks/useUserRole';
import { HierarchicalUser } from '@/types/hierarchicalUser';
import { toast } from '@/hooks/use-toast';

interface HierarchicalRoleManagementProps {
  user: HierarchicalUser;
  onAddRole: (userId: string, role: UserRole) => Promise<{ success: boolean; error?: any }>;
  onRemoveRole: (userId: string, role: UserRole) => Promise<{ success: boolean; error?: any }>;
}

const roleHierarchy = {
  superadmin: { level: 5, label: 'Super Admin', variant: 'destructive' as const },
  business_admin: { level: 4, label: 'Business Admin', variant: 'default' as const },
  project_admin: { level: 3, label: 'Project Admin', variant: 'secondary' as const },
  user: { level: 2, label: 'User', variant: 'outline' as const },
  client: { level: 1, label: 'Client', variant: 'outline' as const }
};

export const HierarchicalRoleManagement: React.FC<HierarchicalRoleManagementProps> = ({
  user,
  onAddRole,
  onRemoveRole
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddRole = async () => {
    if (user.app_roles.includes(selectedRole)) {
      toast({
        title: 'Role Already Assigned',
        description: `User already has the ${roleHierarchy[selectedRole].label} role.`,
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await onAddRole(user.user_id, selectedRole);
      if (result.success) {
        toast({
          title: 'Role Added',
          description: `Successfully added ${roleHierarchy[selectedRole].label} role to ${user.first_name} ${user.last_name}.`
        });
        setIsAddDialogOpen(false);
        setSelectedRole('user');
      } else {
        toast({
          title: 'Failed to Add Role',
          description: result.error?.message || 'An error occurred while adding the role.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveRole = async (role: UserRole) => {
    if (user.app_roles.length === 1) {
      toast({
        title: 'Cannot Remove Role',
        description: 'User must have at least one role.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await onRemoveRole(user.user_id, role);
      if (result.success) {
        toast({
          title: 'Role Removed',
          description: `Successfully removed ${roleHierarchy[role].label} role from ${user.first_name} ${user.last_name}.`
        });
      } else {
        toast({
          title: 'Failed to Remove Role',
          description: result.error?.message || 'An error occurred while removing the role.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const availableRoles = Object.keys(roleHierarchy).filter(role => 
    !user.app_roles.includes(role as UserRole)
  ) as UserRole[];

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {user.app_roles.map(role => (
          <div key={role} className="flex items-center gap-1">
            <Badge variant={roleHierarchy[role].variant}>
              {roleHierarchy[role].label}
              {role === user.app_role && <span className="ml-1 text-xs">(Primary)</span>}
            </Badge>
            {user.app_roles.length > 1 && user.can_manage_roles && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => handleRemoveRole(role)}
                disabled={isLoading}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {availableRoles.length > 0 && user.can_manage_roles && (
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Plus className="h-3 w-3 mr-1" />
              Add Role
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                Add Role to {user.first_name} {user.last_name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Role</label>
                <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map(role => (
                      <SelectItem key={role} value={role}>
                        {roleHierarchy[role].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddRole}
                  disabled={isLoading}
                >
                  {isLoading ? 'Adding...' : 'Add Role'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};