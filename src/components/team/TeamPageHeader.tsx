
import { useState } from "react";
import { Settings, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { InviteMemberDialog } from "./InviteMemberDialog";
import { AccessSettingsDialog } from "./AccessSettingsDialog";
import { TeamMember, ProjectAccessSettings } from "@/hooks/team/types";

interface TeamPageHeaderProps {
  onInviteMember: (data: { name: string; email: string; role: TeamMember['role'] }) => void;
  onUpdateSettings: (settings: Partial<ProjectAccessSettings>) => void;
  accessSettings: ProjectAccessSettings;
}

export const TeamPageHeader = ({ onInviteMember, onUpdateSettings, accessSettings }: TeamPageHeaderProps) => {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);

  const handleInvite = (data: { name: string; email: string; role: TeamMember['role'] }) => {
    onInviteMember(data);
    setIsInviteDialogOpen(false);
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
        <p className="text-gray-600">Manage project team members and their roles</p>
      </div>
      
      <div className="flex space-x-2">
        <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Button>
          </DialogTrigger>
          <AccessSettingsDialog
            accessSettings={accessSettings}
            onUpdateSettings={onUpdateSettings}
          />
        </Dialog>

        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <UserPlus className="w-4 h-4" />
              <span>Invite Member</span>
            </Button>
          </DialogTrigger>
          <InviteMemberDialog onInvite={handleInvite} />
        </Dialog>
      </div>
    </div>
  );
};
