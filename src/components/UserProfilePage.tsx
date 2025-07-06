import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { ProfileNavigationRibbon } from '@/components/user-profile/ProfileNavigationRibbon';
import { PersonalSection } from '@/components/user-profile/PersonalSection';
import { ProfessionalSection } from '@/components/user-profile/ProfessionalSection';
import { CompanySection } from '@/components/user-profile/CompanySection';
import { SecuritySection } from '@/components/user-profile/SecuritySection';

interface UserProfilePageProps {
  onNavigate: (page: string) => void;
}

export const UserProfilePage = ({ onNavigate }: UserProfilePageProps) => {
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
      // Save to database
      const success = await saveProfile({
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone,
        job_title: profileData.jobTitle,
        company: profileData.company,
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
          company: profileData.company,
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

  const handleBack = () => {
    onNavigate('tasks');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <PersonalSection
            profileData={{
              firstName: profileData.firstName,
              lastName: profileData.lastName,
              email: profileData.email,
              phone: profileData.phone,
              birthDate: profileData.birthDate,
              avatarUrl: profileData.avatarUrl,
              jobTitle: profileData.jobTitle,
              location: profileData.location,
              website: profileData.website,
              bio: profileData.bio,
            }}
            onInputChange={handleInputChange}
          />
        );
      case 'professional':
        return (
          <ProfessionalSection
            profileData={{
              jobTitle: profileData.jobTitle,
              location: profileData.location,
              website: profileData.website,
              bio: profileData.bio,
            }}
            onInputChange={handleInputChange}
          />
        );
      case 'company':
        return (
          <CompanySection
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
        );
      case 'security':
        return <SecuritySection />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center">
        <div className="text-slate-600">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Left Navigation Ribbon */}
      <ProfileNavigationRibbon
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onBack={handleBack}
      />

      {/* Main Content */}
      <div className="flex-1 ml-48 flex flex-col">
        {/* Header */}
        <div className="relative glass-light border-b border-glass-border shadow-sm">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gradient">
                  Edit Profile
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Update your personal information and preferences
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  onClick={handleBack}
                  disabled={saving}
                  className="glass border-glass-border hover:bg-glass-bg-hover text-foreground transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={saving}
                  className="glass-hover bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground border-0 shadow-lg transition-all duration-200"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};
