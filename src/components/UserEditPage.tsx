import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { useProfile } from '@/hooks/useProfile';
import { UserEditNavigation } from '@/components/user-edit/UserEditNavigation';
import { PersonalSection } from '@/components/user-profile/PersonalSection';
import { TimeSection } from '@/components/user-profile/TimeSection';
import { FinanceSection } from '@/components/user-profile/FinanceSection';
import { WellnessSection } from '@/components/user-profile/WellnessSection';
import { FamilySection } from '@/components/user-profile/FamilySection';
import { CompanySection } from '@/components/user-profile/CompanySection';
import { SecuritySection } from '@/components/user-profile/SecuritySection';
interface UserEditPageProps {
  onNavigate: (page: string) => void;
}
export const UserEditPage = ({
  onNavigate
}: UserEditPageProps) => {
  const {
    toast
  } = useToast();
  const {
    userProfile,
    updateUserProfile
  } = useUser();
  const {
    profile,
    loading,
    saveProfile
  } = useProfile();
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
    companySlogan: userProfile.companySlogan || ''
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
        companySlogan: profile.company_slogan || ''
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
        companySlogan: userProfile.companySlogan || ''
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
        company_slogan: profileData.companySlogan
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
          companySlogan: profileData.companySlogan
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
        companySlogan: profile.company_slogan || ''
      }));
    }
    onNavigate('tasks');
  };
  const renderContent = () => {
    switch (activeSection) {
      case 'personal':
        return <PersonalSection profileData={{
          avatarUrl: profileData.avatarUrl,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
          phone: profileData.phone,
          birthDate: profileData.birthDate,
          jobTitle: profileData.jobTitle,
          location: profileData.location,
          website: profileData.website,
          bio: profileData.bio
        }} onInputChange={handleInputChange} />;
      case 'time':
        return <TimeSection onNavigate={onNavigate} />;
      case 'finance':
        return <FinanceSection />;
      case 'wellness':
        return <WellnessSection />;
      case 'family':
        return <FamilySection />;
      case 'company':
        return <CompanySection profileData={{
          companyName: profileData.companyName,
          abn: profileData.abn,
          companyWebsite: profileData.companyWebsite,
          companyAddress: profileData.companyAddress,
          companyMembers: profileData.companyMembers,
          companyLogo: profileData.companyLogo,
          companySlogan: profileData.companySlogan
        }} onInputChange={handleInputChange} />;
      case 'security':
        return <SecuritySection />;
      default:
        return null;
    }
  };
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center">
        <div className="text-slate-600">Loading profile...</div>
      </div>;
  }
  return <div className="h-screen flex backdrop-blur-xl bg-black/20 border border-white/10">
      {/* Profile Sidebar - Matching Project Layout */}
      <UserEditNavigation firstName={profileData.firstName} lastName={profileData.lastName} activeSection={activeSection} onSectionChange={setActiveSection} onNavigate={onNavigate} onSave={handleSave} saving={saving} />

      {/* Main Content Area */}
      <div className="flex-1 ml-48 flex flex-col">
        {/* Content Header */}
        <div className="flex-shrink-0 pt-20 px-8 py-6 border-b border-white/20">
          <h1 className="text-3xl font-bold text-white mb-2">Personal Profile</h1>
          <p className="text-white/70">
            Track, analyze, and optimize how you spend your time
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>;
};