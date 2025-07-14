import React from 'react';
import { ProfilePictureSection } from '@/components/user-edit/ProfilePictureSection';
import { PersonalInfoSection } from '@/components/user-edit/PersonalInfoSection';
import { ProfessionalInfoSection } from '@/components/user-edit/ProfessionalInfoSection';
import { QualificationsSection } from '@/components/user-edit/QualificationsSection';

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
    qualifications: string[];
    licenses: string[];
    awards: string[];
  };
  onInputChange: (field: string, value: string) => void;
  onArrayChange: (field: string, index: number, value: string) => void;
  onAddArrayItem: (field: string) => void;
  onRemoveArrayItem: (field: string, index: number) => void;
}

export const PersonalSection = ({ profileData, onInputChange, onArrayChange, onAddArrayItem, onRemoveArrayItem }: PersonalSectionProps) => {
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
            location: profileData.location,
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

      {/* Qualifications, Licenses & Awards */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
        <QualificationsSection
          qualifications={profileData.qualifications}
          licenses={profileData.licenses}
          awards={profileData.awards}
          onQualificationChange={(index, value) => onArrayChange('qualifications', index, value)}
          onLicenseChange={(index, value) => onArrayChange('licenses', index, value)}
          onAwardChange={(index, value) => onArrayChange('awards', index, value)}
          onAddQualification={() => onAddArrayItem('qualifications')}
          onAddLicense={() => onAddArrayItem('licenses')}
          onAddAward={() => onAddArrayItem('awards')}
          onRemoveQualification={(index) => onRemoveArrayItem('qualifications', index)}
          onRemoveLicense={(index) => onRemoveArrayItem('licenses', index)}
          onRemoveAward={(index) => onRemoveArrayItem('awards', index)}
        />
      </div>
    </div>
  );
};