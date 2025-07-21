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
    <div className="h-screen flex backdrop-blur-xl bg-black/20 border border-white/10">
      {/* Project Sidebar */}
      <ProjectSidebar
        project={project}
        onNavigate={onNavigate}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
        activeSection="team"
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto ml-48 backdrop-blur-xl bg-white/5 border-l border-white/10">
        <div className="p-8">
          {/* Team Management Header */}
          <div className="mb-8 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
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
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl">
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