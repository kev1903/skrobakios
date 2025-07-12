import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, UserPlus, RefreshCw, MoreHorizontal, Building2, Shield, Trash2, Edit, Users, KeyRound } from 'lucide-react';
import { useHierarchicalUserManagement } from '@/hooks/useHierarchicalUserManagement';
import { useUserRole } from '@/hooks/useUserRole';
import { HierarchicalUser } from '@/types/hierarchicalUser';
import { HierarchicalRoleManagement } from './HierarchicalRoleManagement';
import { UserProfileEditDialog } from './UserProfileEditDialog';
import { ManualUserCreateDialog } from './ManualUserCreateDialog';
import { toast } from '@/hooks/use-toast';

interface CompanyOption {
  id: string;
  name: string;
}

interface PlatformUserManagementProps {
  companies: CompanyOption[];
}

export const PlatformUserManagement = ({ companies }: PlatformUserManagementProps) => {
  const { isSuperAdmin } = useUserRole();
  const {
    users,
    loading,
    searchTerm,
    setSearchTerm,
    updateUserAppRole,
    addUserAppRole,
    removeUserAppRole,
    assignUserToCompany,
    updateUserStatus,
    deleteUser,
    inviteUser,
    refreshUsers
  } = useHierarchicalUserManagement();

  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<'owner' | 'admin' | 'member'>('member');
  const [showProfileEditDialog, setShowProfileEditDialog] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<HierarchicalUser | null>(null);
  const [showManualCreateDialog, setShowManualCreateDialog] = useState(false);

  const handleInviteUser = async () => {
    if (!inviteEmail) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    const result = await inviteUser(inviteEmail, selectedCompany && selectedCompany !== 'none' ? selectedCompany : undefined, selectedRole);
    
    if (result.success) {
      toast({
        title: "User Invited",
        description: `Invitation sent to ${inviteEmail}`,
      });
      setShowInviteDialog(false);
      setInviteEmail('');
      setSelectedCompany('');
      setSelectedRole('member');
    } else {
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
    }
  };

  const handleRoleChange = async (user: HierarchicalUser, newRole: string) => {
    if (!user.can_manage_roles) {
      toast({
        title: "Error",
        description: "You don't have permission to change this user's role",
        variant: "destructive",
      });
      return;
    }

    const result = await updateUserAppRole(user.user_id, newRole as any);
    
    if (result.success) {
      toast({
        title: "Role Updated",
        description: `User role updated to ${newRole}`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const handleCompanyAssignment = async (user: HierarchicalUser, companyId: string) => {
    if (!user.can_assign_to_companies) {
      toast({
        title: "Error",
        description: "You don't have permission to assign users to companies",
        variant: "destructive",
      });
      return;
    }

    const result = await assignUserToCompany(user.user_id, companyId, 'owner');
    
    if (result.success) {
      toast({
        title: "User Assigned",
        description: "User has been assigned as company owner",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to assign user to company",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (user: HierarchicalUser) => {
    if (!user.can_manage_roles) {
      toast({
        title: "Error",
        description: "You don't have permission to delete this user",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete ${user.first_name} ${user.last_name}? This action cannot be undone.`)) {
      return;
    }

    const result = await deleteUser(user.user_id);
    
    if (result.success) {
      toast({
        title: "User Deleted",
        description: "User has been successfully deleted",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleEditProfile = (user: HierarchicalUser) => {
    setSelectedUserForEdit(user);
    setShowProfileEditDialog(true);
  };

  const handleProfileUpdated = () => {
    refreshUsers();
  };

  const handleUserCreated = () => {
    refreshUsers();
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'destructive';
      case 'owner':
        return 'default';
      case 'admin':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (!isSuperAdmin()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You need superadmin privileges to access platform user management.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Platform User Management
              </CardTitle>
              <CardDescription>
                Manage all platform users and roles. {users.length} total users.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={refreshUsers}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="roles" className="flex items-center gap-2">
                <KeyRound className="w-4 h-4" />
                Roles
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        User Management
                      </CardTitle>
                      <CardDescription>
                        Manage user profiles, status, and company assignments.
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => setShowManualCreateDialog(true)}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Create User
                      </Button>
                      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <UserPlus className="w-4 h-4 mr-2" />
                            Invite User
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Invite New User</DialogTitle>
                            <DialogDescription>
                              Send an invitation to a new user and optionally assign them to a company.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium mb-2 block">Email Address</label>
                              <Input
                                type="email"
                                placeholder="user@example.com"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-2 block">Assign to Company (Optional)</label>
                              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a company" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">No company assignment</SelectItem>
                                  {companies.map((company) => (
                                    <SelectItem key={company.id} value={company.id}>
                                      {company.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {selectedCompany && selectedCompany !== 'none' && (
                              <div>
                                <label className="text-sm font-medium mb-2 block">Company Role</label>
                                <Select value={selectedRole} onValueChange={(value: any) => setSelectedRole(value)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="owner">Owner</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="member">Member</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleInviteUser}>
                              Send Invitation
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users by name, email, or company..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Company Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              Loading users...
                            </TableCell>
                          </TableRow>
                        ) : users.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              No users found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          users.map((user) => (
                            <TableRow key={user.user_id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.avatar_url} />
                                    <AvatarFallback>
                                      {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">
                                      {user.first_name} {user.last_name}
                                    </div>
                                    {user.phone && (
                                      <div className="text-sm text-muted-foreground">
                                        {user.phone}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>{user.company || '-'}</TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {user.company_role === 'none' ? '-' : user.company_role}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={getStatusBadgeVariant(user.status)}>
                                  {user.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEditProfile(user)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit Profile
                                    </DropdownMenuItem>
                                    {user.can_assign_to_companies && (
                                      <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                          <div className="cursor-pointer">
                                            <Building2 className="h-4 w-4 mr-2" />
                                            Assign to Company
                                          </div>
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    {user.can_manage_roles && (
                                      <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem 
                                          onClick={() => handleDeleteUser(user)}
                                          className="text-destructive"
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Delete User
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="roles" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <KeyRound className="w-5 h-5" />
                    Role Management
                  </CardTitle>
                  <CardDescription>
                    Manage platform roles and permissions for users.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users for role management..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Platform Roles</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                              Loading users...
                            </TableCell>
                          </TableRow>
                        ) : users.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                              No users found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          users.map((user) => (
                            <TableRow key={user.user_id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.avatar_url} />
                                    <AvatarFallback>
                                      {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">
                                      {user.first_name} {user.last_name}
                                    </div>
                                    {user.phone && (
                                      <div className="text-sm text-muted-foreground">
                                        {user.phone}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>{user.company || '-'}</TableCell>
                              <TableCell>
                                <HierarchicalRoleManagement
                                  user={user}
                                  onAddRole={addUserAppRole}
                                  onRemoveRole={removeUserAppRole}
                                />
                              </TableCell>
                              <TableCell>
                                <Badge variant={getStatusBadgeVariant(user.status)}>
                                  {user.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <ManualUserCreateDialog
        companies={companies}
        open={showManualCreateDialog}
        onOpenChange={setShowManualCreateDialog}
        onUserCreated={handleUserCreated}
      />
      
      <UserProfileEditDialog
        user={selectedUserForEdit}
        open={showProfileEditDialog}
        onOpenChange={setShowProfileEditDialog}
        onProfileUpdated={handleProfileUpdated}
      />
    </div>
  );
};