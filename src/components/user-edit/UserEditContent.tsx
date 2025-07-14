import React from 'react';
import { PersonalSection } from '@/components/user-profile/PersonalSection';
import { TimeSection } from '@/components/user-profile/TimeSection';
import { FinanceSection } from '@/components/user-profile/FinanceSection';
import { WellnessSection } from '@/components/user-profile/WellnessSection';
import { FamilySection } from '@/components/user-profile/FamilySection';
import { CompanySection } from '@/components/user-profile/CompanySection';
import { SecuritySection } from '@/components/user-profile/SecuritySection';
import { CombinedProfileSection } from './CombinedProfileSection';

interface UserEditContentProps {
  activeSection: string;
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
    companyName: string;
    abn: string;
    companyWebsite: string;
    companyAddress: string;
    companyMembers: string;
    companyLogo: string;
    companySlogan: string;
    companyPhone: string;
    businessType: string;
    industry: string;
    companySize: string;
    yearEstablished: number;
    serviceAreas: string[];
  };
  onInputChange: (field: string, value: string) => void;
  onArrayChange: (field: string, index: number, value: string) => void;
  onAddArrayItem: (field: string) => void;
  onRemoveArrayItem: (field: string, index: number) => void;
  onNavigate: (page: string) => void;
  onEditCompany?: (companyId: string) => void;
}

export const UserEditContent = ({ 
  activeSection, 
  profileData, 
  onInputChange,
  onArrayChange,
  onAddArrayItem,
  onRemoveArrayItem,
  onNavigate,
  onEditCompany 
}: UserEditContentProps) => {
  const renderContent = () => {
    switch (activeSection) {
      case 'personal':
        return <PersonalSection profileData={{
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
          phone: profileData.phone,
          avatarUrl: profileData.avatarUrl,
          jobTitle: profileData.jobTitle,
          location: profileData.location,
          bio: profileData.bio,
          birthDate: profileData.birthDate,
          website: profileData.website,
          qualifications: profileData.qualifications,
          licenses: profileData.licenses,
          awards: profileData.awards,
        }} 
        onInputChange={onInputChange}
        onArrayChange={onArrayChange}
        onAddArrayItem={onAddArrayItem}
        onRemoveArrayItem={onRemoveArrayItem}
        />;
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
        }} onInputChange={onInputChange} onEditCompany={onEditCompany} />;
      case 'security':
        return <SecuritySection />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 overflow-auto p-8">
      <div className="max-w-4xl">
        {renderContent()}
      </div>
    </div>
  );
};