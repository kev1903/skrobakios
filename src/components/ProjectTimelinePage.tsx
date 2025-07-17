import React from 'react';
import { Project } from "@/hooks/useProjects";

interface ProjectTimelinePageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const ProjectTimelinePage = ({ project, onNavigate }: ProjectTimelinePageProps) => {
  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Project Timeline</h1>
          <p className="text-white/70">Track project milestones and progress for {project.name}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Timeline View Coming Soon</h3>
            <p className="text-white/60 max-w-md mx-auto">
              Visualize your project timeline with milestones, dependencies, and progress tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};