import React from 'react';
import { User, Mail, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { UserRole } from '../types';
import { ROLES } from '../types';
import { useUserInvitation } from '../hooks/useUserInvitation';
import { validateInvitationForm } from '../utils/formValidation';

interface UserInvitationFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export const UserInvitationForm = ({ onCancel, onSuccess }: UserInvitationFormProps) => {
  const { toast } = useToast();
  const { formData, loading, handleInputChange, sendInvitation } = useUserInvitation(onSuccess);

  const handleSubmit = async () => {
    const validation = validateInvitationForm(formData);
    
    if (!validation.isValid && validation.error) {
      toast({
        title: validation.error.title,
        description: validation.error.description,
        variant: "destructive",
      });
      return;
    }

    await sendInvitation();
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="heading-modern text-gradient flex items-center gap-2">
          <User className="h-5 w-5" />
          User Invitation
        </CardTitle>
        <CardDescription>
          Enter the user details and they will receive an email invitation to join
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter full name"
            className="input-glass"
            disabled={loading}
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Address *
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter email address"
            className="input-glass"
            disabled={loading}
          />
        </div>

        {/* Role Selection */}
        <div className="space-y-2">
          <Label>Role *</Label>
          <Select
            value={formData.role}
            onValueChange={(value: UserRole) => handleInputChange('role', value)}
            disabled={loading}
          >
            <SelectTrigger className="input-glass">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {loading ? 'Sending Invite...' : 'Send Invite'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};