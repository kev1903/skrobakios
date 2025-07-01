
import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Briefcase, Building2, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfilePictureSection } from '@/components/user-edit/ProfilePictureSection';
import { PersonalInfoSection } from '@/components/user-edit/PersonalInfoSection';
import { PasswordUpdateSection } from '@/components/user-edit/PasswordUpdateSection';
import { ProfessionalInfoSection } from '@/components/user-edit/ProfessionalInfoSection';
import { CompanyDetailsSection } from '@/components/user-edit/CompanyDetailsSection';

interface UserEditPageProps {
  onNavigate: (page: string) => void;
}

export const UserEditPage = ({ onNavigate }: UserEditPageProps) => {
  const { toast } = useToast();
  const { userProfile, updateUserProfile } = useUser();
  const { profile, loading, saveProfile } = useProfile();
  const [activeTab, setActiveTab] = useState('personal');
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    company: '',
    location: '',
    bio: '',
    avatarUrl: '',
    birthDate: '',
    website: '',
    // Company Details - keeping these in context for now
    companyName: userProfile.companyName,
    abn: userProfile.abn,
    companyWebsite: userProfile.companyWebsite,
    companyAddress: userProfile.companyAddress,
    companyMembers: userProfile.companyMembers,
    companyLogo: userProfile.companyLogo || '',
    companySlogan: userProfile.companySlogan || '',
  });

  const [saving, setSaving] = useState(false);

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile && !loading) {
      setProfileData(prev => ({
        ...prev,
        firstName: profile.first_name,
        lastName: profile.last_name,
        email: profile.email,
        phone: profile.phone,
        jobTitle: profile.job_title,
        company: profile.company,
        companyName: profile.company, // Map database company to form companyName
        location: profile.location,
        bio: profile.bio,
        avatarUrl: profile.avatar_url,
        birthDate: profile.birth_date,
        website: profile.website,
        companySlogan: profile.company_slogan || '',
      }));
    } else if (!loading && !profile) {
      // If no profile exists, use context data as fallback
      setProfileData(prev => ({
        ...prev,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
        phone: userProfile.phone,
        jobTitle: userProfile.jobTitle,
        company: userProfile.company,
        location: userProfile.location,
        bio: userProfile.bio,
        avatarUrl: userProfile.avatarUrl,
        birthDate: userProfile.birthDate,
        website: userProfile.website,
        companySlogan: userProfile.companySlogan || '',
      }));
    }
  }, [profile, loading, userProfile]);

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Save to database - map companyName to company field
      const success = await saveProfile({
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone,
        job_title: profileData.jobTitle,
        company: profileData.companyName, // Use companyName from the form
        location: profileData.location,
        bio: profileData.bio,
        avatar_url: profileData.avatarUrl,
        birth_date: profileData.birthDate,
        website: profileData.website,
        company_slogan: profileData.companySlogan,
      });

      if (success) {
        // Update context for immediate UI updates
        updateUserProfile({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
          phone: profileData.phone,
          jobTitle: profileData.jobTitle,
          company: profileData.companyName, // Use companyName from the form
          location: profileData.location,
          bio: profileData.bio,
          avatarUrl: profileData.avatarUrl,
          birthDate: profileData.birthDate,
          website: profileData.website,
          // Company details from context
          companyName: profileData.companyName,
          abn: profileData.abn,
          companyWebsite: profileData.companyWebsite,
          companyAddress: profileData.companyAddress,
          companyMembers: profileData.companyMembers,
          companyLogo: profileData.companyLogo,
          companySlogan: profileData.companySlogan,
        });

        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile data",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original profile data
    if (profile) {
      setProfileData(prev => ({
        ...prev,
        firstName: profile.first_name,
        lastName: profile.last_name,
        email: profile.email,
        phone: profile.phone,
        jobTitle: profile.job_title,
        company: profile.company,
        companyName: profile.company, // Map database company to form companyName
        location: profile.location,
        bio: profile.bio,
        avatarUrl: profile.avatar_url,
        birthDate: profile.birth_date,
        website: profile.website,
        companySlogan: profile.company_slogan || '',
      }));
    }
    onNavigate('tasks');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center">
        <div className="text-slate-600">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="relative backdrop-blur-xl bg-white/60 border-b border-white/20 shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 hover:bg-white/40 backdrop-blur-sm transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium">Back</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
                  Edit Profile
                </h1>
                <p className="text-sm text-slate-500 mt-1">Update your personal information and preferences</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={saving}
                className="backdrop-blur-sm bg-white/60 border-white/30 hover:bg-white/80 text-slate-600 hover:text-slate-800 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="backdrop-blur-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 backdrop-blur-sm bg-white/60">
              <TabsTrigger value="personal" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Personal</span>
              </TabsTrigger>
              <TabsTrigger value="professional" className="flex items-center space-x-2">
                <Briefcase className="w-4 h-4" />
                <span className="hidden sm:inline">Professional</span>
              </TabsTrigger>
              <TabsTrigger value="company" className="flex items-center space-x-2">
                <Building2 className="w-4 h-4" />
                <span className="hidden sm:inline">Company</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center space-x-2">
                <Lock className="w-4 h-4" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6">
              {/* Profile Picture Section */}
              <ProfilePictureSection 
                avatarUrl={profileData.avatarUrl}
                firstName={profileData.firstName}
                lastName={profileData.lastName}
                onAvatarChange={(avatarUrl) => handleInputChange('avatarUrl', avatarUrl)}
              />

              {/* Personal Information */}
              <PersonalInfoSection 
                profileData={{
                  firstName: profileData.firstName,
                  lastName: profileData.lastName,
                  email: profileData.email,
                  phone: profileData.phone,
                  birthDate: profileData.birthDate,
                }}
                onInputChange={handleInputChange}
              />
            </TabsContent>

            <TabsContent value="professional" className="space-y-6">
              {/* Professional Information */}
              <ProfessionalInfoSection 
                profileData={{
                  jobTitle: profileData.jobTitle,
                  location: profileData.location,
                  website: profileData.website,
                  bio: profileData.bio,
                }}
                onInputChange={handleInputChange}
              />
            </TabsContent>

            <TabsContent value="company" className="space-y-6">
              {/* Company Details */}
              <CompanyDetailsSection 
                profileData={{
                  companyName: profileData.companyName,
                  abn: profileData.abn,
                  companyWebsite: profileData.companyWebsite,
                  companyAddress: profileData.companyAddress,
                  companyMembers: profileData.companyMembers,
                  companyLogo: profileData.companyLogo,
                  companySlogan: profileData.companySlogan,
                }}
                onInputChange={handleInputChange}
              />
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              {/* Password Update Section */}
              <PasswordUpdateSection />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
