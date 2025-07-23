import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, Search, UserPlus, Trash2, Edit } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { InviteUserDialog } from "./InviteUserDialog";

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
    if (!confirm('Are you sure you want to permanently delete this user? This action cannot be undone and will revoke all their access.')) {
      return;
    }

    try {
      // Get current session for auth header
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      // Call the edge function to completely delete user and revoke auth
      const { data, error } = await supabase.functions.invoke('delete-user-admin', {
        body: { targetUserId: userId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'platform_admin':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'company_admin':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'owner':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'admin':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
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
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.user_id}>
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
                      {member.app_role.replace('_', ' ')}
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
                    <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(member.created_at), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {member.can_manage_roles && (
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Roles
                          </DropdownMenuItem>
                        )}
                        {member.app_role !== 'superadmin' && (
                          <DropdownMenuItem 
                            onClick={() => handleDeleteUser(member.user_id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
    </Card>
  );
};