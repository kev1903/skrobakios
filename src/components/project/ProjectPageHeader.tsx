import React from 'react';

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground font-inter">{projectName}</h1>
            <p className="text-muted-foreground mt-1 text-sm font-inter">{pageTitle}</p>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
};
