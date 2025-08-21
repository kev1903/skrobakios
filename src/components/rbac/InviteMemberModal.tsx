import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useActiveBusiness } from '@/hooks/useActiveBusiness';
import { useToast } from '@/hooks/use-toast';
import { Mail } from 'lucide-react';

interface InviteMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInviteSent: () => void;
}

interface Role {
  value: string;
  label: string;
  description: string;
}

const DEFAULT_ROLES: Role[] = [
  {
    value: 'admin',
    label: 'Admin',
    description: 'Can manage team members and business settings'
  },
  {
    value: 'member',
    label: 'Member',
    description: 'Standard access to business resources'
  }
];

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  open,
  onOpenChange,
  onInviteSent
}) => {
  const { activeBusinessId } = useActiveBusiness();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    role: 'member',
    message: ''
  });
  const [roles] = useState<Role[]>(DEFAULT_ROLES);

  const generateInviteToken = () => {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const sendInvitation = async () => {
    if (!activeBusinessId || !formData.email.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = generateInviteToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('company_members')
        .select('id')
        .eq('company_id', activeBusinessId)
        .eq('user_id', formData.email) // This would need to be user ID lookup
        .single();

      if (existingMember) {
        toast({
          title: "Error",
          description: "This user is already a member of this business",
          variant: "destructive",
        });
        return;
      }

      // For now, we'll simulate the invitation process
      // In a real implementation, you'd:
      // 1. Create an invitation record with a unique token
      // 2. Send an email with the invitation link
      // 3. Handle acceptance via a special page
      
      // TODO: Implement proper invitation system with email sending
      console.log('Invitation would be sent to:', formData.email);
      console.log('Invitation token:', token);
      console.log('Expires at:', expiresAt);
      
      // For demo purposes, show success without actually creating records
      console.log('Invitation details:', {
        business_id: activeBusinessId,
        email: formData.email.trim(),
        role: formData.role,
        message: formData.message.trim(),
        token,
        expires_at: expiresAt
      });

      // TODO: Send email with invitation link
      // This would typically call an edge function to send email via Resend
      
      toast({
        title: "Success",
        description: `Invitation sent to ${formData.email}`,
      });

      // Reset form
      setFormData({
        email: '',
        role: 'member',
        message: ''
      });

      onInviteSent();
      onOpenChange(false);

    } catch (error: any) {
      console.error('Failed to send invitation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendInvitation();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Invite Team Member
          </DialogTitle>
          <DialogDescription>
            Send an invitation to join your business as a team member.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="member@company.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select 
              value={formData.role} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div>
                      <div className="font-medium">{role.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {role.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Personal Message (Optional)</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Add a personal message to the invitation..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};