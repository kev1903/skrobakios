import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, Search, UserPlus, Trash2, Edit, Mail, Copy } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { InviteUserDialog } from "./InviteUserDialog";
import { EditUserRoleDialog } from "./EditUserRoleDialog";

interface TeamMember {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  phone: string;
  company: string;
  app_role: string;
  app_roles: string[];
  company_role: string;
  status: string;
  created_at: string;
  can_manage_roles: boolean;
  can_assign_to_companies: boolean;
}

export const TeamMembersList: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showEditRoleDialog, setShowEditRoleDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<TeamMember | null>(null);
  const { toast } = useToast();

  const fetchTeamMembers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if user is superadmin
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      const hasSuperAdminRole = roles?.some(r => r.role === 'superadmin') || false;
      setIsSuperAdmin(hasSuperAdminRole);

      const { data, error } = await supabase.rpc('get_manageable_users_for_user', {
        requesting_user_id: user.id
      });

      if (error) throw error;
      setMembers(data || []);
    } catch (error: any) {
      console.error('Error fetching team members:', error);
      toast({
        title: "Error",
        description: "Failed to load team members",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    console.log('handleDeleteUser called with userId:', userId);
    console.log('typeof userId:', typeof userId);
    
    // Check if userId is null or undefined (invited users who haven't signed up)
    if (!userId || userId === 'null' || userId === 'undefined') {
      toast({
        title: "Cannot Delete User",
        description: "This user hasn't completed their signup yet. You can revoke their invitation instead.",
        variant: "destructive",
      });
      return;
    }

    // Find the user to check their role
    const userToDelete = members.find(m => m.user_id === userId);
    if (userToDelete?.app_role === 'superadmin') {
      toast({
        title: "Cannot Delete Super Admin",
        description: "Super Admins cannot be deleted for security reasons. You can change their role first if needed.",
        variant: "destructive",
      });
      return;
    }
    
    if (!confirm('Are you sure you want to permanently delete this user? This action cannot be undone and will revoke all their access.')) {
      return;
    }

    try {
      // Get current session for auth header
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      console.log('About to send request with body:', { targetUserId: userId });

      // Call the edge function to completely delete user and revoke auth
      const { data, error } = await supabase.functions.invoke('delete-user-admin', {
        body: { targetUserId: userId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      console.log('Response from edge function:', { data, error });

      if (error) {
        console.error('Error calling delete-user-admin function:', error);
        throw new Error('Failed to connect to deletion service');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.success) {
        toast({
          title: "User Deleted",
          description: "User has been permanently deleted and their authentication revoked",
        });
        fetchTeamMembers(); // Refresh the list
      } else {
        throw new Error('Unexpected response from deletion service');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleRevokeInvitation = async (email: string) => {
    if (!confirm('Are you sure you want to revoke this invitation? The user will no longer be able to join using this invitation.')) {
      return;
    }

    try {
      // Get current session for auth header
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      // Call the edge function to revoke invitation
      const { data, error } = await supabase.functions.invoke('revoke-user-invitation', {
        body: { email },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error calling revoke-user-invitation function:', error);
        throw new Error('Failed to connect to revocation service');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.success) {
        toast({
          title: "Invitation Revoked",
          description: "The invitation has been successfully revoked",
        });
        fetchTeamMembers(); // Refresh the list
      } else {
        throw new Error('Unexpected response from revocation service');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to revoke invitation",
        variant: "destructive",
      });
    }
  };

  const handleResendInvitation = async (member: TeamMember) => {
    if (!confirm('Are you sure you want to resend the invitation to this user?')) {
      return;
    }

    try {
      // Get current session for auth header
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      // Get current user info for inviter name
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get inviter's profile info
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('user_id', user.id)
        .single();

      const inviterName = profile ? `${profile.first_name} ${profile.last_name}`.trim() : user.email;

      // Convert app_role back to display name
      const roleDisplayName = member.app_role === 'superadmin' ? 'Super Admin' : 
                             member.app_role === 'business_admin' ? 'Business Admin' :
                             member.app_role === 'project_admin' ? 'Project Admin' :
                             member.app_role === 'user' ? 'User' :
                             member.app_role === 'client' ? 'Client' : 'User';

      // Call the edge function to resend invitation
      const { data, error } = await supabase.functions.invoke('send-user-invitation', {
        body: {
          email: member.email,
          name: `${member.first_name} ${member.last_name}`.trim(),
          role: roleDisplayName,
          invitedBy: inviterName,
          isResend: true
        },
      });

      if (error) {
        console.error('Error calling send-user-invitation function:', error);
        throw new Error('Failed to connect to invitation service');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.success) {
        toast({
          title: "Invitation Resent",
          description: `Invitation has been resent to ${member.email}`,
        });
        fetchTeamMembers(); // Refresh the list
      } else {
        throw new Error('Unexpected response from invitation service');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend invitation",
        variant: "destructive",
      });
    }
  };

  const generateInvitationLink = (member: TeamMember): string => {
    // For invited users, generate a simple signup link with pre-filled email
    // This directs them to the main app where they can sign up
    const baseUrl = window.location.origin;
    
    if (member.status === 'invited') {
      // For invited users, create a link that pre-fills their email in the signup process
      return `${baseUrl}/?signup=true&email=${encodeURIComponent(member.email)}&role=${encodeURIComponent(member.app_role)}`;
    }
    
    // For active users, just provide a link to the main app
    return `${baseUrl}/?ref=team-invite&email=${encodeURIComponent(member.email)}`;
  };

  const handleCopyInvitationLink = async (member: TeamMember) => {
    try {
      const invitationLink = generateInvitationLink(member);
      await navigator.clipboard.writeText(invitationLink);
      toast({
        title: "Link Copied",
        description: "Invitation link has been copied to clipboard",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleEditRole = (member: TeamMember) => {
    setSelectedUser(member);
    setShowEditRoleDialog(true);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'business_admin':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'project_admin':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'company_admin':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'user':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'client':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'owner':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'admin':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'Super Admin';
      case 'business_admin':
        return 'Business Admin';
      case 'project_admin':
        return 'Project Admin';
      case 'company_admin':
        return 'Company Admin';
      default:
        return role.replace('_', ' ');
    }
  };

  const filteredMembers = members.filter(member =>
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.app_role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading team members...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Team Members</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            {isSuperAdmin && (
              <Button onClick={() => setShowInviteDialog(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite User
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredMembers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No team members found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>App Role</TableHead>
                <TableHead>Company Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Copy Link</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.user_id || member.email}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar_url} />
                        <AvatarFallback>
                          {member.first_name?.[0]}{member.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {member.first_name} {member.last_name}
                        </div>
                        {member.company && (
                          <div className="text-sm text-muted-foreground">
                            {member.company}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{member.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(member.app_role)}>
                      {getRoleDisplayName(member.app_role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {member.company_role !== 'none' ? (
                      <Badge variant="outline" className={getRoleBadgeColor(member.company_role)}>
                        {member.company_role}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      member.status === 'active' ? 'default' : 
                      member.status === 'revoked' ? 'destructive' : 'secondary'
                    }>
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(member.created_at), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyInvitationLink(member)}
                      title="Copy invitation link"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell>
                    {/* Hide the actions dropdown for Super Admin users */}
                    {member.app_role !== 'superadmin' ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {member.can_manage_roles && member.user_id && member.user_id !== 'null' && (
                            <DropdownMenuItem onClick={() => handleEditRole(member)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Roles
                            </DropdownMenuItem>
                          )}
                          {member.app_role !== 'superadmin' && member.user_id && member.user_id !== 'null' && (
                            <DropdownMenuItem 
                              onClick={() => handleDeleteUser(member.user_id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          )}
                          {(!member.user_id || member.user_id === 'null') && member.status === 'invited' && (
                            <>
                              <DropdownMenuItem 
                                onClick={() => handleResendInvitation(member)}
                                className="text-blue-600"
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Resend Invitation
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleRevokeInvitation(member.email)}
                                className="text-orange-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Revoke Invitation
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <span className="text-muted-foreground text-sm">Protected</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      
      <InviteUserDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        onInviteSent={fetchTeamMembers}
      />
      
      {selectedUser && (
        <EditUserRoleDialog
          open={showEditRoleDialog}
          onOpenChange={setShowEditRoleDialog}
          onRoleUpdated={fetchTeamMembers}
          user={selectedUser}
        />
      )}
    </Card>
  );
};