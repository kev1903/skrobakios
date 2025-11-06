import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye, EyeOff, RefreshCw, UserPlus, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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
  const [selectedUser, setSelectedUser] = useState<AvailableUser | null>(null);
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'team_member'
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

      console.log('Fetched profiles:', profiles?.length);

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
        email: profile.email || '',
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        avatar_url: profile.avatar_url,
        current_role: roleMap.get(profile.user_id) || 'user'
      }));

      console.log('Available users loaded:', eligibleUsers.length);
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
          appRole: 'user'
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to create user');
      }

      if (!data || !data.success) {
        const errorMsg = data?.error || 'User creation failed';
        throw new Error(errorMsg);
      }

      const roleLabel = 'Team Member';

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
        role: 'team_member'
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
          user_id: selectedUser.user_id,
          role: formData.role,
          status: 'active'
        });

      if (companyError) {
        throw new Error('Failed to assign user to company');
      }

      // All assigned users get "user" app role
      const { data: roleResult, error: roleError } = await supabase.rpc('set_user_primary_role', {
        target_user_id: selectedUser.user_id,
        new_role: 'user'
      });

      const result = roleResult as any;
      if (roleError || !result?.success) {
        console.warn('Failed to update app role, but assigned to company');
      }

      const roleLabel = 'Team Member';

      toast({
        title: "Success",
        description: `${selectedUser.first_name} ${selectedUser.last_name} assigned as ${roleLabel} to ${companyName}`,
      });

      // Reset form and close dialog
      setSelectedUser(null);
      setSearchValue('');
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'team_member'
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
  };

  const filteredUsers = availableUsers.filter(user => {
    const search = searchValue.toLowerCase();
    const emailMatch = user.email?.toLowerCase().includes(search);
    const firstNameMatch = user.first_name?.toLowerCase().includes(search);
    const lastNameMatch = user.last_name?.toLowerCase().includes(search);
    
    const matches = emailMatch || firstNameMatch || lastNameMatch;
    
    // Detailed logging for debugging
    if (searchValue.length > 0) {
      console.log(`🔎 Checking user:`, {
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        searchTerm: search,
        emailMatch,
        firstNameMatch,
        lastNameMatch,
        finalMatch: matches
      });
    }
    
    return matches;
  });

  console.log('🔍 Search value:', searchValue);
  console.log('📊 Available users:', availableUsers.length);
  console.log('✅ Filtered users:', filteredUsers.length);
  if (searchValue.length > 0) {
    console.log('🎯 Filtered results:', filteredUsers.map(u => u.email));
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) {
        setSelectedUser(null);
        setSearchValue('');
        setFormData({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          role: 'team_member'
        });
      }
    }}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Team Member to {companyName}
          </DialogTitle>
          <DialogDescription>
            Search for an existing user or create a new user account for this business.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* User Search Combobox */}
          <div className="space-y-2">
            <Label>Search Existing User</Label>
            <div className="relative">
              <Input
                placeholder="Search by name or email..."
                value={searchValue}
                onChange={(e) => {
                  const value = e.target.value;
                  console.log('✏️ Typing:', value);
                  setSearchValue(value);
                  setOpenCombobox(value.length > 0);
                }}
                onFocus={() => {
                  console.log('🔍 Input focused');
                  if (searchValue.length > 0) setOpenCombobox(true);
                }}
                className="w-full"
              />
              
              {openCombobox && filteredUsers.length > 0 && (
                <div className="absolute w-full mt-1 bg-background border rounded-lg shadow-lg z-[100] max-h-[300px] overflow-auto">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.user_id}
                      onClick={() => {
                        console.log('👤 User selected:', user.email);
                        setSelectedUser(user);
                        setSearchValue('');
                        setOpenCombobox(false);
                        setFormData(prev => ({
                          ...prev,
                          email: user.email,
                          firstName: '',
                          lastName: '',
                          password: ''
                        }));
                      }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-accent cursor-pointer transition-colors"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar_url || ''} />
                        <AvatarFallback className="text-xs">
                          {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col flex-1">
                        <span className="font-medium">{user.first_name} {user.last_name}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                      {selectedUser?.user_id === user.user_id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {selectedUser && (
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedUser.avatar_url || ''} />
                    <AvatarFallback>
                      {selectedUser.first_name?.charAt(0)}{selectedUser.last_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedUser.first_name} {selectedUser.last_name}</p>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedUser(null);
                    setFormData(prev => ({ ...prev, email: '' }));
                  }}
                >
                  Clear
                </Button>
              </div>
            )}
          </div>

          {/* Divider */}
          {!selectedUser && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or create new user
                  </span>
                </div>
              </div>

              {/* New user fields */}
              <form onSubmit={handleCreateUser} className="space-y-4">
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="John"
                      required
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
                      required
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
            </>
          )}

          {/* Action buttons */}
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            
            {selectedUser ? (
              <Button onClick={assignExistingUser} disabled={isCreating}>
                {isCreating ? 'Adding...' : 'Add User to Company'}
              </Button>
            ) : (
              <Button 
                onClick={handleCreateUser} 
                disabled={isCreating || !formData.email || !formData.firstName || !formData.password}
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