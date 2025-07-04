import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { UserRole } from './types';
import { supabase } from '@/integrations/supabase/client';
import { mapDisplayRoleToDatabase } from '@/utils/roleMapping';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ROLES: UserRole[] = [
  'Project Manager',
  'Project Admin',
  'Consultant',
  'SubContractor',
  'Estimator',
  'Accounts',
  'Client Viewer',
];

export const AddUserDialog = ({ open, onOpenChange }: AddUserDialogProps) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !role) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Starting user invitation process...', { firstName, lastName, email, role });
      
      // Check if user with this email already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email.trim())
        .single();

      if (existingProfile) {
        toast({
          title: "Email Already Exists",
          description: "A user with this email address already exists.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      console.log('No existing profile found, proceeding with invitation...');

      // Get current user info for the invitation
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('You must be logged in to send invitations');
      }

      console.log('Current user verified, calling edge function...');

      // Call edge function to send invitation email and create records
      const { data: invitationResult, error: invitationError } = await supabase.functions.invoke('send-user-invitation', {
        body: {
          email: email.trim(),
          name: `${firstName.trim()} ${lastName.trim()}`,
          role: role,
          invitedBy: currentUser.user.email || 'Admin'
        }
      });

      console.log('Edge function response:', { invitationResult, invitationError });

      if (invitationError) {
        console.error('Error calling invitation function:', invitationError);
        throw new Error(`Edge function error: ${invitationError.message}`);
      }

      if (!invitationResult?.success) {
        console.error('Edge function returned failure:', invitationResult);
        throw new Error(invitationResult?.error || 'Failed to send invitation');
      }

      console.log('Invitation sent successfully!');
      
      toast({
        title: "User Invited",
        description: `${firstName} ${lastName} has been invited successfully and will receive an email.`,
      });
      
      // Reset form and close dialog
      setFirstName('');
      setLastName('');
      setEmail('');
      setRole('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to invite user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFirstName('');
      setLastName('');
      setEmail('');
      setRole('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New User
          </DialogTitle>
          <DialogDescription>
            Enter the new user's information to send them an invitation.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter first name"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter last name"
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value: UserRole) => setRole(value)} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((roleOption) => (
                  <SelectItem key={roleOption} value={roleOption}>
                    {roleOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Invite'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};