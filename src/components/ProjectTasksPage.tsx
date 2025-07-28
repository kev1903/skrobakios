
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
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const { loadTasksForProject, tasks } = useTaskContext();

  // Get selected tasks
  const selectedTasks = tasks.filter(task => selectedTaskIds.includes(task.id));

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
        return <EnhancedTaskView 
          projectId={project.id} 
          viewMode={viewMode}
          selectedTaskIds={selectedTaskIds}
          onTaskSelectionChange={setSelectedTaskIds}
        />;
      case "board":
        return <TaskBoardView projectId={project.id} />;
      case "timeline":
        return <div className="p-8 text-center text-slate-600">Timeline view has been removed</div>;
      case "calendar":
        return <TaskCalendarView />;
      case "overview":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-800">Recent Tasks</h3>
              <TaskListView 
                projectId={project.id} 
                viewMode={viewMode}
                selectedTaskIds={selectedTaskIds}
                onTaskSelectionChange={setSelectedTaskIds}
              />
            </div>
          </div>
        );
      case "team":
        return (
          <div className="glass-card p-8">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">Team Workload</h3>
            <p className="text-slate-600">Team workload analytics and capacity planning will be displayed here.</p>
          </div>
        );
      case "insights":
        return (
          <div className="glass-card p-8">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">Project Insights</h3>
            <p className="text-slate-600">Project insights and performance metrics will be displayed here.</p>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center glass-card p-8">
              <p className="text-slate-800 text-lg">Coming Soon</p>
              <p className="text-slate-600 text-sm mt-2">
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
      <div className="flex-1 overflow-auto ml-48 backdrop-blur-xl bg-white/95 border-l border-white/10">
        <div className="p-8">
          <TaskPageHeader project={project} />
          
          <TaskSearchAndActions
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            selectedTasks={selectedTasks}
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
