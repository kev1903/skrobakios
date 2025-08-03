import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Calendar, TrendingUp, Plus, Filter, Download, Building2, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { useProjects, Project } from "@/hooks/useProjects";
import { useToast } from "@/hooks/use-toast";
import { useSortPreferences, SortDirection } from "@/hooks/useSortPreferences";
import { ProjectListProps, SortField, ViewMode } from "./projects/types";
import { ProjectListHeader } from "./projects/ProjectListHeader";
import { ProjectGridView } from "./projects/ProjectGridView";
import { ProjectTableView } from "./projects/ProjectTableView";
import { ProjectDashboardView } from "./projects/ProjectDashboardView";
import { ProjectLoadingState } from "./projects/ProjectLoadingState";
import { ProjectEmptyState } from "./projects/ProjectEmptyState";

export const ProjectList = ({ onNavigate, onSelectProject }: ProjectListProps) => {
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentTime, setCurrentTime] = useState(new Date());
  const { getProjects, loading } = useProjects();
  const { sortField, sortDirection, handleSort: handleSortPersistent, loading: sortLoading } = useSortPreferences('projects', 'name' as SortField);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      console.log("Fetching projects from database...");
      const fetchedProjects = await getProjects();
      console.log("Fetched projects:", fetchedProjects);
      setProjects(fetchedProjects);
    };

    fetchProjects();
  }, [getProjects]); // Add getProjects dependency

  // Calculate project statistics
  const projectStats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'in_progress').length,
    completed: projects.filter(p => p.status === 'completed').length,
    pending: projects.filter(p => p.status === 'pending').length,
  };

  const handleSort = (field: SortField) => {
    handleSortPersistent(field);
  };

  const getSortedProjects = () => {
    return [...projects].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle null/undefined values
      if (!aValue && !bValue) return 0;
      if (!aValue) return sortDirection === 'asc' ? 1 : -1;
      if (!bValue) return sortDirection === 'asc' ? -1 : 1;

      // Convert to string for comparison
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProjects(projects.map(p => p.id));
    } else {
      setSelectedProjects([]);
    }
  };

  const handleSelectProject = (projectId: string, checked: boolean) => {
    if (checked) {
      setSelectedProjects(prev => [...prev, projectId]);
    } else {
      setSelectedProjects(prev => prev.filter(id => id !== projectId));
    }
  };

  const handleProjectClick = (projectId: string) => {
    console.log("Project clicked:", projectId);
    if (onSelectProject) {
      onSelectProject(projectId);
    }
    
    console.log("Navigating to project detail with project ID:", projectId);
    onNavigate("project-detail");
  };

  if (loading) {
    return <ProjectLoadingState />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100/50 to-blue-200/30 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.15)_1px,transparent_0)] bg-[length:24px_24px] pointer-events-none" />
      
      <div className="relative z-10 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onNavigate("home")}
              className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 hover:bg-white/50 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Button>
            <div className="h-6 w-px bg-slate-300" />
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Business Finance Page</h1>
              <p className="text-slate-600 mt-1">
                Financial overview and project portfolio management • {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="glass-hover bg-white/70 border-blue-200/50">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" size="sm" className="glass-hover bg-white/70 border-blue-200/50">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
              onClick={() => onNavigate('create-project')}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl shadow-blue-900/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Projects</CardTitle>
              <Building2 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{projectStats.total}</div>
              <p className="text-xs text-slate-500">
                Financial portfolio projects
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl shadow-blue-900/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{projectStats.active}</div>
              <p className="text-xs text-slate-500">
                Currently active
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl shadow-blue-900/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{projectStats.completed}</div>
              <p className="text-xs text-slate-500">
                Successfully delivered
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl shadow-blue-900/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Pending</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{projectStats.pending}</div>
              <p className="text-xs text-slate-500">
                Awaiting approval
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Project List Header */}
        <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-xl shadow-xl shadow-blue-900/5 p-6">
          <ProjectListHeader
            projectsCount={projects.length}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onNavigate={onNavigate}
          />

          {/* Projects Content */}
          <div className="mt-6">
            {projects.length === 0 ? (
              <ProjectEmptyState onNavigate={onNavigate} />
            ) : viewMode === 'dashboard' ? (
              <ProjectDashboardView projects={getSortedProjects()} />
            ) : viewMode === 'grid' ? (
              <ProjectGridView
                projects={getSortedProjects()}
                selectedProjects={selectedProjects}
                onSelectProject={handleSelectProject}
                onProjectClick={handleProjectClick}
              />
            ) : (
              <ProjectTableView
                projects={getSortedProjects()}
                selectedProjects={selectedProjects}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                onSelectAll={handleSelectAll}
                onSelectProject={handleSelectProject}
                onProjectClick={handleProjectClick}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
