import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal, Mail, Calendar, Shield, User, Eye, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface TeamMember {
  id: string;
  user_id: string | null;
  email: string | null;
  role: string;
  status: string;
  joined_at: string | null;
  permissions: any;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    avatar_url: string | null;
    professional_title: string | null;
  } | null;
}

interface ProjectTeamListProps {
  members: TeamMember[];
  loading: boolean;
  canManage: boolean;
  projectId: string;
  onMemberUpdated: () => void;
}

const roleConfig = {
  project_admin: { label: "Project Admin", color: "destructive", icon: Shield },
  editor: { label: "Editor", color: "default", icon: Edit },
  viewer: { label: "Viewer", color: "secondary", icon: Eye },
  member: { label: "Member", color: "outline", icon: User },
};

export function ProjectTeamList({ 
  members, 
  loading, 
  canManage, 
  projectId, 
  onMemberUpdated 
}: ProjectTeamListProps) {
  const [updatingMember, setUpdatingMember] = useState<string | null>(null);

  const handleRoleChange = async (memberId: string, newRole: string) => {
    setUpdatingMember(memberId);
    try {
      const { error } = await supabase
        .from("project_members")
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq("id", memberId);

      if (error) throw error;

      toast({
        title: "Role updated",
        description: "Team member role has been updated successfully.",
      });

      onMemberUpdated();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdatingMember(null);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from this project?`)) {
      return;
    }

    setUpdatingMember(memberId);
    try {
      const { error } = await supabase
        .from("project_members")
        .update({ status: "inactive", updated_at: new Date().toISOString() })
        .eq("id", memberId);

      if (error) throw error;

      toast({
        title: "Member removed",
        description: `${memberName} has been removed from the project.`,
      });

      onMemberUpdated();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdatingMember(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">Loading team members...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (members.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No team members yet</h3>
            <p className="text-muted-foreground mb-4">
              Start building your project team by inviting members.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members ({members.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-0">
          {members.map((member, index) => {
            const profile = member.profiles;
            const name = profile?.first_name && profile?.last_name 
              ? `${profile.first_name} ${profile.last_name}`.trim()
              : profile?.email || member.email || "Unknown User";
            
            const roleInfo = roleConfig[member.role as keyof typeof roleConfig] || roleConfig.member;
            const RoleIcon = roleInfo.icon;

            return (
              <div 
                key={member.id} 
                className={`flex items-center justify-between p-4 ${
                  index < members.length - 1 ? "border-b" : ""
                }`}
              >
                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile?.avatar_url || ""} alt={name} />
                    <AvatarFallback>
                      {name.split(" ").map(n => n[0]).join("").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{name}</h4>
                      <Badge variant={roleInfo.color as any} className="text-xs">
                        <RoleIcon className="w-3 h-3 mr-1" />
                        {roleInfo.label}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Mail className="w-3 h-3" />
                        <span>{profile?.email || member.email}</span>
                      </div>
                      {member.joined_at && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            Joined {formatDistanceToNow(new Date(member.joined_at), { addSuffix: true })}
                          </span>
                        </div>
                      )}
                    </div>
                    {profile?.professional_title && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {profile.professional_title}
                      </p>
                    )}
                  </div>
                </div>

                {canManage && (
                  <div className="flex items-center space-x-2">
                    <Select
                      value={member.role}
                      onValueChange={(value) => handleRoleChange(member.id, value)}
                      disabled={updatingMember === member.id}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(roleConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center space-x-2">
                              <config.icon className="w-4 h-4" />
                              <span>{config.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          disabled={updatingMember === member.id}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleRemoveMember(member.id, name)}
                          className="text-destructive"
                        >
                          Remove from project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}