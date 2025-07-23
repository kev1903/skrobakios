import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EditUserRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoleUpdated: () => void;
  user: {
    user_id: string;
    email: string;
    first_name: string;
    last_name: string;
    app_role: string;
    app_roles: string[];
  };
}

export const EditUserRoleDialog: React.FC<EditUserRoleDialogProps> = ({
  open,
  onOpenChange,
  onRoleUpdated,
  user
}) => {
  const [selectedRole, setSelectedRole] = useState(user.app_role);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const roleHierarchy = [
    { value: 'client', label: 'Client', description: 'Limited access to assigned projects only' },
    { value: 'user', label: 'User', description: 'Standard user with basic permissions' },
    { value: 'project_admin', label: 'Project Admin', description: 'Can manage projects and team members' },
    { value: 'business_admin', label: 'Business Admin', description: 'Can manage company-wide operations' },
    { value: 'superadmin', label: 'Super Admin', description: 'Full platform access - cannot be deleted', icon: Crown },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedRole === user.app_role) {
      onOpenChange(false);
      return;
    }

    setIsLoading(true);

    try {
      // First, remove all existing roles for this user
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.user_id);

      if (deleteError) throw deleteError;

      // Then add the new role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.user_id,
          role: selectedRole as any
        });

      if (insertError) throw insertError;

      toast({
        title: "Role Updated",
        description: `User role has been updated to ${roleHierarchy.find(r => r.value === selectedRole)?.label}`,
      });
      
      onOpenChange(false);
      onRoleUpdated();
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'business_admin':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'project_admin':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'user':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'client':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit User Role</DialogTitle>
          <DialogDescription>
            Update the platform role for {user.first_name} {user.last_name} ({user.email})
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Label>Current Role:</Label>
            <Badge className={getRoleBadgeColor(user.app_role)}>
              {roleHierarchy.find(r => r.value === user.app_role)?.label || user.app_role}
            </Badge>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">New Platform Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roleHierarchy.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex items-center gap-2">
                        {role.icon && <role.icon className="h-4 w-4 text-yellow-500" />}
                        <span>{role.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedRole && (
                <p className="text-sm text-muted-foreground">
                  {roleHierarchy.find(r => r.value === selectedRole)?.description}
                </p>
              )}
              
              {selectedRole === 'superadmin' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <Crown className="h-4 w-4" />
                    <span className="font-medium">Super Admin Warning</span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    Super Admins have full platform access and cannot be deleted. 
                    This role should only be assigned to trusted administrators.
                  </p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || selectedRole === user.app_role}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Update Role
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};