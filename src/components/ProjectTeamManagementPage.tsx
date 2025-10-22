import React, { useState, useCallback } from 'react';
import { Project } from '@/hooks/useProjects';
import { ProjectSidebar } from './ProjectSidebar';
import { ProjectPageHeader } from './project/ProjectPageHeader';
import { getStatusColor, getStatusText } from './tasks/utils/taskUtils';
import { ProjectTeamPage } from './projects/ProjectTeamPage';

interface ProjectTeamManagementPageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

const ProjectTeamManagementContent = ({ project, onNavigate }: ProjectTeamManagementPageProps) => {
  return (
    <div className="h-screen overflow-hidden">
      {/* Project Sidebar */}
      <ProjectSidebar
        project={project}
        onNavigate={onNavigate}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
        activeSection="team"
      />

      {/* Main Content - Fixed positioning to match Project Control */}
      <div className="fixed left-40 right-0 top-[var(--header-height)] bottom-0 overflow-hidden">
        <div className="h-full w-full bg-white">
          {/* Header */}
          <ProjectPageHeader 
            projectName={project.name}
            pageTitle="Team Management"
            onNavigate={onNavigate}
            actions={
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Project ID</div>
                <div className="text-lg font-mono text-foreground">#{project.project_id}</div>
              </div>
            }
          />

          {/* Content Area */}
          <div className="h-[calc(100%-100px)] overflow-y-auto">
            <div className="p-6">
              <ProjectTeamPage project={project} onNavigate={onNavigate} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProjectTeamManagementPage = ({ project, onNavigate }: ProjectTeamManagementPageProps) => {
  return <ProjectTeamManagementContent project={project} onNavigate={onNavigate} />;
};