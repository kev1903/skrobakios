
import React, { useState, useEffect, useCallback } from 'react';
import { Project } from '@/hooks/useProjects';
import { TaskProvider, useTaskContext } from './tasks/TaskContext';
import { TaskListView } from './tasks/TaskListView';
import { EnhancedTaskView } from './tasks/enhanced/EnhancedTaskView';
import { TaskBoardView } from './tasks/TaskBoardView';

import { TaskCalendarView } from './tasks/TaskCalendarView';
import { ProjectSidebar } from './ProjectSidebar';
import { TaskPageHeader } from './tasks/TaskPageHeader';
import { TaskSearchAndActions } from './tasks/TaskSearchAndActions';
import { TaskTabNavigation } from './tasks/TaskTabNavigation';
import { getStatusColor, getStatusText } from './tasks/utils/taskUtils';

interface ProjectTasksPageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

const ProjectTasksContent = ({ project, onNavigate }: ProjectTasksPageProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("list");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const { loadTasksForProject } = useTaskContext();

  // Memoize the task loading to prevent infinite loops
  const loadTasks = useCallback(() => {
    if (project?.id) {
      loadTasksForProject(project.id);
    }
  }, [project?.id, loadTasksForProject]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const renderActiveView = () => {
    switch (activeTab) {
      case "list":
        return <EnhancedTaskView projectId={project.id} viewMode={viewMode} />;
      case "board":
        return <TaskBoardView projectId={project.id} />;
      case "timeline":
        return <div className="p-8 text-center text-muted-foreground">Timeline view has been removed</div>;
      case "calendar":
        return <TaskCalendarView />;
      case "overview":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Recent Tasks</h3>
              <TaskListView projectId={project.id} viewMode={viewMode} />
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-8">
              <p className="text-foreground/80 text-lg">Coming Soon</p>
              <p className="text-muted-foreground text-sm mt-2">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} view is under development
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-screen flex backdrop-blur-xl bg-black/20 border border-white/10">
      {/* Project Sidebar */}
      <ProjectSidebar
        project={project}
        onNavigate={onNavigate}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
        activeSection="tasks"
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto ml-48 backdrop-blur-xl bg-white/5 border-l border-white/10">
        <div className="p-8">
          <TaskPageHeader project={project} />
          
          <TaskSearchAndActions
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          <TaskTabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />


          <div>
            {renderActiveView()}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProjectTasksPage = ({ project, onNavigate }: ProjectTasksPageProps) => {

  return (
    <TaskProvider>
      <ProjectTasksContent project={project} onNavigate={onNavigate} />
    </TaskProvider>
  );
};
