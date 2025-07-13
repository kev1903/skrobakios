import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User, Shield, ArrowLeft, Save, Key, Eye, EyeOff } from 'lucide-react';
import { HierarchicalUser } from '@/types/hierarchicalUser';
import { useAdminProfile } from '@/hooks/useAdminProfile';
import { useUserRole } from '@/hooks/useUserRole';
import { useHierarchicalUserManagement } from '@/hooks/useHierarchicalUserManagement';
import { supabase } from '@/integrations/supabase/client';
import { HierarchicalRoleManagement } from './HierarchicalRoleManagement';
import { toast } from '@/hooks/use-toast';

export const UserProfileEditPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  
  const { loading, fetchUserProfile, saveUserProfile } = useAdminProfile();
  const { isSuperAdmin } = useUserRole();
  const { users, addUserAppRole, removeUserAppRole, refreshUsers } = useHierarchicalUserManagement();
  
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [credentialsData, setCredentialsData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [user, setUser] = useState<HierarchicalUser | null>(null);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    job_title: '',
    company: '',
    location: '',
    bio: '',
    avatar_url: '',
    birth_date: '',
    website: '',
    company_slogan: '',
  });

  // Find user from the list when users are loaded
  useEffect(() => {
    if (users.length > 0 && userId) {
      const foundUser = users.find(u => u.user_id === userId);
      if (foundUser) {
        setUser(foundUser);
      }
    }
  }, [users, userId]);

  // Load user profile when user is found
  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  // Redirect if no userId provided
  useEffect(() => {
    if (!userId) {
      navigate('/?page=platform-dashboard');
    }
  }, [userId, navigate]);

  const loadUserProfile = async () => {
    if (!user) return;

    const profile = await fetchUserProfile(user.user_id);
    if (profile) {
      setProfileData(profile);
      setCredentialsData(prev => ({
        ...prev,
        email: profile.email || ''
      }));
    } else {
      // Initialize with existing user data if no profile exists
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        job_title: '',
        company: user.company || '',
        location: '',
        bio: '',
        avatar_url: user.avatar_url || '',
        birth_date: '',
        website: '',
        company_slogan: '',
      });
      setCredentialsData(prev => ({
        ...prev,
        email: user.email || ''
      }));
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCredentialsChange = (field: string, value: string) => {
    setCredentialsData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    
    try {
      // Save profile data
      const profileSuccess = await saveUserProfile(user.user_id, profileData);
      
      if (!profileSuccess) {
        setSaving(false);
        return;
      }

      // Update email if changed
      if (credentialsData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: credentialsData.email
        });
        
        if (emailError) {
          toast({
            title: "Email Update Failed",
            description: emailError.message,
            variant: "destructive",
          });
          setSaving(false);
          return;
        }
      }

      // Update password if provided
      if (credentialsData.newPassword) {
        if (credentialsData.newPassword !== credentialsData.confirmPassword) {
          toast({
            title: "Password Mismatch",
            description: "New password and confirm password do not match.",
            variant: "destructive",
          });
          setSaving(false);
          return;
        }

        if (credentialsData.newPassword.length < 6) {
          toast({
            title: "Password Too Short",
            description: "Password must be at least 6 characters long.",
            variant: "destructive",
          });
          setSaving(false);
          return;
        }

        const { error: passwordError } = await supabase.auth.updateUser({
          password: credentialsData.newPassword
        });
        
        if (passwordError) {
          toast({
            title: "Password Update Failed",
            description: passwordError.message,
            variant: "destructive",
          });
          setSaving(false);
          return;
        }
      }

      toast({
        title: "Profile Updated",
        description: "User profile and credentials have been successfully updated.",
      });
      refreshUsers();
      navigate('/?page=platform-dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "An error occurred while updating the profile.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate('/?page=platform-dashboard');
  };

  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>User Not Found</CardTitle>
            <CardDescription>
              The requested user could not be found.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleBack} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to User Management
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <User className="w-8 h-8" />
                Edit User Profile
              </h1>
              {user && (
                <p className="text-muted-foreground">
                  Update profile information for {user.first_name} {user.last_name}
                </p>
              )}
            </div>
          </div>
          <Button onClick={handleSave} disabled={loading || saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-3 text-lg">Loading profile...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Avatar and Basic Info */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center gap-4">
                    <Avatar className="w-32 h-32">
                      <AvatarImage src={profileData.avatar_url} />
                      <AvatarFallback className="text-2xl">
                        {profileData.first_name?.charAt(0)}{profileData.last_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="w-full">
                      <Label htmlFor="avatar_url">Avatar URL</Label>
                      <Input
                        id="avatar_url"
                        value={profileData.avatar_url}
                        onChange={(e) => handleInputChange('avatar_url', e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Basic personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={profileData.first_name}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={profileData.last_name}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="birth_date">Birth Date</Label>
                      <Input
                        id="birth_date"
                        type="date"
                        value={profileData.birth_date}
                        onChange={(e) => handleInputChange('birth_date', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={4}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Professional Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Professional Information</CardTitle>
                  <CardDescription>
                    Work-related details and company information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="job_title">Job Title</Label>
                      <Input
                        id="job_title"
                        value={profileData.job_title}
                        onChange={(e) => handleInputChange('job_title', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={profileData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={profileData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={profileData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="company_slogan">Company Slogan</Label>
                    <Input
                      id="company_slogan"
                      value={profileData.company_slogan}
                      onChange={(e) => handleInputChange('company_slogan', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Login Credentials */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    Login Credentials
                  </CardTitle>
                  <CardDescription>
                    Manage authentication credentials and security settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="credentials_email">Email Address</Label>
                    <Input
                      id="credentials_email"
                      type="email"
                      value={credentialsData.email}
                      onChange={(e) => handleCredentialsChange('email', e.target.value)}
                      placeholder="user@example.com"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      This email will be used for login and notifications
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="new_password">New Password</Label>
                      <div className="relative">
                        <Input
                          id="new_password"
                          type={showPassword ? "text" : "password"}
                          value={credentialsData.newPassword}
                          onChange={(e) => handleCredentialsChange('newPassword', e.target.value)}
                          placeholder="Enter new password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Leave blank to keep current password
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="confirm_password">Confirm Password</Label>
                      <Input
                        id="confirm_password"
                        type={showPassword ? "text" : "password"}
                        value={credentialsData.confirmPassword}
                        onChange={(e) => handleCredentialsChange('confirmPassword', e.target.value)}
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Security Notes:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Password must be at least 6 characters long</li>
                      <li>• Email changes may require verification</li>
                      <li>• User will be notified of credential changes</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Role Management Section - Only for SuperAdmins */}
              {isSuperAdmin() && user && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Role Management
                    </CardTitle>
                    <CardDescription>
                      Manage user roles and permissions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <HierarchicalRoleManagement
                      user={user}
                      onAddRole={addUserAppRole}
                      onRemoveRole={removeUserAppRole}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};