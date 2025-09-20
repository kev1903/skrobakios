import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye, EyeOff, RefreshCw, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface CreateUserForBusinessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  companyName: string;
  onUserCreated: () => void;
}

interface AvailableUser {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  current_role: string;
}

export const CreateUserForBusinessDialog = ({ 
  open, 
  onOpenChange, 
  companyId, 
  companyName,
  onUserCreated 
}: CreateUserForBusinessDialogProps) => {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [matchingUsers, setMatchingUsers] = useState<AvailableUser[]>([]);
  const [emailSearched, setEmailSearched] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'admin' as 'admin' | 'manager' | 'supplier' | 'sub_contractor' | 'consultant' | 'client'
  });

  useEffect(() => {
    if (open) {
      fetchAvailableUsers();
    }
  }, [open]);

  const fetchAvailableUsers = async () => {
    if (!user) return;

    try {
      // Get all users from the platform
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('user_id, email, first_name, last_name, avatar_url, status')
        .eq('status', 'active')
        .order('first_name', { ascending: true });

      if (error) {
        console.error('Error fetching available users:', error);
        return;
      }

      // Get user roles for all users
      const userIds = profiles?.map(p => p.user_id).filter(Boolean) || [];
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      // Map roles by user_id for easier lookup
      const roleMap = new Map();
      (userRoles || []).forEach(ur => {
        roleMap.set(ur.user_id, ur.role);
      });

      // Transform profiles to available users format
      const eligibleUsers = (profiles || []).map((profile) => ({
        user_id: profile.user_id,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        avatar_url: profile.avatar_url,
        current_role: roleMap.get(profile.user_id) || 'user'
      }));

      setAvailableUsers(eligibleUsers);
    } catch (error) {
      console.error('Error fetching available users:', error);
    }
  };

  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    
    // Ensure at least one character from each type
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*";
    
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    setFormData(prev => ({ ...prev, password }));
    toast({
      title: "Password Generated",
      description: "A secure password has been generated",
    });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.firstName) {
      toast({
        title: "Error",
        description: "Email, password, and first name are required",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      // Create user through edge function
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found. Please login again.');

      const { data, error } = await supabase.functions.invoke('create-user-manually', {
        body: {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          companyId: companyId,
          companyRole: formData.role,
          appRole: formData.role === 'admin' ? 'business_admin' : 'user'
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to create user');
      }

      if (!data || !data.success) {
        const errorMsg = data?.error || 'User creation failed';
        throw new Error(errorMsg);
      }

      const roleLabel = formData.role === 'admin' ? 'Business Admin' : 
                       formData.role === 'manager' ? 'Manager' :
                       formData.role === 'supplier' ? 'Supplier' :
                       formData.role === 'sub_contractor' ? 'Sub-Contractor' :
                       formData.role === 'consultant' ? 'Consultant' :
                       formData.role === 'client' ? 'Client' : formData.role;

      toast({
        title: "Success",
        description: `${roleLabel} ${formData.email} created and added to ${companyName} successfully`,
      });

      // Reset form and close dialog
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'admin'
      });
      onOpenChange(false);
      
      // Trigger immediate refresh 
      onUserCreated();

    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const assignExistingUser = async () => {
    if (!selectedUser) {
      toast({
        title: "Error",
        description: "Please select a user to assign",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      // Add user to company as admin
      const { error: companyError } = await supabase
        .from('company_members')
        .upsert({
          company_id: companyId,
          user_id: selectedUser,
          role: formData.role,
          status: 'active'
        });

      if (companyError) {
        throw new Error('Failed to assign user to company');
      }

      // If assigning as business admin, also update their app role
      if (formData.role === 'admin') {
        const { data: roleResult, error: roleError } = await supabase.rpc('set_user_primary_role', {
          target_user_id: selectedUser,
          new_role: 'business_admin'
        });

        const result = roleResult as any;
        if (roleError || !result?.success) {
          console.warn('Failed to update app role, but assigned to company');
        }
      }

      const selectedUserInfo = availableUsers.find(u => u.user_id === selectedUser);
      const roleLabel = formData.role === 'admin' ? 'Business Admin' : 
                       formData.role === 'manager' ? 'Manager' :
                       formData.role === 'supplier' ? 'Supplier' :
                       formData.role === 'sub_contractor' ? 'Sub-Contractor' :
                       formData.role === 'consultant' ? 'Consultant' :
                       formData.role === 'client' ? 'Client' : formData.role;

      toast({
        title: "Success",
        description: `${selectedUserInfo?.first_name} ${selectedUserInfo?.last_name} assigned as ${roleLabel} to ${companyName}`,
      });

      // Reset form and close dialog
      setSelectedUser('');
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'admin'
      });
      onOpenChange(false);
      
      // Trigger immediate refresh 
      onUserCreated();

    } catch (error: any) {
      console.error('Error assigning user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign user",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // If email field is being changed, search for existing users
    if (field === 'email') {
      handleEmailSearch(value);
    }
  };

  const handleEmailSearch = (email: string) => {
    if (!email.trim()) {
      setMatchingUsers([]);
      setEmailSearched(false);
      setSelectedUser('');
      return;
    }

    const matches = availableUsers.filter(user => 
      user.email.toLowerCase() === email.toLowerCase().trim()
    );
    
    setMatchingUsers(matches);
    setEmailSearched(true);
    
    // If we have matches, clear new user fields and auto-select if only one match
    if (matches.length > 0) {
      if (matches.length === 1) {
        setSelectedUser(matches[0].user_id);
      }
      // Clear new user fields since we found existing users
      setFormData(prev => ({ 
        ...prev, 
        firstName: '', 
        lastName: '', 
        password: '' 
      }));
    } else {
      setSelectedUser('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) {
        setSelectedUser('');
        setFormData({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          role: 'admin'
        });
        setMatchingUsers([]);
        setEmailSearched(false);
      }
    }}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Team Member to {companyName}
          </DialogTitle>
          <DialogDescription>
            Add an existing user or create a new user account for this business.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Email field at the top */}
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              required
            />
          </div>

          {/* Show existing users if found */}
          {emailSearched && matchingUsers.length > 0 && (
            <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/20">
              <Label className="text-blue-700 dark:text-blue-300">Existing Users Found</Label>
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
                We found existing users with this email. Select one to add them to the company:
              </p>
              
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an existing user" />
                </SelectTrigger>
                <SelectContent>
                  {matchingUsers.map((user) => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user.avatar_url || ''} />
                          <AvatarFallback className="text-xs">
                            {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.first_name} {user.last_name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* New user fields - show if no email entered yet OR no matching users found */}
          {(!emailSearched || matchingUsers.length === 0) && (
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="John"
                    required={emailSearched && matchingUsers.length === 0}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Doe"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter secure password"
                    className="pr-20"
                    required={emailSearched && matchingUsers.length === 0}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className="h-8 w-8 p-0"
                      title={showPassword ? "Hide Password" : "Show Password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={generatePassword}
                      className="h-8 w-8 p-0"
                      title="Generate Password"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Role selection - always show when email is entered */}
          {formData.email && (
            <div>
              <Label htmlFor="role">Role in Company</Label>
              <Select value={formData.role} onValueChange={(value: any) => handleInputChange('role', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Business Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="supplier">Supplier</SelectItem>
                  <SelectItem value="sub_contractor">Sub-Contractor</SelectItem>
                  <SelectItem value="consultant">Consultant</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Action buttons */}
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            
            {/* Show appropriate action button based on context */}
            {emailSearched && matchingUsers.length > 0 ? (
              <Button onClick={assignExistingUser} disabled={!selectedUser || isCreating}>
                {isCreating ? 'Adding...' : 'Add User'}
              </Button>
            ) : (
              <Button 
                onClick={handleCreateUser} 
                disabled={isCreating || !formData.email || (emailSearched && matchingUsers.length === 0 && (!formData.firstName || !formData.password))}
              >
                {isCreating ? 'Creating...' : 'Create User'}
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};