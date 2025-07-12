import React from 'react';
import { ProfilePictureSection } from '@/components/user-edit/ProfilePictureSection';
import { PersonalInfoSection } from '@/components/user-edit/PersonalInfoSection';
import { ProfessionalInfoSection } from '@/components/user-edit/ProfessionalInfoSection';

interface PersonalSectionProps {
  profileData: {
    avatarUrl: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    birthDate: string;
    jobTitle: string;
    location: string;
    website: string;
    bio: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export const PersonalSection = ({ profileData, onInputChange }: PersonalSectionProps) => {
  return (
    <div className="space-y-8">
      {/* Profile Picture Section */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
        <ProfilePictureSection 
          avatarUrl={profileData.avatarUrl}
          firstName={profileData.firstName}
          lastName={profileData.lastName}
          onAvatarChange={(avatarUrl) => onInputChange('avatarUrl', avatarUrl)}
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
          onInputChange={onInputChange}
        />
      </div>

      {/* Professional Information */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
        <ProfessionalInfoSection 
          profileData={{
            jobTitle: profileData.jobTitle,
            location: profileData.location,
            website: profileData.website,
            bio: profileData.bio,
          }}
          onInputChange={onInputChange}
        />
      </div>
    </div>
  );
};