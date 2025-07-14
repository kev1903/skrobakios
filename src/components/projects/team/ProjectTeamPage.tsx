import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserPlus, Settings, Shield } from "lucide-react";
import { ProjectSidebar } from "@/components/ProjectSidebar";
import { ProjectTeamList } from "./ProjectTeamList";
import { InviteTeamMemberDialog } from "./InviteTeamMemberDialog";
import { ProjectPermissionsSettings } from "./ProjectPermissionsSettings";
import { PendingInvitations } from "./PendingInvitations";

export function ProjectTeamPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  // Navigation function for ProjectSidebar
  const handleNavigate = (page: string) => {
    switch (page) {
      case "home":
        navigate("/dashboard");
        break;
      case "project-detail":
        navigate(`/projects/${projectId}`);
        break;
      case "project-tasks":
        navigate(`/projects/${projectId}/tasks`);
        break;
      case "project-files":
        navigate(`/projects/${projectId}/files`);
        break;
      case "project-team":
        navigate(`/projects/${projectId}/team`);
        break;
      case "project-schedule":
        navigate(`/projects/${projectId}/schedule`);
        break;
      case "bim":
        navigate(`/projects/${projectId}/digital-objects`);
        break;
      case "project-digital-twin":
        navigate(`/projects/${projectId}/digital-twin`);
        break;
      case "project-cost":
        navigate(`/projects/${projectId}/cost`);
        break;
      case "project-settings":
        navigate(`/projects/${projectId}/settings`);
        break;
      default:
        console.log(`Navigation to ${page} not implemented`);
    }
  };

  // Status helper functions for ProjectSidebar
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'completed':
        return 'text-green-400 border-green-400/30';
      case 'on_hold':
      case 'paused':
        return 'text-yellow-400 border-yellow-400/30';
      case 'cancelled':
        return 'text-red-400 border-red-400/30';
      default:
        return 'text-blue-400 border-blue-400/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      case 'on_hold':
        return 'On Hold';
      case 'paused':
        return 'Paused';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Planning';
    }
  };

  // Fetch project details
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });

  // Fetch team members
  const { data: teamMembers, isLoading: membersLoading, refetch: refetchMembers } = useQuery({
    queryKey: ["project-members", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_members")
        .select(`
          *,
          profiles!project_members_user_id_fkey (
            first_name,
            last_name,
            email,
            avatar_url,
            professional_title
          )
        `)
        .eq("project_id", projectId)
        .eq("status", "active")
        .order("joined_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });

  // Fetch pending invitations
  const { data: pendingInvitations, refetch: refetchInvitations } = useQuery({
    queryKey: ["project-invitations", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_invitations")
        .select(`
          *,
          inviter:invited_by (
            first_name,
            last_name,
            email
          )
        `)
        .eq("project_id", projectId)
        .eq("status", "pending")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });

  // Check if current user can manage team
  const { data: canManageTeam } = useQuery({
    queryKey: ["can-manage-team", projectId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Check if user is company admin/owner
      const { data: companyMember } = await supabase
        .from("company_members")
        .select("role")
        .eq("company_id", project?.company_id)
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      if (companyMember?.role && ["owner", "admin"].includes(companyMember.role)) {
        return true;
      }

      // Check if user is project admin
      const { data: projectMember } = await supabase
        .from("project_members")
        .select("role")
        .eq("project_id", projectId)
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      return projectMember?.role === "project_admin";
    },
    enabled: !!projectId && !!project,
  });

  if (projectLoading) {
    return <div className="flex items-center justify-center p-8">Loading project...</div>;
  }

  if (!project) {
    return <div className="text-center p-8">Project not found</div>;
  }

  return (
    <div className="h-screen flex backdrop-blur-xl bg-black/20 border border-white/10">
      {/* Project Sidebar */}
      <ProjectSidebar
        project={project}
        onNavigate={handleNavigate}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
        activeSection="team"
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto ml-48 backdrop-blur-xl bg-white/5 border-l border-white/10">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Team Management</h1>
              <p className="text-muted-foreground mt-1">
                Manage team members for "{project.name}"
              </p>
            </div>
            
            {canManageTeam && (
              <Button onClick={() => setInviteDialogOpen(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamMembers?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Active team members
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Invites</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingInvitations?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting response
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admins</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {teamMembers?.filter(m => m.role === "project_admin").length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Project administrators
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="members" className="space-y-6">
            <TabsList>
              <TabsTrigger value="members">Team Members</TabsTrigger>
              <TabsTrigger value="invitations">Pending Invitations</TabsTrigger>
              {canManageTeam && (
                <TabsTrigger value="settings">Access Settings</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="members" className="space-y-4">
              <ProjectTeamList 
                members={teamMembers as any || []}
                loading={membersLoading}
                canManage={canManageTeam || false}
                projectId={projectId!}
                onMemberUpdated={refetchMembers}
              />
            </TabsContent>

            <TabsContent value="invitations" className="space-y-4">
              <PendingInvitations 
                invitations={pendingInvitations as any || []}
                canManage={canManageTeam || false}
                projectId={projectId!}
                onInvitationUpdated={refetchInvitations}
              />
            </TabsContent>

            {canManageTeam && (
              <TabsContent value="settings" className="space-y-4">
                <ProjectPermissionsSettings 
                  projectId={projectId!}
                  project={project}
                />
              </TabsContent>
            )}
          </Tabs>

          {/* Invite Dialog */}
          <InviteTeamMemberDialog 
            open={inviteDialogOpen}
            onOpenChange={setInviteDialogOpen}
            projectId={projectId!}
            projectName={project.name}
            onInviteSent={() => {
              refetchInvitations();
              setInviteDialogOpen(false);
            }}
          />
        </div>
      </div>
    </div>
  );
}