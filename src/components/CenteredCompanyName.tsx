import React from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { useUser } from '@/contexts/UserContext';
import { useAppContext } from '@/contexts/AppContextProvider';

interface CenteredCompanyNameProps {
  isSpeaking?: boolean;
  onNavigate: (page: string) => void;
}

export const CenteredCompanyName = ({ isSpeaking = false, onNavigate }: CenteredCompanyNameProps) => {
  const { currentCompany } = useCompany();
  const { userProfile } = useUser();
  const { activeContext } = useAppContext();

  // Get display text based on active context
  const getDisplayText = () => {
    if (activeContext === 'personal') {
      // Show user's full name for personal context
      if (userProfile.firstName || userProfile.lastName) {
        return `${userProfile.firstName} ${userProfile.lastName}`.trim();
      }
      // Fallback to email for personal context
      return userProfile.email || "Personal";
    } else {
      // Show business name for company context
      // Check if company name looks like an auto-generated default
      const isDefaultCompanyName = currentCompany?.name && (
        currentCompany.name.includes('@') || 
        currentCompany.name.endsWith('\'s Business') ||
        currentCompany.name.endsWith('\'s Company')
      );
      
      // If we have a real company name (not auto-generated), show it
      if (currentCompany?.name && !isDefaultCompanyName) {
        return currentCompany.name;
      }
      
      // Fallback to user's name or default for company context
      if (userProfile.firstName || userProfile.lastName) {
        return `${userProfile.firstName} ${userProfile.lastName}`.trim();
      }
      
      return userProfile.email || "SKROBAKI";
    }
  };

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
      <div className="relative px-8 py-4 flex items-center gap-2">
        <h1 className="text-pure-white font-bold text-2xl tracking-wide text-center whitespace-nowrap heading-modern">
          {getDisplayText()}
        </h1>
      </div>
    </div>
  );
};