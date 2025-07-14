import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowLeft, User, Save } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg border-border/50">
            <CardContent className="p-8">
              <div className="flex items-center justify-center">
                <div className="text-muted-foreground">Loading profile...</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg border-border/50">
          <CardHeader className="border-b border-border/50 bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => onNavigate?.('home')}
                  variant="ghost"
                  size="sm"
                  className="p-2 hover:bg-background/80"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <h1 className="text-2xl font-semibold text-foreground">Personal Profile</h1>
                </div>
              </div>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <PersonalSection
                profileData={profileData}
                onInputChange={handleInputChange}
                onArrayChange={handleArrayChange}
                onAddArrayItem={handleAddArrayItem}
                onRemoveArrayItem={handleRemoveArrayItem}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};