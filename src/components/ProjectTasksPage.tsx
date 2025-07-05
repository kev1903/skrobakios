
import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Download, Filter, Search, Eye, Briefcase, Calendar, DollarSign, TrendingUp, Map, Settings, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Project } from '@/hooks/useProjects';
import { TaskProvider, useTaskContext } from './tasks/TaskContext';
import { TaskListView } from './tasks/TaskListView';
import { TaskBoardView } from './tasks/TaskBoardView';
import { TaskTimelineView } from './tasks/TaskTimelineView';
import { TaskCalendarView } from './tasks/TaskCalendarView';

interface ProjectTasksPageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

const ProjectTasksContent = ({ project, onNavigate }: ProjectTasksPageProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("list");
  const { loadTasksForProject } = useTaskContext();

  const ribbonItems = [
    { id: "overview", label: "Overview", icon: Eye },
    { id: "list", label: "List", icon: null },
    { id: "board", label: "Board", icon: null },
    { id: "timeline", label: "Timeline", icon: null },
    { id: "calendar", label: "Calendar", icon: null },
    { id: "workflow", label: "Workflow", icon: null },
    { id: "dashboard", label: "Dashboard", icon: null },
    { id: "messages", label: "Messages", icon: null },
    { id: "files", label: "Files", icon: null }
  ];

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
        return <TaskListView projectId={project.id} />;
      case "board":
        return <TaskBoardView projectId={project.id} />;
      case "timeline":
        return <TaskTimelineView />;
      case "calendar":
        return <TaskCalendarView />;
      case "overview":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Recent Tasks</h3>
              <TaskListView projectId={project.id} />
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-gray-500 text-lg">Coming Soon</p>
              <p className="text-gray-400 text-sm mt-2">
                {ribbonItems.find(item => item.id === activeTab)?.label} view is under development
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header with Project Info and Back Button */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => onNavigate("project-detail")}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{project.name}</h1>
              <p className="text-sm text-gray-500">{project.project_id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              Set status
            </Button>
          </div>
        </div>
      </div>

      {/* Project Tasks Ribbon */}
      <div className="fixed left-0 top-0 w-64 h-full bg-white/10 backdrop-blur-md border-r border-white/20 shadow-2xl z-40 transition-all duration-300">
        <div className="flex flex-col h-full pt-20">
          {/* Back Button */}
          <div className="flex-shrink-0 px-3 py-4 border-b border-white/20">
            <button
              onClick={() => onNavigate("project-detail")}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white hover:bg-white/30 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Project</span>
            </button>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 flex flex-col py-4 space-y-1 overflow-y-auto px-3">
            <button
              onClick={() => onNavigate('projects')}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/30 transition-all duration-200 text-left"
            >
              <Briefcase className="w-4 h-4" />
              <span className="text-sm font-medium">Projects</span>
            </button>
            <button
              onClick={() => onNavigate('tasks')}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/30 transition-all duration-200 text-left"
            >
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Tasks</span>
            </button>
            <button
              onClick={() => onNavigate('finance')}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/30 transition-all duration-200 text-left"
            >
              <DollarSign className="w-4 h-4" />
              <span className="text-sm font-medium">Finance</span>
            </button>
            <button
              onClick={() => onNavigate('sales')}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/30 transition-all duration-200 text-left"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Sales</span>
            </button>
            <button
              onClick={() => onNavigate('bim')}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/30 transition-all duration-200 text-left"
            >
              <Map className="w-4 h-4" />
              <span className="text-sm font-medium">BIM</span>
            </button>
          </div>

          {/* Support Section */}
          <div className="border-t border-white/20 px-3 py-4 space-y-1">
            <div className="text-xs font-medium text-white uppercase tracking-wider px-3 py-2">
              Support
            </div>
            <button
              onClick={() => onNavigate('settings')}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/30 transition-all duration-200 text-left"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium">Settings</span>
            </button>
            <button
              onClick={() => onNavigate('support')}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/30 transition-all duration-200 text-left"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Help Center</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto ml-64">
        {/* Action Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80 bg-gray-50 border-gray-200"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" className="px-4 py-2">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" className="px-4 py-2">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </div>

        {/* Content based on active tab */}
        <div className="p-6">
          {renderActiveView()}
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
