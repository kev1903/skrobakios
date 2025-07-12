import React, { useState, useEffect } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCompany } from '@/contexts/CompanyContext';
import { 
  Users, 
  UserPlus, 
  Search, 
  MoreHorizontal,
  Crown,
  Shield,
  User,
  Mail,
  Trash2
} from 'lucide-react';

interface CompanyMember {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  role: 'owner' | 'admin' | 'member';
  status: 'active' | 'pending' | 'inactive';
  joined_at: string;
}

const mockMembers: CompanyMember[] = [
  {
    id: '1',
    user_id: 'user1',
    email: 'john.doe@example.com',
    first_name: 'John',
    last_name: 'Doe',
    role: 'owner',
    status: 'active',
    joined_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    user_id: 'user2',
    email: 'jane.smith@example.com',
    first_name: 'Jane',
    last_name: 'Smith',
    role: 'admin',
    status: 'active',
    joined_at: '2024-02-01T00:00:00Z'
  },
  {
    id: '3',
    user_id: 'user3',
    email: 'mike.johnson@example.com',
    first_name: 'Mike',
    last_name: 'Johnson',
    role: 'member',
    status: 'active',
    joined_at: '2024-02-15T00:00:00Z'
  }
];

export const CompanyUserManagement = () => {
  const { currentCompany } = useCompany();
  const [members, setMembers] = useState<CompanyMember[]>(mockMembers);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'admin' | 'owner'>('member');
  const [pendingRoleChange, setPendingRoleChange] = useState<{memberId: string, newRole: string, memberName: string} | null>(null);
  const { toast } = useToast();

  const filteredMembers = members.filter(member =>
    member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-600" />;
      default:
        return <User className="h-4 w-4 text-slate-600" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      owner: 'bg-yellow-100 text-yellow-800',
      admin: 'bg-blue-100 text-blue-800',
      member: 'bg-slate-100 text-slate-800'
    };
    return (
      <Badge className={variants[role as keyof typeof variants]}>
        {getRoleIcon(role)}
        <span className="ml-1 capitalize">{role}</span>
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-red-100 text-red-800'
    };
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status}
      </Badge>
    );
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) return;

    try {
      // Here you would send the invitation
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Add pending member to the list
      const newMember: CompanyMember = {
        id: Date.now().toString(),
        user_id: '',
        email: inviteEmail,
        first_name: 'Pending',
        last_name: 'User',
        role: inviteRole,
        status: 'pending',
        joined_at: new Date().toISOString()
      };
      
      setMembers(prev => [...prev, newMember]);
      setInviteEmail('');
      setShowInviteForm(false);
      
      toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${inviteEmail}`
      });
    } catch (error) {
      toast({
        title: "Failed to Send Invitation",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string, memberName?: string) => {
    // If promoting to owner, show confirmation dialog
    if (newRole === 'owner') {
      const member = members.find(m => m.id === memberId);
      if (member) {
        setPendingRoleChange({
          memberId,
          newRole,
          memberName: `${member.first_name} ${member.last_name}`
        });
        return;
      }
    }

    // Proceed with role change
    await executeRoleChange(memberId, newRole, memberName);
  };

  const executeRoleChange = async (memberId: string, newRole: string, memberName?: string) => {
    try {
      setMembers(prev => prev.map(member =>
        member.id === memberId ? { ...member, role: newRole as any } : member
      ));
      
      toast({
        title: "Role Updated",
        description: `${memberName ? `${memberName}'s` : 'Member'} role has been updated to ${newRole}.`
      });
    } catch (error) {
      toast({
        title: "Failed to Update Role",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleConfirmRoleChange = async () => {
    if (pendingRoleChange) {
      await executeRoleChange(pendingRoleChange.memberId, pendingRoleChange.newRole, pendingRoleChange.memberName);
      setPendingRoleChange(null);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      setMembers(prev => prev.filter(member => member.id !== memberId));
      
      toast({
        title: "Member Removed",
        description: "Member has been removed from the company."
      });
    } catch (error) {
      toast({
        title: "Failed to Remove Member",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const canManageMembers = currentCompany?.role === 'owner' || currentCompany?.role === 'admin';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
              </CardTitle>
              <CardDescription>
                Manage members and their roles for {currentCompany?.name || 'your company'}
              </CardDescription>
            </div>
            {canManageMembers && (
              <Button onClick={() => setShowInviteForm(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Invite Form */}
          {showInviteForm && (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Invite New Member</h4>
                  <div className="flex gap-4">
                    <Input
                      placeholder="Enter email address"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        {canManageMembers && currentCompany?.role === 'owner' && (
                          <SelectItem value="owner">Owner</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleInviteMember}>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Invitation
                    </Button>
                    <Button variant="outline" onClick={() => setShowInviteForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Members List */}
          <div className="space-y-3">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatar_url} />
                        <AvatarFallback>
                          {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">
                            {member.first_name} {member.last_name}
                          </h4>
                          {getRoleBadge(member.role)}
                          {getStatusBadge(member.status)}
                        </div>
                        <p className="text-sm text-slate-500">{member.email}</p>
                        <p className="text-xs text-slate-400">
                          Joined {new Date(member.joined_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {canManageMembers && (
                      <div className="flex items-center space-x-2">
                        {/* Only show role dropdown if user is not an owner, or if current user is owner */}
                         {(member.role !== 'owner' || currentCompany?.role === 'owner') && (
                           <Select
                             value={member.role}
                             onValueChange={(value) => handleRoleChange(member.id, value, `${member.first_name} ${member.last_name}`)}
                           >
                             <SelectTrigger className="w-24">
                               <SelectValue />
                             </SelectTrigger>
                             <SelectContent>
                               <SelectItem value="member">Member</SelectItem>
                               <SelectItem value="admin">Admin</SelectItem>
                               {currentCompany?.role === 'owner' && (
                                 <SelectItem value="owner">Owner</SelectItem>
                               )}
                             </SelectContent>
                           </Select>
                         )}
                        {/* Only allow removing members if they're not owners, or if current user is owner */}
                        {(member.role !== 'owner' || currentCompany?.role === 'owner') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <Users className="h-12 w-12 mx-auto mb-4" />
              <p>No members found matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Owner Role Confirmation Dialog */}
      <AlertDialog open={!!pendingRoleChange} onOpenChange={(open) => !open && setPendingRoleChange(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-600" />
              Promote to Owner?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to promote <strong>{pendingRoleChange?.memberName}</strong> to Owner? 
              <br/><br/>
              Owner permissions include:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Full access to company settings</li>
                <li>Ability to manage all members and their roles</li>
                <li>Ability to promote other members to Owner</li>
                <li>Ability to remove other owners</li>
              </ul>
              <br/>
              <strong>This action gives them the same level of control as you have.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRoleChange} className="bg-yellow-600 hover:bg-yellow-700">
              Yes, Promote to Owner
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};