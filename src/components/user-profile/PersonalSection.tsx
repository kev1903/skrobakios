import React from 'react';
import { ProfilePictureSection } from '@/components/user-edit/ProfilePictureSection';
import { PersonalInfoSection } from '@/components/user-edit/PersonalInfoSection';
import { ProfessionalInfoSection } from '@/components/user-edit/ProfessionalInfoSection';
import { Button } from '@/components/ui/button';
import { Building2, Plus } from 'lucide-react';

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
  onCreateCompany?: () => void;
}

export const PersonalSection = ({ profileData, onInputChange, onCreateCompany }: PersonalSectionProps) => {
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

      {/* Company Management */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Company Management</h3>
            <p className="text-white/70 text-sm">
              Create and manage your company profile
            </p>
          </div>
          {onCreateCompany && (
            <Button
              onClick={onCreateCompany}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Company
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};