
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ProjectAccessSettings } from "./types";

export const useAccessSettings = (
  projectId: string,
  accessSettings: ProjectAccessSettings,
  setAccessSettings: (settings: ProjectAccessSettings) => void
) => {
  const { toast } = useToast();

  const updateAccessSettings = async (settings: Partial<ProjectAccessSettings>) => {
    try {
      const updatedSettings = { ...accessSettings, ...settings };
      
      const { error } = await supabase
        .from('project_access_settings')
        .upsert({
          project_id: projectId,
          access_level: updatedSettings.access_level,
          allow_member_invites: updatedSettings.allow_member_invites,
          require_approval_for_join: updatedSettings.require_approval_for_join
        });

      if (error) throw error;

      setAccessSettings(updatedSettings);
      toast({
        title: "Success",
        description: "Access settings updated successfully"
      });
    } catch (error: any) {
      console.error('Error updating access settings:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update access settings",
        variant: "destructive"
      });
    }
  };

  return {
    updateAccessSettings
  };
};
