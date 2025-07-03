import React, { useState } from 'react';
import { ArrowLeft, User, Mail, Send } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from './AccessManagementTable';

const ROLES: UserRole[] = [
  'Super Admin',
  'Project Manager',
  'Project Admin',
  'Consultant',
  'SubContractor',
  'Estimator',
  'Accounts',
  'Client Viewer',
];

interface NewUserPageProps {
  onNavigate: (page: string) => void;
}

export const NewUserPage = ({ onNavigate }: NewUserPageProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Client Viewer' as UserRole,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Name is required",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Email is required",
        variant: "destructive",
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const mapRoleToDbRole = (role: UserRole): 'superadmin' | 'admin' | 'user' => {
    switch (role) {
      case 'Super Admin':
        return 'superadmin';
      case 'Project Manager':
      case 'Project Admin':
      case 'Consultant':
      case 'SubContractor':
      case 'Estimator':
      case 'Accounts':
        return 'admin';
      default:
        return 'user';
    }
  };

  const handleSendInvite = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (!user) {
        throw new Error('You must be logged in to send invitations');
      }

      // Call edge function to send invitation email and create record
      const { error: emailError } = await supabase.functions.invoke('send-user-invitation', {
        body: {
          email: formData.email,
          name: formData.name,
          role: formData.role,
          invitedBy: user.email || 'Admin',
        }
      });

      if (emailError) {
        throw emailError;
      }

      toast({
        title: "Success",
        description: `Invitation sent to ${formData.email}`,
      });

      // Navigate back to admin panel
      onNavigate('admin');

    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send invitation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onNavigate('admin');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admin
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invite New User</h1>
          <p className="text-gray-600 mt-1">Send an invitation to join the platform</p>
        </div>
      </div>

      {/* Form */}
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
            />
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label>Role *</Label>
            <Select
              value={formData.role}
              onValueChange={(value: UserRole) => handleInputChange('role', value)}
            >
              <SelectTrigger className="input-glass">
                <SelectValue />
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
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendInvite}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {loading ? 'Sending Invite...' : 'Send Invite'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};