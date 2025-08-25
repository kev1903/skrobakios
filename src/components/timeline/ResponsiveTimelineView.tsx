
import React from 'react';
import { ModernTimelineView } from './ModernTimelineView';
import { useScreenSize } from '@/hooks/use-mobile';

interface ResponsiveTimelineViewProps {
  projectId: string;
  projectName: string;
  companyId?: string;
}

export const ResponsiveTimelineView = ({ 
  projectId, 
  projectName, 
  companyId 
}: ResponsiveTimelineViewProps) => {
  const screenSize = useScreenSize();

  return (
    <div className={`${
      screenSize === 'mobile' || screenSize === 'mobile-small'
        ? 'space-y-4' 
        : screenSize === 'tablet' 
        ? 'space-y-5' 
        : 'space-y-6'
    }`}>
      <ModernTimelineView
        projectId={projectId}
        projectName={projectName}
        companyId={companyId}
      />
    </div>
  );
};
