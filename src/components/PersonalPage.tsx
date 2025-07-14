import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { User, Home } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/hooks/use-toast';
import { PersonalSection } from '@/components/user-profile/PersonalSection';

interface PersonalPageProps {
  onNavigate?: (page: string) => void;
}

export const PersonalPage = ({ onNavigate }: PersonalPageProps) => {
  const { profile, loading, saveProfile } = useProfile();
  const { userProfile, updateUserProfile } = useUser();
  const [saving, setSaving] = useState(false);

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
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <User className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Personal Profile</h1>
          </div>
          <Button
            onClick={() => onNavigate?.('home')}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Button>
        </div>
        <div className="text-center text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <User className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-slate-800">Personal Profile</h1>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              onClick={() => onNavigate?.('home')}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Button>
          </div>
        </div>

        {/* Personal Profile Content */}
        <PersonalSection
          profileData={profileData}
          onInputChange={handleInputChange}
          onArrayChange={handleArrayChange}
          onAddArrayItem={handleAddArrayItem}
          onRemoveArrayItem={handleRemoveArrayItem}
        />
      </div>
    </div>
  );
};