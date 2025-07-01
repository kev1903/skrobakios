
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { useProfile } from '@/hooks/useProfile';
import { UserEditHeader } from '@/components/user-edit/UserEditHeader';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center">
        <div className="text-slate-600">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.15)_1px,transparent_0)] bg-[length:24px_24px] pointer-events-none" />
      
      {/* Header with Glassmorphism */}
      <UserEditHeader 
        onCancel={handleCancel}
        onSave={handleSave}
        saving={saving}
      />

      {/* Content */}
      <div className="max-w-5xl mx-auto p-8 space-y-8">
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

        {/* Password Update Section */}
        <PasswordUpdateSection />

        {/* Professional Information */}
        <ProfessionalInfoSection 
          profileData={{
            jobTitle: profileData.jobTitle,
            company: profileData.company,
            location: profileData.location,
            website: profileData.website,
            bio: profileData.bio,
          }}
          onInputChange={handleInputChange}
        />

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
      </div>
    </div>
  );
};
