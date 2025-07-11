import React, { useState } from 'react';
import { UserPlus, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ROLES, ROLE_DISPLAY_NAMES, type UserRole } from './types';

interface DirectUserCreationFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

interface CreatedUserInfo {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  temporary_password: string;
}

export const DirectUserCreationForm = ({ onCancel, onSuccess }: DirectUserCreationFormProps) => {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: '' as UserRole | '',
    company: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [createdUser, setCreatedUser] = useState<CreatedUserInfo | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.first_name || !formData.last_name || !formData.role) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Creating user directly:', formData);
      
      // Get the current user's session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('You must be logged in to create users');
      }

      const response = await fetch(`https://xtawnkhvxgxylhxwqnmm.supabase.co/functions/v1/create-user-direct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0YXdua2h2eGd4eWxoeHdxbm1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NDUyMjksImV4cCI6MjA2NjUyMTIyOX0.Ip_bdI4HjsfUdsy6WXLJwvQ2mo_Cm0lBAB50nJt5OPw'
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          role: formData.role,
          company: formData.company.trim() || undefined,
          phone: formData.phone.trim() || undefined
        })
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      let responseData;
      const responseText = await response.text();
      console.log('Raw response text:', responseText);
      
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        responseData = { error: 'Invalid response format', details: responseText };
      }

      console.log('Parsed response data:', responseData);

      if (!response.ok) {
        const errorMessage = responseData?.error || responseData?.details || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      if (!responseData?.success) {
        throw new Error(responseData?.error || responseData?.details || 'Failed to create user');
      }

      setCreatedUser(responseData.user);
      
      toast({
        title: "User Created Successfully",
        description: `${formData.first_name} ${formData.last_name} has been created with temporary credentials.`,
      });

    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyPassword = async () => {
    if (createdUser?.temporary_password) {
      try {
        await navigator.clipboard.writeText(createdUser.temporary_password);
        setPasswordCopied(true);
        toast({
          title: "Password Copied",
          description: "Temporary password has been copied to clipboard.",
        });
        setTimeout(() => setPasswordCopied(false), 2000);
      } catch (error) {
        toast({
          title: "Copy Failed",
          description: "Could not copy password to clipboard.",
          variant: "destructive",
        });
      }
    }
  };

  const handleFinish = () => {
    setCreatedUser(null);
    setFormData({
      email: '',
      first_name: '',
      last_name: '',
      role: '',
      company: '',
      phone: ''
    });
    onSuccess();
  };

  if (createdUser) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="heading-modern text-gradient flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            User Created Successfully
          </CardTitle>
          <CardDescription>
            The user account has been created with temporary credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertDescription>
              <strong>Important:</strong> The user must change their password on first login.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={`${createdUser.first_name} ${createdUser.last_name}`}
                readOnly
                className="input-glass"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={createdUser.email}
                readOnly
                className="input-glass"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input
                value={ROLE_DISPLAY_NAMES[createdUser.role as UserRole]}
                readOnly
                className="input-glass"
              />
            </div>
            <div className="space-y-2">
              <Label>Temporary Password</Label>
              <div className="flex gap-2">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={createdUser.temporary_password}
                  readOnly
                  className="input-glass"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={copyPassword}
                  disabled={passwordCopied}
                >
                  {passwordCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <Alert>
            <AlertDescription>
              Please provide the user with their email and temporary password. They will be required to change the password upon first login.
            </AlertDescription>
          </Alert>

          <div className="flex items-center justify-end gap-3 pt-6 border-t">
            <Button
              onClick={handleFinish}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Create Another User
            </Button>
            <Button
              variant="outline"
              onClick={onSuccess}
            >
              Done
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="heading-modern text-gradient flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Create New User
        </CardTitle>
        <CardDescription>
          Create a new user account with temporary password that must be changed on first login
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                placeholder="Enter first name"
                className="input-glass"
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="Enter last name"
                className="input-glass"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              className="input-glass"
              disabled={loading}
              required
            />
          </div>

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
                    {ROLE_DISPLAY_NAMES[role]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="Enter company name"
                className="input-glass"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter phone number"
                className="input-glass"
                disabled={loading}
              />
            </div>
          </div>

          <Alert>
            <AlertDescription>
              A temporary password will be generated for this user. They will be required to change it upon first login.
            </AlertDescription>
          </Alert>

          <div className="flex items-center justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              {loading ? 'Creating User...' : 'Create User'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};