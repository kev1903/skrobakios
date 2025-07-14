import React from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { useUser } from '@/contexts/UserContext';

interface CenteredCompanyNameProps {
  isSpeaking?: boolean;
  onNavigate: (page: string) => void;
}

export const CenteredCompanyName = ({ isSpeaking = false, onNavigate }: CenteredCompanyNameProps) => {
  const { currentCompany } = useCompany();
  const { userProfile } = useUser();

  // Get display text - show user name if no real business is set up
  const getDisplayText = () => {
    // Check if company name looks like an auto-generated default (contains email or ends with 's Business')
    const isDefaultCompanyName = currentCompany?.name && (
      currentCompany.name.includes('@') || 
      currentCompany.name.endsWith('\'s Business') ||
      currentCompany.name.endsWith('\'s Company')
    );
    
    // If we have a real company name (not auto-generated), show it
    if (currentCompany?.name && !isDefaultCompanyName) {
      return currentCompany.name;
    }
    
    // Otherwise show user's name
    if (userProfile.firstName || userProfile.lastName) {
      return `${userProfile.firstName} ${userProfile.lastName}`.trim();
    }
    
    // Fallback to email or default
    return userProfile.email || "SKROBAKI";
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
      <div className="relative px-8 py-4 flex items-center gap-2">
        <h1 className="text-pure-white font-bold text-2xl tracking-wide text-center whitespace-nowrap heading-modern">
          {getDisplayText()}
        </h1>
      </div>
    </div>
  );
};