import React from 'react';

interface ProjectBIMPageProps {
  project: any;
  onNavigate: (page: string) => void;
}

export const ProjectBIMPage = ({ project, onNavigate }: ProjectBIMPageProps) => {
  return (
    <div className="w-full h-full bg-background">
      {/* Blank BIM page - content to be added */}
    </div>
  );
};
