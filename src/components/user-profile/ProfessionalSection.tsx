import React from 'react';
import { ProfessionalInfoSection } from '@/components/user-edit/ProfessionalInfoSection';

interface ProfessionalSectionProps {
  profileData: {
    jobTitle: string;
    location: string;
    website: string;
    bio: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export const ProfessionalSection = ({ profileData, onInputChange }: ProfessionalSectionProps) => {
  return (
    <div className="space-y-8">
      {/* Professional Information */}
      <div className="glass-card p-6">
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