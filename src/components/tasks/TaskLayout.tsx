import React, { ReactNode } from 'react';
import { ProjectSidebar } from '../ProjectSidebar';
import { TodayScheduleSidebar } from './TodayScheduleSidebar';
import { Project } from '@/hooks/useProjects';
import { getStatusColor, getStatusText } from './utils/taskUtils';

interface TaskLayoutProps {
  project: Project;
  onNavigate: (page: string) => void;
  children: ReactNode;
}

export const TaskLayout = ({ project, onNavigate, children }: TaskLayoutProps) => {
  return (
    <div className="h-screen flex backdrop-blur-xl bg-black/20 border border-white/10">
      {/* Left Sidebar - Project Navigation */}
      <ProjectSidebar
        project={project}
        onNavigate={onNavigate}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
        activeSection="tasks"
      />

      {/* Main Content Area - Cleared as requested */}
      <div className="flex-1 overflow-auto ml-48 backdrop-blur-xl bg-white/95 border-l border-white/10">
        {children}
      </div>

      {/* Right Sidebar - Today's Schedule */}
      <TodayScheduleSidebar />
    </div>
  );
};