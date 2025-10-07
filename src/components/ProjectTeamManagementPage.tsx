import React, { useState, useCallback } from 'react';
import { Project } from '@/hooks/useProjects';
import { ProjectSidebar } from './ProjectSidebar';
import { getStatusColor, getStatusText } from './tasks/utils/taskUtils';
import { ProjectTeamPage } from './projects/ProjectTeamPage';

interface ProjectTeamManagementPageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

const ProjectTeamManagementContent = ({ project, onNavigate }: ProjectTeamManagementPageProps) => {
  return (
    <div className="h-screen flex bg-background">
      {/* Project Sidebar */}
      <ProjectSidebar
        project={project}
        onNavigate={onNavigate}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
        activeSection="team"
      />

      {/* Main Content */}
      <div className="flex-1 ml-48 bg-background border-l h-full overflow-y-auto">
        <div className="p-8">
          {/* Team Management Header */}
          <div className="mb-6 bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Team Management</h1>
                <p className="text-muted-foreground">
                  Manage project team members, roles, and permissions for {project.name}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Project ID</div>
                <div className="text-lg font-mono text-foreground">#{project.project_id}</div>
              </div>
            </div>
          </div>

          {/* Team Management Content */}
          <div className="bg-card border rounded-lg">
            <ProjectTeamPage project={project} onNavigate={onNavigate} />
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProjectTeamManagementPage = ({ project, onNavigate }: ProjectTeamManagementPageProps) => {
  return <ProjectTeamManagementContent project={project} onNavigate={onNavigate} />;
};