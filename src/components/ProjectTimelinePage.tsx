import React from 'react';
import { Project } from "@/hooks/useProjects";

interface ProjectTimelinePageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const ProjectTimelinePage = ({ project, onNavigate }: ProjectTimelinePageProps) => {
  return (
    <div className="h-full w-full">
      {/* Empty timeline page - all content removed */}
    </div>
  );
};