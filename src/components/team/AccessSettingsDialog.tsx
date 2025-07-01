
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface ProjectAccessSettings {
  access_level: 'private_to_members' | 'public' | 'restricted';
  allow_member_invites: boolean;
  require_approval_for_join: boolean;
}

interface AccessSettingsDialogProps {
  accessSettings: ProjectAccessSettings;
  onUpdateSettings: (settings: Partial<ProjectAccessSettings>) => void;
}

export const AccessSettingsDialog = ({ accessSettings, onUpdateSettings }: AccessSettingsDialogProps) => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Project Access Settings</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label htmlFor="access-level">Access Level</Label>
          <Select
            value={accessSettings.access_level}
            onValueChange={(value: any) => onUpdateSettings({ access_level: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="private_to_members">Private to Members</SelectItem>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="restricted">Restricted</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="allow-invites">Allow Member Invites</Label>
          <Switch
            id="allow-invites"
            checked={accessSettings.allow_member_invites}
            onCheckedChange={(checked) => onUpdateSettings({ allow_member_invites: checked })}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="require-approval">Require Approval for Join</Label>
          <Switch
            id="require-approval"
            checked={accessSettings.require_approval_for_join}
            onCheckedChange={(checked) => onUpdateSettings({ require_approval_for_join: checked })}
          />
        </div>
      </div>
    </DialogContent>
  );
};
