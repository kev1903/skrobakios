import React from 'react';
import { ProfilePictureSection } from '@/components/user-edit/ProfilePictureSection';
import { PersonalInfoSection } from '@/components/user-edit/PersonalInfoSection';

interface PersonalSectionProps {
  profileData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    birthDate: string;
    avatarUrl: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export const PersonalSection = ({ profileData, onInputChange }: PersonalSectionProps) => {
  return (
    <div className="space-y-8">
      {/* Profile Picture Section */}
      <div className="glass-card p-6">
        <ProfilePictureSection 
          avatarUrl={profileData.avatarUrl}
          firstName={profileData.firstName}
          lastName={profileData.lastName}
          onAvatarChange={(avatarUrl) => onInputChange('avatarUrl', avatarUrl)}
        />
      </div>

      {/* Personal Information */}
      <div className="glass-card p-6">
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
    </div>
  );
};