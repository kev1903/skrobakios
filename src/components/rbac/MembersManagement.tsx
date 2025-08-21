import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { UserPlus, MoreHorizontal, Trash2, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useActiveBusiness } from '@/hooks/useActiveBusiness';
import { RequirePerm } from './PermissionGuard';
import { useToast } from '@/hooks/use-toast';
import { InviteMemberModal } from './InviteMemberModal';

interface Member {
  id: string;
  user_id: string;
  role: string;
  status: string;
  user_email: string;
  user_name: string;
  user_avatar?: string;
  joined_at: string;
}

export const MembersManagement: React.FC = () => {
  const { activeBusinessId } = useActiveBusiness();
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [updatingMember, setUpdatingMember] = useState<string | null>(null);

  const loadMembers = async () => {
    if (!activeBusinessId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('company_members')
        .select(`
          id,
          user_id,
          role,
          status,
          created_at,
          profiles!inner(
            user_id,
            email,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('company_id', activeBusinessId);

      if (error) throw error;

      const formattedMembers: Member[] = data.map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        role: item.role,
        status: item.status,
        user_email: item.profiles.email || 'Unknown',
        user_name: `${item.profiles.first_name || ''} ${item.profiles.last_name || ''}`.trim() || 'Unknown User',
        user_avatar: item.profiles.avatar_url,
        joined_at: item.created_at
      }));

      setMembers(formattedMembers);
    } catch (error) {
      console.error('Failed to load members:', error);
      toast({
        title: "Error",
        description: "Failed to load team members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMemberRole = async (memberId: string, newRole: string) => {
    setUpdatingMember(memberId);
    try {
      const { error } = await supabase
        .from('company_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      await loadMembers();
      toast({
        title: "Success",
        description: "Member role updated successfully",
      });
    } catch (error) {
      console.error('Failed to update member role:', error);
      toast({
        title: "Error",
        description: "Failed to update member role",
        variant: "destructive",
      });
    } finally {
      setUpdatingMember(null);
    }
  };

  const removeMember = async (member: Member) => {
    try {
      const { error } = await supabase
        .from('company_members')
        .delete()
        .eq('id', member.id);

      if (error) throw error;

      await loadMembers();
      toast({
        title: "Success",
        description: `${member.user_name} has been removed from the team`,
      });
    } catch (error) {
      console.error('Failed to remove member:', error);
      toast({
        title: "Error",
        description: "Failed to remove team member",
        variant: "destructive",
      });
    } finally {
      setMemberToRemove(null);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [activeBusinessId]);

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner': return 'default';
      case 'admin': return 'secondary';
      case 'member': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'default';
      case 'invited': return 'secondary';
      case 'inactive': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Members</h1>
          <p className="text-muted-foreground">
            Manage your team members and their roles
          </p>
        </div>
        <RequirePerm permission="members.invite">
          <Button onClick={() => setShowInviteModal(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        </RequirePerm>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members ({members.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading members...</div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No team members found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.user_avatar} />
                          <AvatarFallback>
                            {member.user_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.user_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {member.user_email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <RequirePerm 
                        permission="members.update_roles"
                        fallback={
                          <Badge variant={getRoleBadgeVariant(member.role)}>
                            {member.role}
                          </Badge>
                        }
                      >
                        <Select 
                          value={member.role} 
                          onValueChange={(value) => updateMemberRole(member.id, value)}
                          disabled={updatingMember === member.id || member.role === 'owner'}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="owner">Owner</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                          </SelectContent>
                        </Select>
                      </RequirePerm>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(member.status)}>
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(member.joined_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <RequirePerm permission="members.remove">
                        {member.role !== 'owner' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setMemberToRemove(member)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </RequirePerm>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <InviteMemberModal
        open={showInviteModal}
        onOpenChange={setShowInviteModal}
        onInviteSent={loadMembers}
      />

      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {memberToRemove?.user_name} from the team?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => memberToRemove && removeMember(memberToRemove)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};