import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Globe, X, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ProjectMember {
  user_id: string;
  role: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

interface ShareProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
}

export const ShareProjectDialog = ({ open, onOpenChange, projectId, projectName }: ShareProjectDialogProps) => {
  const [email, setEmail] = useState('');
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (open) {
      fetchMembers();
    }
  }, [open, projectId]);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('project_members')
        .select(`
          user_id,
          role,
          profiles!project_members_user_id_fkey (
            email,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('project_id', projectId);

      if (error) throw error;

      const formattedMembers = data?.map((member: any) => ({
        user_id: member.user_id,
        role: member.role,
        email: member.profiles?.email || '',
        first_name: member.profiles?.first_name,
        last_name: member.profiles?.last_name,
        avatar_url: member.profiles?.avatar_url,
      })) || [];

      setMembers(formattedMembers);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleInvite = async () => {
    if (!email.trim()) {
      toast({
        title: 'Email required',
        description: 'Please enter an email address',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `https://xtawnkhvxgxylhxwqnmm.supabase.co/functions/v1/invite-project-member`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            project_id: projectId,
            email: email.trim(),
            role: 'viewer',
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send invitation');
      }

      toast({
        title: 'Invitation sent',
        description: `Invitation sent to ${email}`,
      });

      setEmail('');
      fetchMembers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send invitation',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      // Enable public BIM access for this project
      const { error } = await supabase
        .from('projects')
        .update({ allow_public_bim_access: true })
        .eq('id', projectId);

      if (error) {
        console.error('Error enabling public access:', error);
        toast({
          title: 'Error',
          description: 'Failed to enable public access',
          variant: 'destructive',
        });
        return;
      }

      // Use custom domain for professional branded links
      const url = `https://www.skrobakios.com/?page=project-bim&projectId=${projectId}`;
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      toast({
        title: 'Public link copied',
        description: 'Anyone with this link can view the BIM model without logging in',
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
      toast({
        title: 'Error',
        description: 'Failed to copy link',
        variant: 'destructive',
      });
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('project_members')
        .update({ role: newRole })
        .eq('project_id', projectId)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'Role updated',
        description: 'Member role has been updated',
      });

      fetchMembers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update role',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'Member removed',
        description: 'Member has been removed from the project',
      });

      fetchMembers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove member',
        variant: 'destructive',
      });
    }
  };

  const getInitials = (firstName: string | null, lastName: string | null, email: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return email[0].toUpperCase();
  };

  const currentUserMember = members.find(m => m.user_id === user?.id);
  const isOwnerOrAdmin = currentUserMember?.role === 'owner' || currentUserMember?.role === 'admin';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] bg-white/95 backdrop-blur-xl border border-border/30 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center justify-between pr-8">
            Share this project
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopyLink}
              className="h-8 w-8 text-luxury-gold hover:text-luxury-gold/80"
            >
              {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Public Link Info Banner */}
          <div className="bg-luxury-gold/10 border border-luxury-gold/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-luxury-gold/20 flex items-center justify-center flex-shrink-0">
                <Globe className="h-4 w-4 text-luxury-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-foreground mb-1">Public BIM Viewer Link</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Anyone with this link can view the BIM model without logging in. No authentication required. Perfect for sharing with clients, contractors, or stakeholders.
                </p>
              </div>
            </div>
          </div>

          {/* Invite Section */}
          {isOwnerOrAdmin && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Add comma separated emails to invite"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                  className="flex-1 bg-background/60 border-border/30"
                />
                <Button
                  onClick={handleInvite}
                  disabled={isLoading || !email.trim()}
                  className="bg-luxury-gold hover:bg-luxury-gold/90 text-white"
                >
                  Invite
                </Button>
              </div>
            </div>
          )}

          {/* Members List */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Who has access</h3>
            
            <div className="space-y-2">
              {/* Public Access */}
              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-accent/20 border border-border/30">
                <div className="flex items-center gap-3 flex-1">
                  <div className="h-8 w-8 rounded-full bg-luxury-gold/20 flex items-center justify-center">
                    <Globe className="h-4 w-4 text-luxury-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">Anyone with the link</div>
                    <div className="text-xs text-muted-foreground">No sign-in required • View only</div>
                  </div>
                </div>
                <span className="text-sm font-medium text-luxury-gold">Public</span>
              </div>

              {/* Project Members */}
              {members.map((member) => {
                const isCurrentUser = member.user_id === user?.id;
                const displayName = member.first_name && member.last_name
                  ? `${member.first_name} ${member.last_name}`
                  : member.email;

                return (
                  <div
                    key={member.user_id}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent/30 transition-colors group"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar_url || undefined} />
                        <AvatarFallback className="bg-luxury-gold/10 text-luxury-gold text-xs">
                          {getInitials(member.first_name, member.last_name, member.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {displayName}
                          {isCurrentUser && <span className="text-muted-foreground ml-1">(you)</span>}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{member.email}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {isOwnerOrAdmin && !isCurrentUser ? (
                        <>
                          <Select
                            value={member.role}
                            onValueChange={(value) => handleRoleChange(member.user_id, value)}
                          >
                            <SelectTrigger className="w-32 h-8 text-xs bg-background/60 border-border/30">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="owner">Owner</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="member">Can edit</SelectItem>
                              <SelectItem value="viewer">Can view</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveMember(member.user_id)}
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground capitalize">{member.role}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
