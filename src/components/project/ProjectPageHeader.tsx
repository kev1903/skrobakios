import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProjectPageHeaderProps {
  projectName: string;
  pageTitle: string;
  onNavigate: (page: string) => void;
  actions?: React.ReactNode;
}

export const ProjectPageHeader = ({ projectName, pageTitle, onNavigate, actions }: ProjectPageHeaderProps) => {
  return (
    <div className="flex-shrink-0 border-b border-border bg-white">
      <div className="px-6 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground font-inter">{projectName}</h1>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
};
