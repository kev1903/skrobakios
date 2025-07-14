import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Shield, Users, Lock, Globe, UserPlus } from "lucide-react";

interface ProjectPermissionsSettingsProps {
  projectId: string;
  project: any;
}

export function ProjectPermissionsSettings({ 
  projectId, 
  project 
}: ProjectPermissionsSettingsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

  // Fetch current access settings
  const { data: accessSettings, isLoading } = useQuery({
    queryKey: ["project-access-settings", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_access_settings")
        .select("*")
        .eq("project_id", projectId)
        .single();

      if (error && error.code !== "PGRST116") { // Not found is ok, we'll create default
        throw error;
      }

      return data || {
        access_level: "private_to_members",
        allow_member_invites: true,
        require_approval_for_join: false,
      };
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (newSettings: any) => {
      const { data, error } = await supabase
        .from("project_access_settings")
        .upsert({
          project_id: projectId,
          ...newSettings,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-access-settings", projectId] });
      toast({
        title: "Settings updated",
        description: "Project access settings have been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateProjectVisibility = useMutation({
    mutationFn: async (isPublic: boolean) => {
      const { data, error } = await supabase
        .from("projects")
        .update({ 
          is_public: isPublic,
          updated_at: new Date().toISOString() 
        })
        .eq("id", projectId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      toast({
        title: "Project visibility updated",
        description: "Project visibility has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">Loading settings...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="w-5 h-5" />
            <span>Project Visibility</span>
          </CardTitle>
          <CardDescription>
            Control who can view this project and its content.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Public Project</Label>
              <div className="text-sm text-muted-foreground">
                Make this project visible to everyone, including non-team members
              </div>
            </div>
            <Switch
              checked={project.is_public || false}
              onCheckedChange={(checked) => updateProjectVisibility.mutate(checked)}
              disabled={updateProjectVisibility.isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Access Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Access Control</span>
          </CardTitle>
          <CardDescription>
            Configure who can access this project and how they can join.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="access-level" className="text-base">
              Access Level
            </Label>
            <Select
              value={accessSettings?.access_level || "private_to_members"}
              onValueChange={(value) => 
                updateSettings.mutate({ 
                  ...accessSettings, 
                  access_level: value 
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private_to_members">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Private to Members</div>
                      <div className="text-xs text-muted-foreground">
                        Only team members can access
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="restricted">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Restricted</div>
                      <div className="text-xs text-muted-foreground">
                        Requires approval to join
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="public">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Public</div>
                      <div className="text-xs text-muted-foreground">
                        Anyone can view and request to join
                      </div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground">
              Determines the base access level for this project
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Allow Member Invites</Label>
              <div className="text-sm text-muted-foreground">
                Let team members invite others to join this project
              </div>
            </div>
            <Switch
              checked={accessSettings?.allow_member_invites ?? true}
              onCheckedChange={(checked) => 
                updateSettings.mutate({ 
                  ...accessSettings, 
                  allow_member_invites: checked 
                })
              }
              disabled={updateSettings.isPending}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Require Join Approval</Label>
              <div className="text-sm text-muted-foreground">
                Require admin approval for new team members
              </div>
            </div>
            <Switch
              checked={accessSettings?.require_approval_for_join ?? false}
              onCheckedChange={(checked) => 
                updateSettings.mutate({ 
                  ...accessSettings, 
                  require_approval_for_join: checked 
                })
              }
              disabled={updateSettings.isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Team Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Team Management</span>
          </CardTitle>
          <CardDescription>
            Configure how team membership is managed for this project.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <UserPlus className="w-4 h-4 text-blue-500" />
                <span className="font-medium">Invitation Settings</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {accessSettings?.allow_member_invites 
                  ? "Members can invite others to join"
                  : "Only admins can send invitations"
                }
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span className="font-medium">Join Approval</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {accessSettings?.require_approval_for_join
                  ? "New members require admin approval"
                  : "Invited members join automatically"
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}