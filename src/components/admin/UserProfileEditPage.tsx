import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User, Shield, ArrowLeft, Save, Key, Eye, EyeOff, RefreshCw, Mail } from 'lucide-react';
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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [credentialsData, setCredentialsData] = useState({
    email: '',
    currentPassword: '',
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

  const handleResetPassword = async () => {
    if (!user?.email) {
      toast({
        title: "Email Required",
        description: "User email is required to reset password.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        toast({
          title: "Reset Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Password Reset Sent",
        description: "A password reset link has been sent to the user's email.",
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: "Reset Failed",
        description: "An error occurred while sending the password reset email.",
        variant: "destructive",
      });
    }
  };

  const handleSecurePasswordReset = async () => {
    if (!user?.email) {
      toast({
        title: "Email Required",
        description: "User email is required to send password reset.",
        variant: "destructive",
      });
      return;
    }

    if (!isSuperAdmin()) {
      toast({
        title: "Access Denied",
        description: "Only superadmins can initiate password resets.",
        variant: "destructive",
      });
      return;
    }

    setSendingReset(true);
    
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        throw new Error('Authentication required');
      }

      const { data, error } = await supabase.functions.invoke('send-password-reset', {
        body: {
          userEmail: user.email,
          adminEmail: currentUser.email,
        },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) {
        console.error('Password reset error:', error);
        toast({
          title: "Reset Failed",
          description: error.message || "Edge Function returned a non-2xx status code",
          variant: "destructive",
        });
        return;
      }

      if (data?.error) {
        console.error('Password reset data error:', data.error);
        toast({
          title: "Reset Failed",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Password Reset Sent",
        description: "A secure password reset email has been sent to the user with enhanced security features.",
      });
    } catch (error) {
      console.error('Error sending password reset:', error);
      toast({
        title: "Reset Failed",
        description: "An error occurred while sending the password reset email.",
        variant: "destructive",
      });
    } finally {
      setSendingReset(false);
    }
  };

  const handleEmailCredentials = async () => {
    if (!user) return;

    // Validate that a password is provided
    if (!credentialsData.newPassword) {
      toast({
        title: "Password Required",
        description: "Please enter a new password before sending credentials.",
        variant: "destructive",
      });
      return;
    }

    setSendingEmail(true);
    
    try {
      const { error } = await supabase.functions.invoke('send-login-credentials', {
        body: {
          userEmail: user.email,
          userName: `${user.first_name} ${user.last_name}`,
          loginEmail: credentialsData.email || user.email,
          password: credentialsData.newPassword,
        }
      });

      if (error) {
        toast({
          title: "Email Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Credentials Sent",
        description: "Login credentials have been sent to the user's email.",
      });
    } catch (error) {
      console.error('Error sending credentials:', error);
      toast({
        title: "Email Failed",
        description: "An error occurred while sending the credentials email.",
        variant: "destructive",
      });
    } finally {
      setSendingEmail(false);
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
                  <div>
                    <Label htmlFor="job_title">Job Title</Label>
                    <Input
                      id="job_title"
                      value={profileData.job_title}
                      onChange={(e) => handleInputChange('job_title', e.target.value)}
                    />
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

              {/* Secure Login Credentials */}
              <Card className="border-amber-200 bg-amber-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-800">
                    <Key className="w-5 h-5" />
                    🔒 Secure Login Credentials
                  </CardTitle>
                  <CardDescription className="text-amber-700">
                    Manage authentication credentials and security settings with enhanced protection
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Email Section */}
                  <div className="p-4 bg-white rounded-lg border border-amber-200">
                    <Label htmlFor="credentials_email" className="text-sm font-semibold text-gray-800">
                      Login Email Address
                    </Label>
                    <Input
                      id="credentials_email"
                      type="email"
                      value={credentialsData.email}
                      onChange={(e) => handleCredentialsChange('email', e.target.value)}
                      placeholder="user@example.com"
                      className="mt-2 border-amber-200 focus:border-amber-400"
                      disabled={!isSuperAdmin()}
                    />
                    <p className="text-xs text-amber-700 mt-1 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Primary authentication email - changes require verification
                    </p>
                  </div>

                  {/* Password Security Section */}
                  <div className="p-4 bg-white rounded-lg border border-red-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-red-800 flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Password Security
                        </h4>
                        <p className="text-xs text-red-600 mt-1">Administrative password management</p>
                      </div>
                      {profileData && (
                        <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full border border-blue-200">
                          Active User Account
                        </div>
                      )}
                    </div>

                    {/* Secure Password Reset */}
                    <div className="space-y-4">
                      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-red-800 text-sm">Send Secure Password Reset</h5>
                            <p className="text-xs text-red-600 mt-1">
                              Generate and send a secure password reset link to the user
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={handleSecurePasswordReset}
                            disabled={sendingReset || !isSuperAdmin()}
                            className="ml-4 bg-red-600 hover:bg-red-700"
                          >
                            {sendingReset ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                              <RefreshCw className="h-3 w-3 mr-1" />
                            )}
                            {sendingReset ? 'Sending...' : 'Send Reset'}
                          </Button>
                        </div>
                      </div>

                      {/* Legacy Password Fields - Deprecated */}
                      <div className="p-3 bg-gray-100 rounded-lg border border-gray-300 opacity-75">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded">DEPRECATED</span>
                          <h5 className="font-medium text-gray-600 text-sm">Legacy Password Management</h5>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">
                          Direct password setting is deprecated for security. Use password reset instead.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 opacity-50">
                          <div>
                            <Label htmlFor="new_password" className="text-xs text-gray-500">New Password</Label>
                            <div className="relative">
                              <Input
                                id="new_password"
                                type={showPassword ? "text" : "password"}
                                value={credentialsData.newPassword}
                                onChange={(e) => handleCredentialsChange('newPassword', e.target.value)}
                                placeholder="Use reset instead"
                                className="border-gray-300 bg-gray-50"
                                disabled
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-400" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="confirm_password" className="text-xs text-gray-500">Confirm Password</Label>
                            <Input
                              id="confirm_password"
                              type={showPassword ? "text" : "password"}
                              value={credentialsData.confirmPassword}
                              onChange={(e) => handleCredentialsChange('confirmPassword', e.target.value)}
                              placeholder="Use reset instead"
                              className="border-gray-300 bg-gray-50"
                              disabled
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Security Information */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Enhanced Security Features
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-blue-700">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Secure email-based password resets
                        </div>
                        <div className="flex items-center gap-2 text-blue-700">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Administrative action logging
                        </div>
                        <div className="flex items-center gap-2 text-blue-700">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          24-hour reset link expiration
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-blue-700">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Encrypted password storage
                        </div>
                        <div className="flex items-center gap-2 text-blue-700">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          User notification system
                        </div>
                        <div className="flex items-center gap-2 text-blue-700">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Role-based access control
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Security Warnings */}
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                      ⚠️ Security Requirements
                    </h4>
                    <ul className="text-xs text-red-700 space-y-1">
                      <li>• Only superadmins can initiate password resets for users</li>
                      <li>• All password reset actions are logged and audited</li>
                      <li>• Users receive email notifications for all security changes</li>
                      <li>• Reset links expire automatically after 24 hours</li>
                      <li>• Email changes require user verification</li>
                      <li>• Passwords must meet minimum security requirements</li>
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