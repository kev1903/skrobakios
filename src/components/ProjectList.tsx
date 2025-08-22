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
import { MobileProjectList } from "./projects/MobileProjectList";
import { useIsMobile } from "@/hooks/use-mobile";

export const ProjectList = ({ onNavigate, onSelectProject }: ProjectListProps) => {
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentTime, setCurrentTime] = useState(new Date());
  const { getProjects, loading } = useProjects();
  const { sortField, sortDirection, handleSort: handleSortPersistent, loading: sortLoading } = useSortPreferences('projects', 'name' as SortField);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      console.log("📋 ProjectList: Fetching projects from database...");
      const fetchedProjects = await getProjects();
      console.log("📋 ProjectList: Fetched projects:", fetchedProjects.length);
      console.log("📋 ProjectList: Project details:", fetchedProjects.map(p => ({ id: p.id, name: p.name })));
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

  // Use mobile-optimized component on mobile devices
  if (isMobile) {
    return <MobileProjectList onNavigate={onNavigate} onSelectProject={onSelectProject} />;
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 relative">
      {/* Main content container */}
      <div className={`${isMobile ? 'p-4' : 'p-6'} space-y-${isMobile ? '4' : '6'} min-h-full`}>
        {/* Header */}
        <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'items-center justify-between'}`}>
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size={isMobile ? "sm" : "sm"}
              onClick={() => onNavigate("home")}
              className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 hover:bg-white/50 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Button>
            {!isMobile && <div className="h-6 w-px bg-slate-300" />}
            <div>
              <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-slate-800`}>Project List</h1>
              <p className={`text-slate-600 mt-1 ${isMobile ? 'text-sm' : ''}`}>
                Manage and oversee all your projects{!isMobile && ' • '}{!isMobile && currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
                {isMobile && (
                  <><br />{currentTime.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</>
                )}
              </p>
            </div>
          </div>
          
          <div className={`flex items-center gap-3 ${isMobile ? 'flex-wrap' : ''}`}>
            {!isMobile && (
              <>
                <Button variant="outline" size="sm" className="glass-hover bg-white/70 border-blue-200/50">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <Button variant="outline" size="sm" className="glass-hover bg-white/70 border-blue-200/50">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </>
            )}
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
              onClick={() => onNavigate('create-project')}
              size={isMobile ? "sm" : "default"}
            >
              <Plus className="h-4 w-4 mr-2" />
              {isMobile ? 'New' : 'New Project'}
            </Button>
          </div>
        </div>

        {/* Minimized Stats Cards */}
        <div className={`grid ${isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3'}`}>
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-sm">
            <CardContent className={isMobile ? "p-2" : "p-3"}>
              <div className={`flex items-center ${isMobile ? 'flex-col text-center' : 'justify-between'}`}>
                <div className={`flex items-center ${isMobile ? 'flex-col' : 'gap-2'}`}>
                  <div className={`${isMobile ? 'text-xl' : 'text-lg'} font-bold text-slate-800`}>{projectStats.total}</div>
                  <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-slate-500`}>Total Projects</p>
                </div>
                {!isMobile && <Building2 className="h-4 w-4 text-blue-600" />}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-sm">
            <CardContent className={isMobile ? "p-2" : "p-3"}>
              <div className={`flex items-center ${isMobile ? 'flex-col text-center' : 'justify-between'}`}>
                <div className={`flex items-center ${isMobile ? 'flex-col' : 'gap-2'}`}>
                  <div className={`${isMobile ? 'text-xl' : 'text-lg'} font-bold text-orange-600`}>{projectStats.active}</div>
                  <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-slate-500`}>In Progress</p>
                </div>
                {!isMobile && <Clock className="h-4 w-4 text-orange-600" />}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-sm">
            <CardContent className={isMobile ? "p-2" : "p-3"}>
              <div className={`flex items-center ${isMobile ? 'flex-col text-center' : 'justify-between'}`}>
                <div className={`flex items-center ${isMobile ? 'flex-col' : 'gap-2'}`}>
                  <div className={`${isMobile ? 'text-xl' : 'text-lg'} font-bold text-green-600`}>{projectStats.completed}</div>
                  <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-slate-500`}>Completed</p>
                </div>
                {!isMobile && <CheckCircle2 className="h-4 w-4 text-green-600" />}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-sm">
            <CardContent className={isMobile ? "p-2" : "p-3"}>
              <div className={`flex items-center ${isMobile ? 'flex-col text-center' : 'justify-between'}`}>
                <div className={`flex items-center ${isMobile ? 'flex-col' : 'gap-2'}`}>
                  <div className={`${isMobile ? 'text-xl' : 'text-lg'} font-bold text-yellow-600`}>{projectStats.pending}</div>
                  <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-slate-500`}>Pending</p>
                </div>
                {!isMobile && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project List - No Header */}
        <div className={`bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl shadow-sm ${isMobile ? 'p-3' : 'p-6'}`}>
          {/* Projects Content */}
          <div>
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
                isMobile={isMobile}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
