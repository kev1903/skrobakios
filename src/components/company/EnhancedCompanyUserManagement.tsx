import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { Label } from '@/components/ui/label';
import { Search, RefreshCw, MoreHorizontal, Building2, Trash2, Crown, Shield, User, UserPlus, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useCompany } from '@/contexts/CompanyContext';
import { toast } from '@/hooks/use-toast';
import { CreateUserForBusinessDialog } from './CreateUserForBusinessDialog';

interface CompanyMember {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  phone?: string;
  role: 'owner' | 'admin' | 'manager' | 'supplier' | 'sub_contractor' | 'consultant' | 'client';
  status: 'active' | 'invited' | 'inactive';
  joined_at: string;
}

interface AvailableUser {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  phone?: string;
}

interface EnhancedCompanyUserManagementProps {
  companyId: string;
  companyName: string;
}

export const EnhancedCompanyUserManagement = ({ 
  companyId, 
  companyName 
}: EnhancedCompanyUserManagementProps) => {
  const { user } = useAuth();
  const { isSuperAdmin } = useUserRole();
  const { refreshCompanies } = useCompany();
  const queryClient = useQueryClient();
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  
  // Add existing user state
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [availableUsersLoading, setAvailableUsersLoading] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'manager' | 'supplier' | 'sub_contractor' | 'consultant' | 'client'>('manager');

  const fetchMembers = async (forceRefresh = false) => {
    if (!companyId) return;

    try {
      setLoading(true);
      
      if (forceRefresh) {
        console.log('Force refreshing company members for company:', companyId);
        // Invalidate React Query cache to force refetch
        queryClient.invalidateQueries({ queryKey: ["company-members", companyId] });
      }
      
      console.log('Fetching members for company:', companyId);
      
      // Step 1: Fetch company members (no joins to avoid FK requirement)
      const { data: memberRows, error: membersError } = await supabase
        .from('company_members')
        .select('*')
        .eq('company_id', companyId)
        .eq('status', 'active');

      console.log('Raw company members data:', memberRows);
      console.log('Company members error:', membersError);

      if (membersError) {
        console.error('Error fetching company members:', membersError);
        toast({
          title: "Error",
          description: "Failed to fetch company members",
          variant: "destructive",
        });
        return;
      }

      const userIds = (memberRows || []).map((m: any) => m.user_id).filter(Boolean);
      console.log('Extracted user IDs:', userIds);

      // Step 2: Fetch profiles for those user IDs
      let profilesMap = new Map<string, any>();
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, email, first_name, last_name, avatar_url, phone')
          .in('user_id', userIds);

        console.log('Profiles data:', profiles);
        console.log('Profiles error:', profilesError);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          toast({
            title: "Error",
            description: "Failed to fetch member profiles",
            variant: "destructive",
          });
        } else {
          profiles?.forEach((p: any) => profilesMap.set(p.user_id, p));
        }
      }

      // Merge members with profile data
      const transformedMembers = (memberRows || []).map((member: any) => {
        const profile = profilesMap.get(member.user_id) || {};
        
        // Fallback logic for missing profile data
        const firstName = profile.first_name || '';
        const lastName = profile.last_name || '';
        const email = profile.email || '';
        
        return {
          id: member.id,
          user_id: member.user_id,
          email: email,
          first_name: firstName,
          last_name: lastName,
          avatar_url: profile.avatar_url,
          phone: profile.phone,
          role: member.role,
          status: member.status,
          joined_at: member.joined_at,
        } as CompanyMember;
      });

      console.log('Transformed members:', transformedMembers);
      setMembers(transformedMembers);

      // Get current user's role in the company
      const currentMember = transformedMembers.find(m => m.user_id === user?.id);
      setCurrentUserRole(currentMember?.role || '');
      
      console.log('Current user role in company:', currentMember?.role || 'none');
      console.log('Can manage members:', (isSuperAdmin() || currentMember?.role === 'owner' || currentMember?.role === 'admin'));

    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        title: "Error",
        description: "Failed to fetch company members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const handleRoleChange = async (memberId: string, newRole: 'owner' | 'admin' | 'manager' | 'supplier' | 'sub_contractor' | 'consultant' | 'client') => {
    try {
      const { error } = await supabase
        .from('company_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) {
        console.error('Error updating role:', error);
        toast({
          title: "Error",
          description: "Failed to update member role",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Role Updated",
        description: `Member role updated to ${newRole}`,
      });

      fetchMembers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update member role",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from the company?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('company_members')
        .delete()
        .eq('id', memberId);

      if (error) {
        console.error('Error removing member:', error);
        toast({
          title: "Error",
          description: "Failed to remove member",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Member Removed",
        description: `${memberName} has been removed from the company`,
      });

      fetchMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      setAvailableUsersLoading(true);
      
      // Get all users from profiles who are not already members of this company
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email, first_name, last_name, avatar_url, phone')
        .eq('status', 'active');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        toast({
          title: "Error",
          description: "Failed to fetch available users",
          variant: "destructive",
        });
        return;
      }

      // Get current company member user IDs
      const currentMemberIds = members.map(member => member.user_id);
      
      // Filter out users who are already members
      const availableUsers = profiles?.filter(profile => 
        !currentMemberIds.includes(profile.user_id)
      ) || [];

      setAvailableUsers(availableUsers);
    } catch (error) {
      console.error('Error fetching available users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch available users",
        variant: "destructive",
      });
    } finally {
      setAvailableUsersLoading(false);
    }
  };

  const handleAddExistingUser = async (userId: string, userName: string) => {
    try {
      const { error } = await supabase
        .from('company_members')
        .insert({
          company_id: companyId,
          user_id: userId,
          role: selectedRole,
          status: 'active'
        });

      if (error) {
        console.error('Error adding user to company:', error);
        toast({
          title: "Error",
          description: "Failed to add user to company",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "User Added",
        description: `${userName} has been added to the company as ${selectedRole}`,
      });

      // Refresh the company context so the Business Swapper updates for all users
      await refreshCompanies();

      setAddUserDialogOpen(false);
      setUserSearchTerm('');
      setSelectedRole('manager');
      fetchMembers();
    } catch (error) {
      console.error('Error adding user to company:', error);
      toast({
        title: "Error",
        description: "Failed to add user to company",
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4" />;
      case 'admin':
        return <Shield className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'destructive';
      case 'admin':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'invited':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  // Enhanced permission checks for business admin access
  const { isBusinessAdmin } = useUserRole();
  const canManageMembers = isSuperAdmin() || isBusinessAdmin() || currentUserRole === 'owner' || currentUserRole === 'admin';
  const canChangeRoles = isSuperAdmin() || currentUserRole === 'owner';

  const filteredMembers = members.filter(member => {
    const searchLower = searchTerm.toLowerCase();
    return (
      member.first_name?.toLowerCase().includes(searchLower) ||
      member.last_name?.toLowerCase().includes(searchLower) ||
      member.email?.toLowerCase().includes(searchLower)
    );
  });

  const filteredAvailableUsers = availableUsers.filter(user => {
    const searchLower = userSearchTerm.toLowerCase();
    return (
      user.first_name?.toLowerCase().includes(searchLower) ||
      user.last_name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    );
  });

  useEffect(() => {
    fetchMembers();
  }, [companyId]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                {companyName} Team Management
              </CardTitle>
              <CardDescription>
                Manage team members, roles, and permissions for this business. {members.length} total members.
                <br />
                <em className="text-xs text-muted-foreground">
                  Current role: {currentUserRole || 'none'} | 
                  Can manage: {canManageMembers ? 'yes' : 'no'} | 
                  Is superadmin: {isSuperAdmin() ? 'yes' : 'no'}
                </em>
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => fetchMembers(true)}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between space-x-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {canManageMembers && (
              <div className="flex gap-2">
                <Button 
                  onClick={() => setCreateUserDialogOpen(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New User
                </Button>
              </div>
            )}
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading members...
                    </TableCell>
                  </TableRow>
                ) : filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No members found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatar_url} />
                            <AvatarFallback>
                              {member.first_name?.charAt(0)}{member.last_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                           <div>
                             <div className="font-medium">
                               {(member.first_name && member.last_name) ? 
                                 `${member.first_name} ${member.last_name}` : 
                                 member.email || 'Unknown User'}
                             </div>
                             {member.phone && (
                               <div className="text-sm text-muted-foreground">
                                 {member.phone}
                               </div>
                             )}
                           </div>
                        </div>
                      </TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        {canChangeRoles && member.role !== 'owner' ? (
                          <Select
                            value={member.role}
                            onValueChange={(value: any) => handleRoleChange(member.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue>
                                <div className="flex items-center gap-2">
                                  {getRoleIcon(member.role)}
                                  <Badge variant={getRoleBadgeVariant(member.role)}>
                                    {member.role}
                                  </Badge>
                                </div>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="supplier">Supplier</SelectItem>
                              <SelectItem value="sub_contractor">Sub-Contractor</SelectItem>
                              <SelectItem value="consultant">Consultant</SelectItem>
                              <SelectItem value="client">Client</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="flex items-center gap-2">
                            {getRoleIcon(member.role)}
                            <Badge variant={getRoleBadgeVariant(member.role)}>
                              {member.role}
                            </Badge>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(member.status)}>
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(member.joined_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {canManageMembers && member.role !== 'owner' && member.user_id !== user?.id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => handleRemoveMember(member.id, `${member.first_name} ${member.last_name}`)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove Member
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <CreateUserForBusinessDialog
        open={createUserDialogOpen}
        onOpenChange={setCreateUserDialogOpen}
        companyId={companyId}
        companyName={companyName}
        onUserCreated={() => fetchMembers(true)}
      />
    </div>
  );
};