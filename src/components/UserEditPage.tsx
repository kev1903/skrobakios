
import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Briefcase, Building2, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
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
  const [activeSection, setActiveSection] = useState('personal');
  
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

  const profileNavItems = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'company', label: 'Company', icon: Building2 },
    { id: 'security', label: 'Security', icon: Lock },
  ];

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

  const renderContent = () => {
    switch (activeSection) {
      case 'personal':
        return (
          <div className="space-y-8">
            {/* Profile Picture Section */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
              <ProfilePictureSection 
                avatarUrl={profileData.avatarUrl}
                firstName={profileData.firstName}
                lastName={profileData.lastName}
                onAvatarChange={(avatarUrl) => handleInputChange('avatarUrl', avatarUrl)}
              />
            </div>

            {/* Personal Information */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
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
            </div>
          </div>
        );
      case 'professional':
        return (
          <div className="space-y-8">
            {/* Professional Information */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
              <ProfessionalInfoSection 
                profileData={{
                  jobTitle: profileData.jobTitle,
                  location: profileData.location,
                  website: profileData.website,
                  bio: profileData.bio,
                }}
                onInputChange={handleInputChange}
              />
            </div>
          </div>
        );
      case 'company':
        return (
          <div className="space-y-8">
            {/* Company Details */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
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
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-8">
            {/* Password Update Section */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
              <PasswordUpdateSection />
            </div>
          </div>
        );
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
    <div className="h-screen flex backdrop-blur-xl bg-black/20 border border-white/10">
      {/* Profile Sidebar - Matching Project Layout */}
      <div className="fixed left-0 top-0 w-48 h-full bg-white/10 backdrop-blur-md border-r border-white/20 shadow-2xl z-40 transition-all duration-300">
        <div className="flex flex-col h-full pt-20">
          {/* Back Button */}
          <div className="flex-shrink-0 px-3 py-4 border-b border-white/20">
            <button
              onClick={handleCancel}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white hover:bg-white/30 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Close Page</span>
            </button>
          </div>

          {/* Profile Info */}
          <div className="flex-shrink-0 px-3 py-4 border-b border-white/20">
            <div className="text-white text-sm font-medium mb-2 truncate">
              {profileData.firstName} {profileData.lastName}
            </div>
            <div className="text-white/70 text-xs mb-2">Profile Settings</div>
          </div>

          {/* Profile Navigation Items */}
          <div className="flex-1 flex flex-col py-4 space-y-1 overflow-y-auto px-3">
            <div className="text-xs font-medium text-white/60 uppercase tracking-wider px-3 py-2 mb-1">
              Profile Navigation
            </div>
            {profileNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-left ${
                  activeSection === item.id 
                    ? 'bg-white/20 text-white border border-white/30' 
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Save Actions */}
          <div className="border-t border-white/20 px-3 py-4 space-y-2">
            <div className="text-xs font-medium text-white/60 uppercase tracking-wider px-3 py-2">
              Actions
            </div>
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 transition-all duration-200"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 ml-48 flex flex-col">
        {/* Content Header */}
        <div className="flex-shrink-0 pt-20 px-8 py-6 border-b border-white/20">
          <h1 className="text-3xl font-bold text-white mb-2">
            Edit Profile
          </h1>
          <p className="text-white/70">
            Update your personal information and preferences
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};
