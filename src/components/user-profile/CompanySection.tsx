import React from 'react';
import { CompanyList } from '@/components/user-profile/CompanyList';

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
  onEditCompany?: (companyId: string) => void;
}

export const CompanySection = ({ profileData, onInputChange, onEditCompany }: CompanySectionProps) => {
  return (
    <div className="space-y-8">
      <CompanyList onEditCompany={onEditCompany} />
    </div>
  );
};