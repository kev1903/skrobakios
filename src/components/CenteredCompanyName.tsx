import React from 'react';
import { useCompany } from '@/contexts/CompanyContext';

interface CenteredCompanyNameProps {
  isSpeaking?: boolean;
  onNavigate: (page: string) => void;
}

export const CenteredCompanyName = ({ isSpeaking = false, onNavigate }: CenteredCompanyNameProps) => {
  const { currentCompany } = useCompany();

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
      <div className="relative px-8 py-4 flex items-center gap-2">
        <h1 className="text-pure-white font-bold text-2xl tracking-wide text-center whitespace-nowrap heading-modern">
          {currentCompany?.name || "SKROBAKI"}
        </h1>
      </div>
    </div>
  );
};