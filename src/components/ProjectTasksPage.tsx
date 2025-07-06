
import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Download, Filter, Search, Eye, Briefcase, Calendar, DollarSign, TrendingUp, Map, Settings, HelpCircle, Grid2x2, LayoutList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Project } from '@/hooks/useProjects';
import { TaskProvider, useTaskContext } from './tasks/TaskContext';
import { TaskListView } from './tasks/TaskListView';
import { TaskBoardView } from './tasks/TaskBoardView';
import { TaskTimelineView } from './tasks/TaskTimelineView';
import { TaskCalendarView } from './tasks/TaskCalendarView';
import { ProjectSidebar } from './ProjectSidebar';

interface ProjectTasksPageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

const ProjectTasksContent = ({ project, onNavigate }: ProjectTasksPageProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("list");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const { loadTasksForProject } = useTaskContext();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "not started":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

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
        return <TaskListView projectId={project.id} viewMode={viewMode} />;
      case "board":
        return <TaskBoardView projectId={project.id} />;
      case "timeline":
        return <TaskTimelineView />;
      case "calendar":
        return <TaskCalendarView />;
      case "overview":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-white">Recent Tasks</h3>
              <TaskListView projectId={project.id} viewMode={viewMode} />
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-8">
              <p className="text-white/80 text-lg">Coming Soon</p>
              <p className="text-white/60 text-sm mt-2">
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
          {/* Header */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-white mb-2">{project.name} Tasks</h1>
                <p className="text-white/70">#{project.project_id}</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg">
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="text-white hover:bg-white/20"
                  >
                    <LayoutList className="w-4 h-4 mr-2" />
                    List
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="text-white hover:bg-white/20"
                  >
                    <Grid2x2 className="w-4 h-4 mr-2" />
                    Grid
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Actions Bar */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80 backdrop-blur-xl bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" className="backdrop-blur-xl bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" className="backdrop-blur-xl bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 mb-6">
            {["overview", "list", "board", "timeline", "calendar"].map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "default" : "ghost"}
                onClick={() => setActiveTab(tab)}
                className={`capitalize ${
                  activeTab === tab
                    ? "backdrop-blur-xl bg-white/20 border border-white/30 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {tab}
              </Button>
            ))}
          </div>

          {/* Content based on active tab */}
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
