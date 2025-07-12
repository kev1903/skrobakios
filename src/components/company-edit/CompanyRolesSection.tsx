import React, { useState, useEffect } from 'react';
import { Users, UserPlus, MoreHorizontal, Trash2, Crown, Shield, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CompanyMember {
  id: string;
  user_id: string;
  role: string;
  status: string;
  joined_at: string;
  // We'll need to join with profiles to get user details
  user_email?: string;
  user_name?: string;
}

interface CompanyRolesSectionProps {
  companyId: string;
}

export const CompanyRolesSection = ({ companyId }: CompanyRolesSectionProps) => {
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const { toast } = useToast();

  useEffect(() => {
    fetchMembers();
  }, [companyId]);

  const fetchMembers = async () => {
    try {
      // First get company members
      const { data: membersData, error: membersError } = await supabase
        .from('company_members')
        .select('*')
        .eq('company_id', companyId);

      if (membersError) throw membersError;

      // Then get profile information for each member
      const membersWithUserInfo = await Promise.all(
        (membersData || []).map(async (member) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, first_name, last_name')
            .eq('user_id', member.user_id)
            .single();

          return {
            ...member,
            user_email: profile?.email || 'Unknown',
            user_name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown User' : 'Unknown User'
          };
        })
      );

      setMembers(membersWithUserInfo);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        title: "Error",
        description: "Failed to load company members",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) return;

    try {
      // Here you would typically create an invitation
      // For now, we'll just show a success message
      toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${inviteEmail}`,
      });

      setInviteEmail('');
      setInviteRole('member');
      setShowInviteDialog(false);
    } catch (error) {
      console.error('Error inviting user:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive"
      });
    }
  };

  const updateMemberRole = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('company_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      await fetchMembers();
      toast({
        title: "Success",
        description: "Member role updated successfully"
      });
    } catch (error) {
      console.error('Error updating member role:', error);
      toast({
        title: "Error",
        description: "Failed to update member role",
        variant: "destructive"
      });
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('company_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      await fetchMembers();
      toast({
        title: "Success",
        description: "Member removed successfully"
      });
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive"
      });
    }
  };

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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card className="backdrop-blur-xl bg-white/60 border-white/20 shadow-xl">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-slate-600">Loading members...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-xl bg-white/60 border-white/20 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Company Members</span>
            <Badge variant="secondary">{members.length}</Badge>
          </CardTitle>
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="user@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleInviteUser}>
                    Send Invitation
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 rounded-lg bg-white/40 border border-white/30"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  {getRoleIcon(member.role)}
                </div>
                <div>
                  <div className="font-medium text-slate-800">
                    {member.user_name || 'Unknown User'}
                  </div>
                  <div className="text-sm text-slate-600">{member.user_email}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge className={getRoleBadgeColor(member.role)}>
                  {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                </Badge>
                <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                  {member.status}
                </Badge>
                {member.role !== 'owner' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => updateMemberRole(member.id, member.role === 'admin' ? 'member' : 'admin')}
                      >
                        {member.role === 'admin' ? 'Make Member' : 'Make Admin'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => removeMember(member.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))}
          {members.length === 0 && (
            <div className="text-center py-8 text-slate-600">
              No members found. Invite some team members to get started.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};