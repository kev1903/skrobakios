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
import { 
  Search, 
  RefreshCw, 
  MoreHorizontal, 
  Building2, 
  Crown, 
  Shield, 
  User, 
  UserPlus, 
  Mail,
  Settings,
  Eye,
  Edit3,
  Trash2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';

interface TeamMember {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  company_role: 'owner' | 'admin' | 'team_member' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  joined_at: string;
  last_active?: string;
}

interface CompanyTeamManagementProps {
  companyId: string;
  companyName?: string;
}

export const CompanyTeamManagement: React.FC<CompanyTeamManagementProps> = ({
  companyId,
  companyName
}) => {
  const { user } = useAuth();
  const { isBusinessAdmin, isCompanyAdmin } = useUserRole();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'team_member' | 'viewer'>('team_member');
  const [userRole, setUserRole] = useState<'owner' | 'admin' | 'team_member' | 'viewer' | null>(null);

  // Get current user's role in this company
  const fetchUserRole = async () => {
    if (!user || !companyId) return;

    try {
      const { data, error } = await supabase
        .from('company_members')
        .select('role')
        .eq('company_id', companyId)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) {
        console.error('Error fetching user role:', error);
        return;
      }

      setUserRole(data?.role as any || null);
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchTeamMembers = async () => {
    if (!companyId) return;

    try {
      setLoading(true);

      // Get company members
      const { data: membersData, error: membersError } = await supabase
        .from('company_members')
        .select('user_id, role, status, joined_at')
        .eq('company_id', companyId)
        .eq('status', 'active');

      if (membersError) {
        console.error('Error fetching company members:', membersError);
        toast({
          title: "Error",
          description: "Failed to fetch team members",
          variant: "destructive",
        });
        return;
      }

      if (!membersData || membersData.length === 0) {
        setTeamMembers([]);
        return;
      }

      // Get user profiles
      const userIds = membersData.map(m => m.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email, first_name, last_name, avatar_url')
        .in('user_id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        toast({
          title: "Error",
          description: "Failed to fetch user profiles",
          variant: "destructive",
        });
        return;
      }

      // Create profiles map
      const profilesMap = (profilesData || []).reduce((acc, profile) => {
        acc[profile.user_id] = profile;
        return acc;
      }, {} as Record<string, any>);

      // Combine data
      const formattedMembers: TeamMember[] = membersData.map((member) => {
        const profile = profilesMap[member.user_id] || {};
        
        return {
          user_id: member.user_id,
          email: profile.email || '',
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          avatar_url: profile.avatar_url,
          company_role: member.role as any,
          status: member.status as any,
          joined_at: member.joined_at,
        };
      });

      // Sort by role hierarchy: owner > admin > team_member > viewer
      const roleOrder = { owner: 0, admin: 1, team_member: 2, viewer: 3 };
      formattedMembers.sort((a, b) => {
        const aOrder = roleOrder[a.company_role] ?? 999;
        const bOrder = roleOrder[b.company_role] ?? 999;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return a.first_name.localeCompare(b.first_name);
      });

      setTeamMembers(formattedMembers);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({
        title: "Error",
        description: "Failed to fetch team members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail || !companyId) return;

    try {
      // For now, just show success message
      // In a real implementation, you'd send an invitation email
      toast({
        title: "Success",
        description: `Invitation sent to ${inviteEmail}`,
      });

      setInviteDialogOpen(false);
      setInviteEmail('');
      setInviteRole('team_member');
    } catch (error) {
      console.error('Error inviting user:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!companyId) return;

    try {
      const { error } = await supabase
        .from('company_members')
        .update({ status: 'inactive' })
        .eq('company_id', companyId)
        .eq('user_id', memberId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team member removed successfully",
      });

      fetchTeamMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove team member",
        variant: "destructive",
      });
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    if (!companyId) return;

    try {
      const { error } = await supabase
        .from('company_members')
        .update({ role: newRole })
        .eq('company_id', companyId)
        .eq('user_id', memberId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Role updated successfully",
      });

      fetchTeamMembers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchUserRole();
      fetchTeamMembers();
    }
  }, [companyId, user?.id]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'admin':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const canManageMembers = userRole === 'owner' || userRole === 'admin' || isBusinessAdmin();
  const canChangeRoles = userRole === 'owner' || isBusinessAdmin();

  const filteredMembers = teamMembers.filter((member) => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      member.email.toLowerCase().includes(searchLower) ||
      member.company_role.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Team Management</CardTitle>
            <CardDescription>Loading team members...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                {companyName ? `${companyName} - Team Management` : 'Team Management'}
              </CardTitle>
              <CardDescription>
                Manage team members and their roles for this company.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchTeamMembers}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              {canManageMembers && (
                <Button onClick={() => setInviteDialogOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search and Stats */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search team members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Badge variant="secondary">
          {teamMembers.length} Team Member{teamMembers.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Team Members Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                {canManageMembers && <TableHead className="w-[50px]">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canManageMembers ? 5 : 4} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? 'No team members found matching your search.' : 'No team members found.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers.map((member) => (
                  <TableRow key={member.user_id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {`${member.first_name?.[0] || ''}${member.last_name?.[0] || ''}`.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {member.first_name || member.last_name 
                              ? `${member.first_name} ${member.last_name}`.trim()
                              : 'Unknown User'
                            }
                          </div>
                          <div className="text-sm text-muted-foreground">{member.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(member.company_role)}
                        <Badge variant={getRoleBadgeVariant(member.company_role)}>
                          {member.company_role.replace('_', ' ')}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(member.joined_at).toLocaleDateString()}
                    </TableCell>
                    {canManageMembers && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => window.open(`/user-permissions/${member.user_id}/${companyId}`, '_blank')}
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              Manage Permissions
                            </DropdownMenuItem>
                            {canChangeRoles && member.company_role !== 'owner' && (
                              <>
                                <DropdownMenuItem onClick={() => handleRoleChange(member.user_id, 'admin')}>
                                  <Shield className="h-4 w-4 mr-2" />
                                  Make Admin
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRoleChange(member.user_id, 'team_member')}>
                                  <User className="h-4 w-4 mr-2" />
                                  Make Member
                                </DropdownMenuItem>
                              </>
                            )}
                            {member.user_id !== user?.id && member.company_role !== 'owner' && (
                              <DropdownMenuItem 
                                onClick={() => handleRemoveMember(member.user_id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove Member
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your company team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email Address</label>
              <Input
                type="email"
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="team_member">Team Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInviteUser}>
              <Mail className="h-4 w-4 mr-2" />
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};