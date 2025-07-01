
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TeamMember {
  id: string;
  email: string;
  name?: string;
  role: 'project_admin' | 'editor' | 'viewer' | 'guest';
  status: string;
  invited_at: string;
  joined_at?: string;
  notify_on_task_added?: boolean;
  avatar_url?: string;
}

interface ProjectAccessSettings {
  access_level: 'private_to_members' | 'public' | 'restricted';
  allow_member_invites: boolean;
  require_approval_for_join: boolean;
}

export const useTeamData = (projectId: string) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [accessSettings, setAccessSettings] = useState<ProjectAccessSettings>({
    access_level: 'private_to_members',
    allow_member_invites: true,
    require_approval_for_join: false
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({
        title: "Error",
        description: "Failed to load team members",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAccessSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('project_access_settings')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setAccessSettings({
          access_level: data.access_level,
          allow_member_invites: data.allow_member_invites || true,
          require_approval_for_join: data.require_approval_for_join || false
        });
      }
    } catch (error) {
      console.error('Error fetching access settings:', error);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
    fetchAccessSettings();
  }, [projectId]);

  return {
    teamMembers,
    setTeamMembers,
    accessSettings,
    setAccessSettings,
    loading,
    fetchTeamMembers,
    fetchAccessSettings
  };
};
