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
    <div className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="px-6 py-4">
        {/* Back to Projects Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate('projects')}
          className="text-muted-foreground hover:text-foreground mb-3 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>
        
        {/* Project Name and Actions Row */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">PROJECT</div>
            <h1 className="text-xl font-bold text-foreground font-inter">{projectName}</h1>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
};
