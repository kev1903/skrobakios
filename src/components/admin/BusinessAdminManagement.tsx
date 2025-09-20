import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Search, RefreshCw, MoreHorizontal, Building2, Crown, Shield, User, UserPlus, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from '@/hooks/use-toast';
import { canManageRole } from '@/utils/permissionLogic';

interface BusinessAdmin {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  company_name: string;
  company_id: string;
  role: 'owner' | 'admin';
  status: 'active' | 'invited' | 'inactive';
  assigned_at: string;
}

interface AvailableUser {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  current_role: string;
}

interface BusinessAdminManagementProps {
  companyId?: string;
  companyName?: string;
}

export const BusinessAdminManagement: React.FC<BusinessAdminManagementProps> = ({
  companyId,
  companyName
}) => {
  const { user } = useAuth();
  const { isSuperAdmin, role } = useUserRole();
  const [businessAdmins, setBusinessAdmins] = useState<BusinessAdmin[]>([]);
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [assigningRole, setAssigningRole] = useState<'admin'>('admin');
  const [activeTab, setActiveTab] = useState<'existing' | 'new'>('existing');
  const [isCreating, setIsCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  const fetchBusinessAdmins = async () => {
    if (!isSuperAdmin()) return;

    try {
      setLoading(true);
      
      // Query to get business admins with their company assignments
      const query = supabase
        .from('company_members')
        .select(`
          user_id,
          role,
          status,
          joined_at,
          companies!inner(
            id,
            name
          ),
          profiles!inner(
            user_id,
            email,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('role', 'admin')
        .eq('status', 'active');

      // If specific company, filter by company
      if (companyId) {
        query.eq('company_id', companyId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching business admins:', error);
        toast({
          title: "Error",
          description: "Failed to fetch business administrators",
          variant: "destructive",
        });
        return;
      }

      const formattedAdmins = (data || []).map((item: any) => ({
        user_id: item.user_id,
        email: item.profiles?.email || '',
        first_name: item.profiles?.first_name || '',
        last_name: item.profiles?.last_name || '',
        avatar_url: item.profiles?.avatar_url,
        company_name: item.companies?.name || '',
        company_id: item.companies?.id || '',
        role: item.role,
        status: item.status,
        assigned_at: item.joined_at,
      }));

      setBusinessAdmins(formattedAdmins);
    } catch (error) {
      console.error('Error fetching business admins:', error);
      toast({
        title: "Error",
        description: "Failed to fetch business administrators",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    if (!isSuperAdmin()) return;

    try {
      // Get users who can be promoted to business admin
      const { data, error } = await supabase.rpc('get_manageable_users_for_user', {
        requesting_user_id: user?.id,
      });

      if (error) {
        console.error('Error fetching available users:', error);
        return;
      }

      // Filter users who can be assigned as business admins
      const eligibleUsers = (data || []).filter((u: any) => {
        const userRole = u.app_role || 'user';
        return canManageRole('superadmin', userRole) && userRole !== 'business_admin';
      }).map((u: any) => ({
        user_id: u.user_id,
        email: u.email,
        first_name: u.first_name,
        last_name: u.last_name,
        avatar_url: u.avatar_url,
        current_role: u.app_role || 'user'
      }));

      setAvailableUsers(eligibleUsers);
    } catch (error) {
      console.error('Error fetching available users:', error);
    }
  };

  const assignBusinessAdmin = async () => {
    if (!selectedUser || !companyId) return;

    try {
      // First, promote user to business_admin role
      const { data: roleResult, error: roleError } = await supabase.rpc('set_user_primary_role', {
        target_user_id: selectedUser,
        new_role: 'business_admin'
      });

      const result = roleResult as any;
      if (roleError || !result?.success) {
        throw new Error(result?.error || 'Failed to assign business admin role');
      }

      // Then, add them as admin to the company
      const { error: companyError } = await supabase
        .from('company_members')
        .upsert({
          company_id: companyId,
          user_id: selectedUser,
          role: 'admin',
          status: 'active'
        });

      if (companyError) {
        throw new Error('Failed to assign to company');
      }

      toast({
        title: "Success",
        description: "Business administrator assigned successfully",
      });

      setAssignDialogOpen(false);
      setSelectedUser('');
      fetchBusinessAdmins();
      fetchAvailableUsers();
    } catch (error: any) {
      console.error('Error assigning business admin:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign business administrator",
        variant: "destructive",
      });
    }
  };

  const removeBusinessAdmin = async (userId: string, adminName: string) => {
    if (!confirm(`Remove ${adminName} as business administrator? They will be demoted to regular user.`)) {
      return;
    }

    try {
      // Remove from company
      const { error: companyError } = await supabase
        .from('company_members')
        .delete()
        .eq('user_id', userId)
        .eq('company_id', companyId);

      if (companyError) {
        throw new Error('Failed to remove from company');
      }

      // Demote role to user
      const { data: roleResult, error: roleError } = await supabase.rpc('set_user_primary_role', {
        target_user_id: userId,
        new_role: 'user'
      });

      const result = roleResult as any;
      if (roleError || !result?.success) {
        console.warn('Failed to demote role, but removed from company');
      }

      toast({
        title: "Administrator Removed",
        description: `${adminName} has been removed as business administrator`,
      });

      fetchBusinessAdmins();
    } catch (error: any) {
      console.error('Error removing business admin:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove business administrator",
        variant: "destructive",
      });
    }
  };

  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    
    // Ensure at least one character from each type
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*";
    
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    setNewUserForm(prev => ({ ...prev, password }));
    toast({
      title: "Password Generated",
      description: "A secure password has been generated",
    });
  };

  const createNewBusinessAdmin = async () => {
    if (!newUserForm.email || !newUserForm.password || !newUserForm.firstName) {
      toast({
        title: "Error",
        description: "Email, password, and first name are required",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      // Create user through edge function
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found. Please login again.');

      const { data, error } = await supabase.functions.invoke('create-user-manually', {
        body: {
          email: newUserForm.email,
          password: newUserForm.password,
          firstName: newUserForm.firstName,
          lastName: newUserForm.lastName,
          companyId: companyId,
          companyRole: 'admin',
          appRole: 'business_admin'
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to create user');
      }

      if (!data || !data.success) {
        const errorMsg = data?.error || 'User creation failed';
        throw new Error(errorMsg);
      }

      toast({
        title: "Success",
        description: `Business Admin ${newUserForm.email} created and added to ${companyName} successfully`,
      });

      // Reset form and close dialog
      setNewUserForm({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
      });
      setAssignDialogOpen(false);
      fetchBusinessAdmins();
      fetchAvailableUsers();

    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const filteredAdmins = businessAdmins.filter(admin => {
    const searchLower = searchTerm.toLowerCase();
    return (
      admin.first_name?.toLowerCase().includes(searchLower) ||
      admin.last_name?.toLowerCase().includes(searchLower) ||
      admin.email?.toLowerCase().includes(searchLower) ||
      admin.company_name?.toLowerCase().includes(searchLower)
    );
  });

  useEffect(() => {
    if (isSuperAdmin()) {
      fetchBusinessAdmins();
      fetchAvailableUsers();
    }
  }, [companyId, isSuperAdmin]);

  if (!isSuperAdmin()) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertTriangle className="h-5 w-5" />
            <p>Only superadmins can manage business administrators.</p>
          </div>
        </CardContent>
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
                <Shield className="h-5 w-5 text-primary" />
                {companyName ? `${companyName} - Business Administrators` : 'Business Administrator Management'}
              </CardTitle>
              <CardDescription>
                Assign and manage business administrators who have full access to their assigned companies.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchBusinessAdmins}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              {companyId && (
                <Button onClick={() => setAssignDialogOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Business Admin
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search administrators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="secondary">{filteredAdmins.length} Administrators</Badge>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading business administrators...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Administrator</TableHead>
                  <TableHead>Email</TableHead>
                  {!companyId && <TableHead>Company</TableHead>}
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdmins.map((admin) => (
                  <TableRow key={`${admin.user_id}-${admin.company_id}`}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={admin.avatar_url || ''} alt={admin.first_name} />
                          <AvatarFallback>
                            {admin.first_name?.charAt(0)}{admin.last_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {admin.first_name} {admin.last_name}
                          </div>
                          <div className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            <span className="text-xs text-muted-foreground">Business Admin</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{admin.email}</TableCell>
                    {!companyId && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{admin.company_name}</span>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge variant={admin.status === 'active' ? 'default' : 'secondary'}>
                        {admin.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(admin.assigned_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => removeBusinessAdmin(admin.user_id, `${admin.first_name} ${admin.last_name}`)}
                            className="text-destructive"
                          >
                            Remove Administrator
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredAdmins.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={companyId ? 5 : 6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Shield className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No business administrators found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Assign Business Admin Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={(open) => {
        setAssignDialogOpen(open);
        if (!open) {
          setSelectedUser('');
          setNewUserForm({
            email: '',
            password: '',
            firstName: '',
            lastName: '',
          });
          setActiveTab('existing');
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Team Members</DialogTitle>
            <DialogDescription>
              Add, manage, and assign roles to team members for {companyName}.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'existing' | 'new')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="existing">Add Existing User</TabsTrigger>
              <TabsTrigger value="new">Create New User</TabsTrigger>
            </TabsList>
            
            <TabsContent value="existing" className="space-y-4">
              <div>
                <Label>Select User</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a user to promote" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map((user) => (
                      <SelectItem key={user.user_id} value={user.user_id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={user.avatar_url || ''} />
                            <AvatarFallback className="text-xs">
                              {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.first_name} {user.last_name}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={assignBusinessAdmin} disabled={!selectedUser}>
                  Assign Administrator
                </Button>
              </DialogFooter>
            </TabsContent>
            
            <TabsContent value="new" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={newUserForm.firstName}
                    onChange={(e) => setNewUserForm(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={newUserForm.lastName}
                    onChange={(e) => setNewUserForm(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Doe"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john.doe@example.com"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter secure password"
                    className="pr-20"
                    required
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className="h-8 w-8 p-0"
                      title={showPassword ? "Hide Password" : "Show Password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={generatePassword}
                      className="h-8 w-8 p-0"
                      title="Generate Password"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setAssignDialogOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button onClick={createNewBusinessAdmin} disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Business Admin'}
                </Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};