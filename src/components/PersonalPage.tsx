import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, User, Save, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/hooks/use-toast';
import { PersonalSection } from '@/components/personal/PersonalSection';
import { supabase } from '@/integrations/supabase/client';

interface PersonalPageProps {
  onNavigate?: (page: string) => void;
}

export const PersonalPage = ({ onNavigate }: PersonalPageProps) => {
  const { profile, loading, saveProfile } = useProfile();
  const { userProfile, updateUserProfile } = useUser();
  const [saving, setSaving] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: userProfile.firstName || '',
    lastName: userProfile.lastName || '',
    email: userProfile.email || '',
    phone: userProfile.phone || '',
    jobTitle: userProfile.jobTitle || '',
    location: userProfile.location || '',
    bio: userProfile.bio || '',
    avatarUrl: userProfile.avatarUrl || '',
    birthDate: userProfile.birthDate || '',
    website: userProfile.website || '',
    qualifications: userProfile.qualifications || [],
    licenses: userProfile.licenses || [],
    awards: userProfile.awards || [],
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Sync with profile data when it loads
  React.useEffect(() => {
    if (profile && !loading) {
      setProfileData(prev => ({
        ...prev,
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        jobTitle: profile.job_title || '',
        location: profile.location || '',
        bio: profile.bio || '',
        avatarUrl: profile.avatar_url || '',
        birthDate: profile.birth_date || '',
        website: profile.website || '',
        qualifications: profile.qualifications || [],
        licenses: profile.licenses || [],
        awards: profile.awards || [],
      }));
    }
  }, [profile, loading]);

  // Check if this is a first-time user who needs to set a password
  useEffect(() => {
    const checkFirstTimeUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && profile) {
          // Check if password change is required (new invited users)
          setIsFirstTimeUser((profile as any).password_change_required || false);
        }
      } catch (error) {
        console.error('Error checking first-time user status:', error);
      }
    };

    if (profile && !loading) {
      checkFirstTimeUser();
    }
  }, [profile, loading]);

  const handlePasswordChange = async () => {
    if (!passwordData.newPassword) {
      toast({
        title: "Error",
        description: "Please enter a new password",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      // Update profile to mark password as changed
      if ((profile as any)?.user_id) {
        await supabase
          .from('profiles')
          .update({ 
            password_change_required: false,
            account_activated: true
          })
          .eq('user_id', (profile as any).user_id);
      }

      toast({
        title: "Success",
        description: "Password updated successfully",
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordSection(false);
      setIsFirstTimeUser(false);
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).map((item: string, i: number) => 
        i === index ? value : item
      )
    }));
  };

  const handleAddArrayItem = (field: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: [...(prev[field as keyof typeof prev] as string[]), '']
    }));
  };

  const handleRemoveArrayItem = (field: string, index: number) => {
    setProfileData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const success = await saveProfile({
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone,
        job_title: profileData.jobTitle,
        location: profileData.location,
        bio: profileData.bio,
        avatar_url: profileData.avatarUrl,
        birth_date: profileData.birthDate,
        website: profileData.website,
        company_slogan: '',
        company: '',
        qualifications: profileData.qualifications,
        licenses: profileData.licenses,
        awards: profileData.awards,
      });

      if (success) {
        updateUserProfile({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
          phone: profileData.phone,
          jobTitle: profileData.jobTitle,
          location: profileData.location,
          bio: profileData.bio,
          avatarUrl: profileData.avatarUrl,
          birthDate: profileData.birthDate,
          website: profileData.website,
          qualifications: profileData.qualifications,
          licenses: profileData.licenses,
          awards: profileData.awards,
        });
        
        toast({
          title: "Success",
          description: "Profile updated successfully"
        });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile data",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* First-time user password setup banner */}
      {isFirstTimeUser && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <h3 className="font-medium text-yellow-800">Complete Your Account Setup</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Please set a secure password to complete your account activation.
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowPasswordSection(true)}
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
              >
                Set Password
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            {onNavigate && (
              <Button variant="ghost" onClick={() => onNavigate('home')} size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Personal Profile</CardTitle>
            </div>
          </div>
          <div className="flex gap-2">
            {!isFirstTimeUser && (
              <Button
                variant="outline"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                size="sm"
              >
                <Lock className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={saving}
              size="sm"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Password Change Section */}
          {showPasswordSection && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  {isFirstTimeUser ? 'Set Your Password' : 'Change Password'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isFirstTimeUser && (
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="currentPassword"
                        type="password"
                        placeholder="Enter current password"
                        className="pl-10"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password (min 6 characters)"
                      className="pl-10 pr-10"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
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
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      className="pl-10"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    />
                  </div>
                  {passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                    <p className="text-sm text-red-600 mt-1">Passwords do not match</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handlePasswordChange}
                    disabled={saving || !passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword}
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {isFirstTimeUser ? 'Set Password' : 'Update Password'}
                      </>
                    )}
                  </Button>
                  {!isFirstTimeUser && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowPasswordSection(false);
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Profile Form */}
          <PersonalSection
            profileData={profileData}
            onInputChange={handleInputChange}
            onArrayChange={handleArrayChange}
            onAddArrayItem={handleAddArrayItem}
            onRemoveArrayItem={handleRemoveArrayItem}
          />
        </CardContent>
      </Card>
    </div>
  );
};