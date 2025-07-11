import React from 'react';
import { CompanyDetailsSection } from '@/components/user-edit/CompanyDetailsSection';

interface CompanySectionProps {
  profileData: {
    companyName: string;
    abn: string;
    companyWebsite: string;
    companyAddress: string;
    companyMembers: string;
    companyLogo: string;
    companySlogan: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export const CompanySection = ({ profileData, onInputChange }: CompanySectionProps) => {
  return (
    <div className="space-y-8">
      {/* Company Details */}
      <CompanyDetailsSection 
        profileData={{
          companyName: profileData.companyName,
          abn: profileData.abn,
          companyWebsite: profileData.companyWebsite,
          companyAddress: profileData.companyAddress,
          companyMembers: profileData.companyMembers,
          companyLogo: profileData.companyLogo,
          companySlogan: profileData.companySlogan,
        }}
        onInputChange={onInputChange}
      />
    </div>
  );
};