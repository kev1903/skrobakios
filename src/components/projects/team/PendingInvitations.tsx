import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Mail, 
  Clock, 
  User, 
  Shield, 
  Edit, 
  Eye, 
  Copy,
  Trash2 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  token: string;
  expires_at: string;
  message: string | null;
  created_at: string;
  inviter: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
}

interface PendingInvitationsProps {
  invitations: PendingInvitation[];
  canManage: boolean;
  projectId: string;
  onInvitationUpdated: () => void;
}

const roleConfig = {
  project_admin: { label: "Project Admin", color: "destructive", icon: Shield },
  editor: { label: "Editor", color: "default", icon: Edit },
  viewer: { label: "Viewer", color: "secondary", icon: Eye },
  member: { label: "Member", color: "outline", icon: User },
};

export function PendingInvitations({ 
  invitations, 
  canManage, 
  projectId, 
  onInvitationUpdated 
}: PendingInvitationsProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleCopyInviteLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(inviteUrl);
    toast({
      title: "Link copied",
      description: "Invitation link has been copied to clipboard.",
    });
  };

  const handleCancelInvitation = async (invitationId: string, email: string) => {
    if (!confirm(`Are you sure you want to cancel the invitation for ${email}?`)) {
      return;
    }

    setActionLoading(invitationId);
    try {
      const { error } = await supabase
        .from("project_invitations")
        .update({ 
          status: "cancelled", 
          updated_at: new Date().toISOString() 
        })
        .eq("id", invitationId);

      if (error) throw error;

      toast({
        title: "Invitation cancelled",
        description: `Invitation for ${email} has been cancelled.`,
      });

      onInvitationUpdated();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleResendInvitation = async (invitation: PendingInvitation) => {
    setActionLoading(invitation.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You must be logged in to resend invitations");
      }

      const response = await fetch(`/functions/v1/invite-project-member`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          projectId,
          email: invitation.email,
          role: invitation.role,
          message: invitation.message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to resend invitation");
      }

      // Cancel the old invitation
      await supabase
        .from("project_invitations")
        .update({ 
          status: "superseded", 
          updated_at: new Date().toISOString() 
        })
        .eq("id", invitation.id);

      toast({
        title: "Invitation resent",
        description: `New invitation has been sent to ${invitation.email}`,
      });

      onInvitationUpdated();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (invitations.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No pending invitations</h3>
            <p className="text-muted-foreground">
              All team invitations have been accepted or there are no pending invites.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Invitations ({invitations.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-0">
          {invitations.map((invitation, index) => {
            const roleInfo = roleConfig[invitation.role as keyof typeof roleConfig] || roleConfig.member;
            const RoleIcon = roleInfo.icon;
            const inviterName = invitation.inviter?.first_name && invitation.inviter?.last_name
              ? `${invitation.inviter.first_name} ${invitation.inviter.last_name}`.trim()
              : invitation.inviter?.email || "Team Admin";

            const isExpiringSoon = new Date(invitation.expires_at) < new Date(Date.now() + 24 * 60 * 60 * 1000);

            return (
              <div 
                key={invitation.id} 
                className={`flex items-center justify-between p-4 ${
                  index < invitations.length - 1 ? "border-b" : ""
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{invitation.email}</h4>
                      <Badge variant={roleInfo.color as any} className="text-xs">
                        <RoleIcon className="w-3 h-3 mr-1" />
                        {roleInfo.label}
                      </Badge>
                      {isExpiringSoon && (
                        <Badge variant="destructive" className="text-xs">
                          Expiring Soon
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>Invited by {inviterName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          Sent {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Expires {formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true })}
                    </div>
                    {invitation.message && (
                      <div className="mt-2 p-2 bg-muted rounded text-sm">
                        <span className="font-medium">Message: </span>
                        {invitation.message}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyInviteLink(invitation.token)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>

                  {canManage && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          disabled={actionLoading === invitation.id}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleResendInvitation(invitation)}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Resend Invitation
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleCopyInviteLink(invitation.token)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Invite Link
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleCancelInvitation(invitation.id, invitation.email)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Cancel Invitation
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}