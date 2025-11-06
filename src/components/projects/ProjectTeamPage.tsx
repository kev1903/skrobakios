import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/hooks/useProjects";
import { useCompany } from "@/contexts/CompanyContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Shield, Users, Clock, UserX, KeyRound } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useProjectUsers, formatUserName, getUserInitials, getUserAvatar, ProjectUser } from '@/hooks/useProjectUsers';
import { useCompanyMembers, formatMemberName, getMemberInitials, CompanyMember } from '@/hooks/useCompanyMembers';
import { UserPermissionsDialog } from '@/components/company/UserPermissionsDialog';

interface ProjectTeamPageProps {
  project: Project;
  onNavigate: (page: string) => void;
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
  const { isBusinessAdmin, isProjectAdmin, loading: roleLoading } = useUserRole();
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>({});
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  // Check if user can manage team (Business Admin or Project Admin)
  const canManageTeam = isBusinessAdmin() || isProjectAdmin();

  // Fetch team members with profile information using the new hook
  const { data: teamMembers, isLoading } = useProjectUsers(project.id);
  
  // Fetch company members to show who can be added to the project
  const { data: companyMembers, isLoading: loadingCompanyMembers } = useCompanyMembers(currentCompany?.id || '');

  // Add company member to project mutation
  const addMemberToProjectMutation = useMutation({
    mutationFn: async ({ companyMemberId, role }: { companyMemberId: string, role: string }) => {
      // Get the company member details first
      const companyMember = companyMembers?.find(m => m.id === companyMemberId);
      if (!companyMember) {
        console.error("Company member not found:", companyMemberId);
        throw new Error("Company member not found");
      }

      if (!companyMember.user_id) {
        console.error("Company member has no user_id:", companyMember);
        throw new Error("Company member must have a user account");
      }

      console.log("Adding member to project:", {
        project_id: project.id,
        user_id: companyMember.user_id,
        email: companyMember.email,
        role: role
      });

      // Check if member is already in the project
      const { data: existing } = await supabase
        .from("project_members")
        .select("id, status")
        .eq("project_id", project.id)
        .eq("user_id", companyMember.user_id)
        .maybeSingle();

      if (existing) {
        // Update existing member instead of inserting
        const { data, error } = await supabase
          .from("project_members")
          .update({
            role: role,
            status: 'active',
            joined_at: existing.status !== 'active' ? new Date().toISOString() : undefined
          })
          .eq("id", existing.id)
          .select();

        if (error) {
          console.error("Supabase error updating member:", error);
          throw new Error(error.message || "Failed to update team member");
        }
        return data;
      }

      // Insert new member
      const { data, error } = await supabase
        .from("project_members")
        .insert({
          project_id: project.id,
          user_id: companyMember.user_id,
          email: companyMember.email,
          role: role,
          status: 'active',
          joined_at: new Date().toISOString()
        })
        .select();

      if (error) {
        console.error("Supabase error adding member:", error);
        throw new Error(error.message || "Failed to add team member");
      }
      return data;
    },
    onSuccess: (data) => {
      console.log("Successfully added/updated member:", data);
      toast({
        title: "Success",
        description: "Company member added to project successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["project-users", project.id] });
      queryClient.invalidateQueries({ queryKey: ["company-members", currentCompany?.id] });
    },
    onError: (error: any) => {
      console.error("Error adding member to project:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add member to project",
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

  if (isLoading || loadingCompanyMembers || roleLoading) {
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
    <div className="bg-white">
      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="border shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{teamMembers?.length || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="border shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Members</CardTitle>
            <div className="w-2 h-2 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {teamMembers?.filter(m => m.status === 'active').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Invites</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {teamMembers?.filter(m => m.status === 'pending').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end items-center gap-2 mb-6">
        {canManageTeam && availableCompanyMembers.length > 0 && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Add Project Member
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
                            value={selectedRoles[member.id] || "member"}
                            onValueChange={(role) => {
                              setSelectedRoles(prev => ({
                                ...prev,
                                [member.id]: role
                              }));
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
                          <Button
                            onClick={() => {
                              addMemberToProjectMutation.mutate({
                                companyMemberId: member.id,
                                role: selectedRoles[member.id] || "member"
                              });
                            }}
                            disabled={addMemberToProjectMutation.isPending}
                            size="sm"
                          >
                            {addMemberToProjectMutation.isPending ? "Adding..." : "Add to Project"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Team Members Section */}
      {teamMembers && teamMembers.length > 0 ? (
        <Card className="mb-6 bg-white">
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
                        📧 {member.email}
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
                    {canManageTeam && member.user_id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUserId(member.user_id!);
                          setPermissionsDialogOpen(true);
                        }}
                        className="flex items-center gap-1"
                      >
                        <KeyRound className="w-4 h-4" />
                      </Button>
                    )}
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
        <Card className="mb-6 bg-white">
          <CardContent className="flex flex-col items-center justify-center py-16">
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
                      Add Project Member
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
                                value={selectedRoles[member.id] || "member"}
                                onValueChange={(role) => {
                                  setSelectedRoles(prev => ({
                                    ...prev,
                                    [member.id]: role
                                  }));
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
                              <Button
                                onClick={() => {
                                  addMemberToProjectMutation.mutate({
                                    companyMemberId: member.id,
                                    role: selectedRoles[member.id] || "member"
                                  });
                                }}
                                disabled={addMemberToProjectMutation.isPending}
                                size="sm"
                              >
                                {addMemberToProjectMutation.isPending ? "Adding..." : "Add to Project"}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Permission Management Dialog */}
      {selectedUserId && currentCompany && (
        <UserPermissionsDialog
          open={permissionsDialogOpen}
          onOpenChange={setPermissionsDialogOpen}
          userId={selectedUserId}
          companyId={currentCompany.id}
        />
      )}
    </div>
  );
};