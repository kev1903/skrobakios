import React from 'react';
import { PersonalSection } from '@/components/user-profile/PersonalSection';
import { TimeSection } from '@/components/user-profile/TimeSection';
import { FinanceSection } from '@/components/user-profile/FinanceSection';
import { WellnessSection } from '@/components/user-profile/WellnessSection';
import { FamilySection } from '@/components/user-profile/FamilySection';
import { CompanySection } from '@/components/user-profile/CompanySection';
import { SecuritySection } from '@/components/user-profile/SecuritySection';

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
    companyName: string;
    abn: string;
    companyWebsite: string;
    companyAddress: string;
    companyMembers: string;
    companyLogo: string;
    companySlogan: string;
  };
  onInputChange: (field: string, value: string) => void;
  onNavigate: (page: string) => void;
  onEditCompany?: (companyId: string) => void;
  onCreateCompany?: () => void;
}

export const UserEditContent = ({ 
  activeSection, 
  profileData, 
  onInputChange, 
  onNavigate,
  onEditCompany,
  onCreateCompany
}: UserEditContentProps) => {
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
        }} onInputChange={onInputChange} onCreateCompany={onCreateCompany} />;
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