import React from 'react';
import { Project } from "@/hooks/useProjects";

interface ProjectTimelinePageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const ProjectTimelinePage = ({ project, onNavigate }: ProjectTimelinePageProps) => {
  return (
    <div className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Project Timeline</h1>
          <p className="text-muted-foreground">
            Timeline view for {project.name}
          </p>
        </div>
        
        {/* Blank content area for timeline */}
        <div className="bg-card rounded-lg border border-border p-8 min-h-96 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              Timeline Content
            </h3>
            <p className="text-muted-foreground">
              This is a blank timeline page ready for timeline content.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};