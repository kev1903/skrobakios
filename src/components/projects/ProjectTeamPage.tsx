import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/hooks/useProjects";
import { useCompany } from "@/contexts/CompanyContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, UserPlus, Mail, Settings, Shield, Users, Clock, UserX, Edit3 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useProjectUsers, formatUserName, getUserInitials, getUserAvatar, ProjectUser } from '@/hooks/useProjectUsers';
import { useCompanyMembers, formatMemberName, getMemberInitials, CompanyMember } from '@/hooks/useCompanyMembers';

interface ProjectTeamPageProps {
  project: Project;
  onNavigate: (page: string) => void;
}


interface ManualMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  company?: string;
  professionalTitle?: string;
  skills?: string[];
  notes?: string;
  addedAt: string;
}

const roleOptions = [
  { value: 'owner', label: 'Owner', description: 'Full access to project' },
  { value: 'manager', label: 'Manager', description: 'Can manage tasks and team' },
  { value: 'member', label: 'Member', description: 'Can view and edit tasks' },
  { value: 'viewer', label: 'Viewer', description: 'Can only view project' },
  { value: 'client', label: 'Client', description: 'External client with limited access' }
];

export const ProjectTeamPage = ({ project, onNavigate }: ProjectTeamPageProps) => {
  const { currentCompany } = useCompany();
  const queryClient = useQueryClient();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  
  // Manual member addition state
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [manualMembers, setManualMembers] = useState<ManualMember[]>([]);
  const [memberForm, setMemberForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "member",
    company: "",
    professionalTitle: "",
    skills: "",
    notes: ""
  });

  // Fetch team members with profile information using the new hook
  const { data: teamMembers, isLoading } = useProjectUsers(project.id);
  
  // Fetch company members to show who can be added to the project
  const { data: companyMembers, isLoading: loadingCompanyMembers } = useCompanyMembers(currentCompany?.id || '');

  // Invite member mutation
  const inviteMemberMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      const { data, error } = await supabase
        .from("project_invitations")
        .insert({
          project_id: project.id,
          email,
          role,
          invited_by: (await supabase.auth.getUser()).data.user?.id || "",
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          token: crypto.randomUUID()
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Team member invited successfully",
      });
      setIsInviteDialogOpen(false);
      setInviteEmail("");
      setInviteRole("member");
      queryClient.invalidateQueries({ queryKey: ["project-users", project.id] });
    },
    onError: (error) => {
      console.error("Error inviting member:", error);
      toast({
        title: "Error",
        description: "Failed to invite member",
        variant: "destructive",
      });
    }
  });

  // Add company member to project mutation
  const addMemberToProjectMutation = useMutation({
    mutationFn: async ({ companyMemberId, role }: { companyMemberId: string, role: string }) => {
      // Get the company member details first
      const companyMember = companyMembers?.find(m => m.id === companyMemberId);
      if (!companyMember) throw new Error("Company member not found");

      const { data, error } = await supabase
        .from("project_members")
        .insert({
          project_id: project.id,
          user_id: companyMember.user_id,
          email: companyMember.email,
          role: role,
          status: 'active',
          joined_at: new Date().toISOString()
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Company member added to project successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["project-users", project.id] });
    },
    onError: (error) => {
      console.error("Error adding member to project:", error);
      toast({
        title: "Error",
        description: "Failed to add member to project",
        variant: "destructive",
      });
    }
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from("project_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Team member removed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["project-users", project.id] });
    },
    onError: (error) => {
      console.error("Error removing member:", error);
      toast({
        title: "Error", 
        description: "Failed to remove member",
        variant: "destructive",
      });
    }
  });

  const handleInviteMember = () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    inviteMemberMutation.mutate({
      email: inviteEmail.trim(),
      role: inviteRole
    });
  };

  // Manual member handlers
  const handleAddManualMember = () => {
    if (!memberForm.firstName.trim() || !memberForm.lastName.trim() || !memberForm.email.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (First Name, Last Name, Email)",
        variant: "destructive",
      });
      return;
    }

    const newMember: ManualMember = {
      id: crypto.randomUUID(),
      firstName: memberForm.firstName.trim(),
      lastName: memberForm.lastName.trim(),
      email: memberForm.email.trim(),
      phone: memberForm.phone.trim() || undefined,
      role: memberForm.role,
      company: memberForm.company.trim() || undefined,
      professionalTitle: memberForm.professionalTitle.trim() || undefined,
      skills: memberForm.skills.trim() ? memberForm.skills.split(',').map(s => s.trim()) : undefined,
      notes: memberForm.notes.trim() || undefined,
      addedAt: new Date().toISOString()
    };

    setManualMembers(prev => [...prev, newMember]);
    setMemberForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "member",
      company: "",
      professionalTitle: "",
      skills: "",
      notes: ""
    });
    setIsAddMemberDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Team member details added. You can send invitations later.",
    });
  };

  const handleRemoveManualMember = (memberId: string) => {
    setManualMembers(prev => prev.filter(m => m.id !== memberId));
    toast({
      title: "Success",
      description: "Manual member entry removed",
    });
  };

  const handleSendInvitesToManualMembers = () => {
    manualMembers.forEach(member => {
      inviteMemberMutation.mutate({
        email: member.email,
        role: member.role
      });
    });
    
    // Clear manual members after sending invites
    setManualMembers([]);
    
    toast({
      title: "Success",
      description: `Invitations sent to ${manualMembers.length} team members`,
    });
  };

  const getStatusBadge = (member: ProjectUser) => {
    switch (member.status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inactive</Badge>;
      default:
        return <Badge variant="outline">{member.status}</Badge>;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Shield className="w-4 h-4" />;
      case 'manager':
        return <Settings className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  if (isLoading || loadingCompanyMembers) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Get company members who are not yet part of the project
  const availableCompanyMembers = companyMembers?.filter(companyMember => 
    !teamMembers?.some(projectMember => projectMember.user_id === companyMember.user_id)
  ) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Action Buttons */}
      <div className="flex justify-end items-center">
        <div className="flex gap-2">
          {availableCompanyMembers.length > 0 && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Add Company Members ({availableCompanyMembers.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Company Members to Project</DialogTitle>
                  <DialogDescription>
                    Select company members to add to this project team.
                  </DialogDescription>
                </DialogHeader>
                <div className="max-h-96 overflow-y-auto">
                  <div className="space-y-3">
                    {availableCompanyMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={member.profile?.avatar_url} />
                            <AvatarFallback>{getMemberInitials(member)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{formatMemberName(member)}</p>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                            {member.profile?.professional_title && (
                              <p className="text-xs text-muted-foreground">{member.profile.professional_title}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select
                            defaultValue="member"
                            onValueChange={(role) => {
                              addMemberToProjectMutation.mutate({
                                companyMemberId: member.id,
                                role: role
                              });
                            }}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {roleOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                Add Members
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Team Member Details</DialogTitle>
                <DialogDescription>
                  Manually enter team member details. You can send invitations later.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={memberForm.firstName}
                      onChange={(e) => setMemberForm({...memberForm, firstName: e.target.value})}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={memberForm.lastName}
                      onChange={(e) => setMemberForm({...memberForm, lastName: e.target.value})}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="memberEmail">Email Address *</Label>
                    <Input
                      id="memberEmail"
                      type="email"
                      value={memberForm.email}
                      onChange={(e) => setMemberForm({...memberForm, email: e.target.value})}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={memberForm.phone}
                      onChange={(e) => setMemberForm({...memberForm, phone: e.target.value})}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="memberRole">Role</Label>
                    <Select value={memberForm.role} onValueChange={(value) => setMemberForm({...memberForm, role: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex flex-col">
                              <span>{option.label}</span>
                              <span className="text-xs text-muted-foreground">{option.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={memberForm.company}
                      onChange={(e) => setMemberForm({...memberForm, company: e.target.value})}
                      placeholder="e.g., ABC Construction"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="professionalTitle">Professional Title</Label>
                    <Input
                      id="professionalTitle"
                      value={memberForm.professionalTitle}
                      onChange={(e) => setMemberForm({...memberForm, professionalTitle: e.target.value})}
                      placeholder="e.g., Senior Engineer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="skills">Skills</Label>
                    <Input
                      id="skills"
                      value={memberForm.skills}
                      onChange={(e) => setMemberForm({...memberForm, skills: e.target.value})}
                      placeholder="Enter skills separated by commas"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={memberForm.notes}
                    onChange={(e) => setMemberForm({...memberForm, notes: e.target.value})}
                    placeholder="Any additional notes about this team member"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddMemberDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddManualMember}>
                  Add Member Details
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Invite a new member to join this project team.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex flex-col">
                            <span>{option.label}</span>
                            <span className="text-xs text-muted-foreground">{option.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleInviteMember}
                  disabled={inviteMemberMutation.isPending}
                >
                  {inviteMemberMutation.isPending ? "Inviting..." : "Send Invitation"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Manual Members Section */}
      {manualMembers.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Draft Members</CardTitle>
                <CardDescription>
                  Team members added manually. Send invitations when ready.
                </CardDescription>
              </div>
              <Button onClick={handleSendInvitesToManualMembers} className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Send Invitations ({manualMembers.length})
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {manualMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>
                        {member.firstName[0]}{member.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{member.firstName} {member.lastName}</h4>
                        <Badge variant="outline">Draft</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        {member.email}
                      </div>
                      {member.company && (
                        <div className="text-sm text-muted-foreground">
                          🏢 {member.company}
                        </div>
                      )}
                      {member.professionalTitle && (
                        <div className="text-sm text-muted-foreground">
                          {member.professionalTitle}
                        </div>
                      )}
                      {member.phone && (
                        <div className="text-sm text-muted-foreground">
                          📞 {member.phone}
                        </div>
                      )}
                      {member.skills && member.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {member.skills.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {member.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{member.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(member.role)}
                      <Badge variant="outline" className="capitalize">
                        {member.role}
                      </Badge>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveManualMember(member.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <UserX className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(teamMembers?.length || 0) + manualMembers.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Badge variant="default" className="w-3 h-3 p-0 bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamMembers?.filter(m => m.status === 'active').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invites</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(teamMembers?.filter(m => m.status === 'pending').length || 0) + manualMembers.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Section */}
      {teamMembers && teamMembers.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Project Team Members ({teamMembers.length})</CardTitle>
            <CardDescription>
              Team members currently assigned to this project.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={getUserAvatar(member)} />
                      <AvatarFallback>{getUserInitials(member)}</AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{formatUserName(member)}</h4>
                        {getStatusBadge(member)}
                        {member.isCurrentUser && (
                          <Badge variant="outline" className="text-xs">You</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        {member.email}
                      </div>
                      {member.profile?.professional_title && (
                        <div className="text-sm text-muted-foreground">
                          {member.profile.professional_title}
                        </div>
                      )}
                      {member.profile?.skills && member.profile.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {member.profile.skills.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {member.profile.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{member.profile.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(member.role)}
                      <Badge variant="secondary" className="capitalize">
                        {member.role}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMemberMutation.mutate(member.id)}
                      className="text-destructive hover:text-destructive"
                      disabled={removeMemberMutation.isPending}
                    >
                      <UserX className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Team Members Yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              This project doesn't have any team members assigned yet. Add company members to the project or invite new members to get started.
            </p>
            <div className="flex gap-2">
              {availableCompanyMembers.length > 0 && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Add Company Members ({availableCompanyMembers.length})
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add Company Members to Project</DialogTitle>
                      <DialogDescription>
                        Select company members to add to this project team.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-96 overflow-y-auto">
                      <div className="space-y-3">
                        {availableCompanyMembers.map((member) => (
                          <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={member.profile?.avatar_url} />
                                <AvatarFallback>{getMemberInitials(member)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{formatMemberName(member)}</p>
                                <p className="text-sm text-muted-foreground">{member.email}</p>
                                {member.profile?.professional_title && (
                                  <p className="text-xs text-muted-foreground">{member.profile.professional_title}</p>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => addMemberToProjectMutation.mutate({
                                companyMemberId: member.id,
                                role: 'member'
                              })}
                              disabled={addMemberToProjectMutation.isPending}
                            >
                              Add to Project
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              <Button
                variant="outline"
                onClick={() => setIsInviteDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Invite New Member
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};