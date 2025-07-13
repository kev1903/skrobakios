import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User, Shield, ArrowLeft, Save } from 'lucide-react';
import { HierarchicalUser } from '@/types/hierarchicalUser';
import { useAdminProfile } from '@/hooks/useAdminProfile';
import { useUserRole } from '@/hooks/useUserRole';
import { useHierarchicalUserManagement } from '@/hooks/useHierarchicalUserManagement';
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
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    const success = await saveUserProfile(user.user_id, profileData);
    
    if (success) {
      toast({
        title: "Profile Updated",
        description: "User profile has been successfully updated.",
      });
      refreshUsers(); // Refresh to get updated user data including roles
      navigate('/?page=platform-dashboard');
    }
    setSaving(false);
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