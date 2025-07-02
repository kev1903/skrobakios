
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Filter, Search, Eye } from 'lucide-react';
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

  useEffect(() => {
    if (project?.id) {
      loadTasksForProject(project.id);
    }
  }, [project?.id, loadTasksForProject]);

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

      {/* Horizontal Ribbon Navigation */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex items-center space-x-1 overflow-x-auto">
          {ribbonItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === item.id
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 border-transparent hover:border-gray-300'
              }`}
            >
              {item.icon && <item.icon className="w-4 h-4" />}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
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
