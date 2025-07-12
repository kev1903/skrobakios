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
}

export const CompanySection = ({ profileData, onInputChange }: CompanySectionProps) => {
  return (
    <div className="space-y-8">
      <CompanyList />
    </div>
  );
};