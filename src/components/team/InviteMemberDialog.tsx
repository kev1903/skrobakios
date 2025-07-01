
import { useState } from "react";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface InviteMemberDialogProps {
  onInvite: (data: { name: string; email: string; role: 'project_admin' | 'editor' | 'viewer' | 'guest' }) => void;
}

export const InviteMemberDialog = ({ onInvite }: InviteMemberDialogProps) => {
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    role: "viewer" as const
  });
  const { toast } = useToast();

  const handleInvite = () => {
    if (!inviteForm.name || !inviteForm.email || !inviteForm.role) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    onInvite(inviteForm);
    setInviteForm({ name: "", email: "", role: "viewer" });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Invite Team Member</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={inviteForm.name}
            onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
            placeholder="Enter full name"
          />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={inviteForm.email}
            onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
            placeholder="Enter email address"
          />
        </div>
        <div>
          <Label htmlFor="role">Role *</Label>
          <Select value={inviteForm.role} onValueChange={(value: any) => setInviteForm({ ...inviteForm, role: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="project_admin">Project Admin</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
              <SelectItem value="guest">Guest</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setInviteForm({ name: "", email: "", role: "viewer" })}>
            Cancel
          </Button>
          <Button onClick={handleInvite}>
            Send Invite
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};
