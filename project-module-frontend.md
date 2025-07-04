# Project Module UI Frontend Code

## Main Project Components

### 1. ProjectDetail.tsx
```typescript
import { useState, useEffect, useMemo, useRef } from "react";
import { useProjects, Project } from "@/hooks/useProjects";
import { ProjectSidebar } from "./ProjectSidebar";
import { ProjectHeader } from "./ProjectHeader";
import { ProjectInfo } from "./ProjectInfo";
import { ProjectProgress } from "./ProjectProgress";
import { ProjectMetrics } from "./ProjectMetrics";
import { LatestUpdates } from "./LatestUpdates";

interface ProjectDetailProps {
  projectId: string | null;
  onNavigate: (page: string) => void;
}

export const ProjectDetail = ({ projectId, onNavigate }: ProjectDetailProps) => {

  const [project, setProject] = useState<Project | null>(null);
  const [bannerImage, setBannerImage] = useState<string>("");
  const [bannerPosition, setBannerPosition] = useState({ x: 0, y: 0, scale: 1 });
  const [localLoading, setLocalLoading] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { getProject, loading } = useProjects();

  // Always call useMemo hooks before any conditional logic
  const progress = useMemo(() => {
    if (!project) return 0;
    switch (project.status) {
      case "completed": return 100;
      case "running": return 65;
      case "pending": return 0;
      default: return 0;
    }
  }, [project?.status]);

  const wbsCount = useMemo(() => {
    if (!project) return 8;
    // Generate consistent count based on project ID to avoid changing on each render
    const hash = project.id.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return Math.abs(hash % 10) + 8;
  }, [project?.id]);

  useEffect(() => {
    // Set timeout for loading state
    timeoutRef.current = setTimeout(() => {
      setLocalLoading(false);
    }, 3000); // 3 second timeout

    const fetchProject = async () => {
      setLocalLoading(true);
      
      if (!projectId) {
        // No projectId provided, show message or redirect
        setLocalLoading(false);
        return;
      }
      
      try {
        const foundProject = await getProject(projectId);
        if (foundProject) {
          setProject(foundProject);
          
          // Load banner image from localStorage
          const savedBanner = localStorage.getItem(`project_banner_${foundProject.id}`);
          if (savedBanner) {
            setBannerImage(savedBanner);
          }

          // Load banner position from localStorage
          const savedBannerPosition = localStorage.getItem(`project_banner_position_${foundProject.id}`);
          if (savedBannerPosition) {
            try {
              const position = JSON.parse(savedBannerPosition);
              setBannerPosition(position);
            } catch (error) {
              console.error('Error parsing saved banner position:', error);
            }
          }
        } else {
          // Project not found, set to null
          setProject(null);
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        // Set to null on error
        setProject(null);
      } finally {
        setLocalLoading(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      }
    };

    fetchProject();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [projectId, getProject]);

  const handleProjectUpdate = (updatedProject: Project) => {
    setProject(updatedProject);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "running":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "pending":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "running":
        return "In Progress";
      case "pending":
        return "Pending";
      default:
        return "Active";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Show loading state
  if (localLoading && !project) {
    return (
      <div className="h-screen flex bg-gray-50">
        <div className="flex items-center justify-center w-full">
          <div className="text-gray-500">Loading project details...</div>
        </div>
      </div>
    );
  }

  // Show error message if no project found and not loading
  if (!project && !localLoading) {
    return (
      <div className="h-screen flex bg-gray-50">
        <div className="flex items-center justify-center w-full">
          <div className="text-center">
            <div className="text-gray-500 text-lg mb-2">Project not found</div>
            <button 
              onClick={() => onNavigate("project-dashboard")}
              className="text-blue-600 hover:text-blue-800"
            >
              Back to Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Ensure we have a valid project before proceeding
  if (!project) {
    return null;
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Project Sidebar */}
      <ProjectSidebar
        project={project}
        onNavigate={onNavigate}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <ProjectHeader
            project={project}
            bannerImage={bannerImage}
            bannerPosition={bannerPosition}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
            onProjectUpdate={handleProjectUpdate}
          />

          <ProjectInfo
            project={project}
            getStatusText={getStatusText}
            formatDate={formatDate}
          />

          <ProjectProgress progress={progress} wbsCount={wbsCount} />

          <ProjectMetrics project={project} />

          <LatestUpdates
            project={project}
            progress={progress}
            wbsCount={wbsCount}
          />
        </div>
      </div>
    </div>
  );
};
```

### 2. ProjectDashboard.tsx
```typescript
import { useState, useEffect } from "react";
import { Upload, Calendar, MapPin, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProjects, Project } from "@/hooks/useProjects";

interface ProjectDashboardProps {
  onSelectProject: (projectId: string) => void;
  onNavigate: (page: string) => void;
}

export const ProjectDashboard = ({ onSelectProject, onNavigate }: ProjectDashboardProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const { getProjects, loading } = useProjects();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const fetchedProjects = await getProjects();
        setProjects(fetchedProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
        // Set empty array on error to prevent infinite loading
        setProjects([]);
      }
    };

    fetchProjects();
  }, [getProjects]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "running":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "pending":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "running":
        return "In Progress";
      case "pending":
        return "Pending";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getProgress = (status: string) => {
    switch (status) {
      case "completed":
        return 100;
      case "running":
        return Math.floor(Math.random() * 50) + 30; // Random progress between 30-80%
      case "pending":
        return 0;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <div className="h-full overflow-auto">
        <div className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading projects...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Dashboard</h1>
            <p className="text-gray-600">Manage your construction estimation projects</p>
          </div>
          <Button 
            onClick={() => onNavigate("create-project")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2"
          >
            <Upload className="w-5 h-5" />
            <span>New Project</span>
          </Button>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">No projects found</div>
            <Button
              onClick={() => onNavigate("create-project")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Your First Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project) => {
              const progress = getProgress(project.status);
              return (
                <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                        {project.name}
                      </CardTitle>
                      <Badge 
                        variant="outline" 
                        className={getStatusColor(project.status)}
                      >
                        {getStatusText(project.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {project.location && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{project.location}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{formatDate(project.created_at)}</span>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Project ID</span>
                        <span className="text-sm font-medium">#{project.project_id}</span>
                      </div>
                      {project.contract_price && (
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-sm text-gray-600">Contract Price</span>
                          <span className="text-sm font-bold text-gray-900">{project.contract_price}</span>
                        </div>
                      )}
                      
                      {progress > 0 && (
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-500">Progress</span>
                            <span className="text-xs text-gray-500">{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      <Button 
                        onClick={() => {
                          onSelectProject(project.id);
                          onNavigate("project-detail");
                        }}
                        variant="outline" 
                        className="w-full flex items-center space-x-2 hover:bg-gray-50"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
```

### 3. ProjectList.tsx
```typescript
import { useState, useEffect } from "react";
import { Plus, Filter, MoreHorizontal, Eye, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProjects, Project } from "@/hooks/useProjects";
import { useToast } from "@/hooks/use-toast";

interface ProjectListProps {
  onNavigate: (page: string) => void;
  onSelectProject?: (projectId: string) => void;
}

type SortField = 'project_id' | 'name' | 'description' | 'start_date' | 'deadline' | 'status';
type SortDirection = 'asc' | 'desc';

export const ProjectList = ({ onNavigate, onSelectProject }: ProjectListProps) => {
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const { getProjects, loading } = useProjects();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProjects = async () => {
      console.log("Fetching projects from database...");
      const fetchedProjects = await getProjects();
      console.log("Fetched projects:", fetchedProjects);
      setProjects(fetchedProjects);
    };

    fetchProjects();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "running":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "pending":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "running":
        return "In Progress";
      case "pending":
        return "Pending";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
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

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead 
      className="font-medium text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-2">
        <span>{children}</span>
        <div className="flex flex-col">
          <ArrowUp 
            className={`w-3 h-3 ${sortField === field && sortDirection === 'asc' ? 'text-blue-600' : 'text-gray-400'}`} 
          />
          <ArrowDown 
            className={`w-3 h-3 ${sortField === field && sortDirection === 'desc' ? 'text-blue-600' : 'text-gray-400'}`} 
          />
        </div>
      </div>
    </TableHead>
  );

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
    onNavigate("project-detail");
  };

  const isAllSelected = selectedProjects.length === projects.length && projects.length > 0;
  const isIndeterminate = selectedProjects.length > 0 && selectedProjects.length < projects.length;

  if (loading) {
    return (
      <div className="h-full overflow-auto bg-gray-50/30 backdrop-blur-sm">
        <div className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading projects...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-gray-50/30 backdrop-blur-sm">
      <div className="p-8">
        {/* Create New Project Button - Prominent at top */}
        <div className="mb-6">
          <Button
            onClick={() => onNavigate("create-project")}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2 px-6 py-3 text-base font-medium"
            size="lg"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Project</span>
          </Button>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 font-poppins">Projects</h1>
            <p className="text-gray-600 font-inter">Manage your construction projects ({projects.length} total)</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </Button>
          </div>
        </div>

        {/* Projects Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {projects.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-500 mb-4">No projects found</div>
              <Button
                onClick={() => onNavigate("create-project")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Create Your First Project
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isIndeterminate;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </TableHead>
                  <SortableHeader field="project_id">ID</SortableHeader>
                  <SortableHeader field="name">Project Name</SortableHeader>
                  <SortableHeader field="description">Description</SortableHeader>
                  <SortableHeader field="start_date">Start Date</SortableHeader>
                  <SortableHeader field="deadline">Due Date</SortableHeader>
                  <SortableHeader field="status">Status</SortableHeader>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getSortedProjects().map((project) => {
                  console.log("Rendering project:", project.name, "with ID:", project.id);
                  return (
                    <TableRow key={project.id} className="hover:bg-gray-50/50">
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedProjects.includes(project.id)}
                          onChange={(e) => handleSelectProject(project.id, e.target.checked)}
                          className="rounded border-gray-300"
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm text-gray-600">
                        #{project.project_id}
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">
                        <button
                          onClick={() => handleProjectClick(project.id)}
                          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left"
                        >
                          {project.name}
                        </button>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {project.description || '-'}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {project.start_date ? formatDate(project.start_date) : '-'}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {project.deadline ? formatDate(project.deadline) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={getStatusColor(project.status)}
                        >
                          {getStatusText(project.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              className="flex items-center space-x-2"
                              onClick={() => handleProjectClick(project.id)}
                            >
                              <Eye className="w-4 h-4" />
                              <span>View Details</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
};
```

### 4. ProjectTasksPage.tsx
```typescript
import React, { useState, useEffect, useCallback } from 'react';
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
```

### 5. ProjectTeamPage.tsx
```typescript
import { ProjectSidebar } from "./ProjectSidebar";
import { Project } from "@/hooks/useProjects";
import { useTeamData } from "@/hooks/useTeamData";
import { useTeamActions } from "@/hooks/useTeamActions";
import { TeamMembersList } from "./team/TeamMembersList";
import { TeamStatistics } from "./team/TeamStatistics";
import { TeamPageHeader } from "./team/TeamPageHeader";

interface ProjectTeamPageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const ProjectTeamPage = ({ project, onNavigate }: ProjectTeamPageProps) => {
  const {
    teamMembers,
    setTeamMembers,
    accessSettings,
    setAccessSettings,
    loading
  } = useTeamData(project.id);

  const {
    handleInviteMember,
    resendInvitation,
    removeMember,
    updateMemberRole,
    updateAccessSettings
  } = useTeamActions(project.id, teamMembers, setTeamMembers, accessSettings, setAccessSettings);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-700 bg-green-100 border-green-200";
      case "in_progress":
        return "text-blue-700 bg-blue-100 border-blue-200";
      case "pending":
        return "text-yellow-700 bg-yellow-100 border-yellow-200";
      default:
        return "text-gray-700 bg-gray-100 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex bg-gray-50">
        <ProjectSidebar
          project={project}
          onNavigate={onNavigate}
          getStatusColor={getStatusColor}
          getStatusText={getStatusText}
          activeSection="team"
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading team members...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <ProjectSidebar
        project={project}
        onNavigate={onNavigate}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
        activeSection="team"
      />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <TeamPageHeader 
            onInviteMember={handleInviteMember}
            onUpdateSettings={updateAccessSettings}
            accessSettings={accessSettings}
          />

          <TeamStatistics teamMembers={teamMembers} accessSettings={accessSettings} />
          
          <TeamMembersList
            teamMembers={teamMembers}
            onRemoveMember={removeMember}
            onUpdateRole={updateMemberRole}
            onResendInvitation={resendInvitation}
          />
        </div>
      </div>
    </div>
  );
};
```

### 6. ProjectSettingsPage.tsx
```typescript
import { useState, useEffect } from "react";
import { ArrowLeft, Save, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Project, useProjects } from "@/hooks/useProjects";
import { useToast } from "@/hooks/use-toast";
import { ProjectInformationCard } from "./project-settings/ProjectInformationCard";
import { SharePointIntegrationCard } from "./project-settings/SharePointIntegrationCard";
import { TimelineStatusCard } from "./project-settings/TimelineStatusCard";
import { DangerZoneCard } from "./project-settings/DangerZoneCard";
import { ProjectOverviewCard } from "./project-settings/ProjectOverviewCard";
import { ProjectBannerCard } from "./project-settings/ProjectBannerCard";

interface ProjectSettingsPageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const ProjectSettingsPage = ({ project, onNavigate }: ProjectSettingsPageProps) => {
  const { toast } = useToast();
  const { deleteProject, updateProject, loading } = useProjects();
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({
    project_id: project.project_id,
    name: project.name,
    description: project.description || "",
    location: project.location || "",
    coordinates: undefined as { lat: number; lng: number } | undefined,
    priority: project.priority || "Medium",
    status: project.status,
    start_date: project.start_date || "",
    deadline: project.deadline || "",
    sharepoint_link: "",
    banner_image: "",
    banner_position: { x: 0, y: 0, scale: 1 },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "in_progress": return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "on_hold": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed": return "Completed";
      case "in_progress": return "In Progress";
      case "pending": return "Pending";
      case "on_hold": return "On Hold";
      default: return "Unknown";
    }
  };

  const handleInputChange = (field: string, value: string | { lat: number; lng: number } | { x: number; y: number; scale: number }) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateSharePointLink = (url: string) => {
    return url.includes('sharepoint.com') || url.includes('onedrive.com') || url === '';
  };

  const handleSave = async () => {
    if (formData.sharepoint_link && !validateSharePointLink(formData.sharepoint_link)) {
      toast({
        title: "Invalid SharePoint Link",
        description: "Please enter a valid SharePoint or OneDrive link.",
        variant: "destructive",
      });
      return;
    }

    console.log("Saving project settings:", formData);
    
    // Prepare project updates (only include fields that exist in the database)
    const projectUpdates = {
      project_id: formData.project_id,
      name: formData.name,
      description: formData.description,
      location: formData.location,
      priority: formData.priority,
      status: formData.status,
      start_date: formData.start_date || null,
      deadline: formData.deadline || null,
    };

    // Update project in the database
    const updatedProject = await updateProject(project.id, projectUpdates);
    
    if (updatedProject) {
      // Store additional settings in localStorage (since they're not in the projects table)
      if (formData.sharepoint_link) {
        localStorage.setItem(`project_sharepoint_${project.id}`, formData.sharepoint_link);
      }

      if (formData.coordinates) {
        localStorage.setItem(`project_coordinates_${project.id}`, JSON.stringify(formData.coordinates));
      }

      if (formData.banner_image) {
        localStorage.setItem(`project_banner_${project.id}`, formData.banner_image);
      }

      if (formData.banner_position) {
        localStorage.setItem(`project_banner_position_${project.id}`, JSON.stringify(formData.banner_position));
      }

      toast({
        title: "Settings Saved",
        description: "Project settings have been updated successfully.",
      });
      
      // Navigate back to project detail to see the updated data
      setTimeout(() => {
        onNavigate("project-detail");
      }, 1000);
    } else {
      toast({
        title: "Save Failed",
        description: "Failed to update project settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProject = async () => {
    const success = await deleteProject(project.id);
    
    if (success) {
      toast({
        title: "Project Deleted",
        description: "The project has been permanently deleted.",
      });
      // Navigate back to dashboard after deletion
      onNavigate("dashboard");
    } else {
      toast({
        title: "Delete Failed",
        description: "Failed to delete the project. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Load existing SharePoint link from localStorage
    const savedLink = localStorage.getItem(`project_sharepoint_${project.id}`);
    if (savedLink) {
      setFormData(prev => ({
        ...prev,
        sharepoint_link: savedLink
      }));
    }

    // Load existing coordinates from localStorage
    const savedCoordinates = localStorage.getItem(`project_coordinates_${project.id}`);
    if (savedCoordinates) {
      try {
        const coordinates = JSON.parse(savedCoordinates);
        setFormData(prev => ({
          ...prev,
          coordinates
        }));
      } catch (error) {
        console.error('Error parsing saved coordinates:', error);
      }
    }

    // Load existing banner image from localStorage
    const savedBanner = localStorage.getItem(`project_banner_${project.id}`);
    if (savedBanner) {
      setFormData(prev => ({
        ...prev,
        banner_image: savedBanner
      }));
    }

    // Load existing banner position from localStorage
    const savedBannerPosition = localStorage.getItem(`project_banner_position_${project.id}`);
    if (savedBannerPosition) {
      try {
        const bannerPosition = JSON.parse(savedBannerPosition);
        setFormData(prev => ({
          ...prev,
          banner_position: bannerPosition
        }));
      } catch (error) {
        console.error('Error parsing saved banner position:', error);
      }
    }
  }, [project.id]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="relative backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border-b border-white/20 dark:border-slate-700/20 shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('dashboard')}
                className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 hover:bg-white/40 backdrop-blur-sm transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium">Back</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
                  Project Settings
                </h1>
                <p className="text-sm text-slate-500 mt-1">Manage your project configuration and details</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-1 lg:grid-cols-4 backdrop-blur-sm bg-white/60">
              <TabsTrigger value="general" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">General</span>
              </TabsTrigger>
              <TabsTrigger value="integration" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Integration</span>
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Timeline</span>
              </TabsTrigger>
              <TabsTrigger value="danger" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Danger Zone</span>
              </TabsTrigger>
            </TabsList>

            <div className="space-y-6">
              <TabsContent value="general" className="space-y-6 mt-0">
                <ProjectBannerCard 
                  formData={formData}
                  onInputChange={handleInputChange}
                />
                <ProjectInformationCard 
                  formData={formData}
                  onInputChange={handleInputChange}
                />
                <ProjectOverviewCard 
                  project={project}
                  formData={formData}
                  onInputChange={handleInputChange}
                  getStatusColor={getStatusColor}
                  getStatusText={getStatusText}
                />
              </TabsContent>

              <TabsContent value="integration" className="space-y-6 mt-0">
                <SharePointIntegrationCard 
                  formData={formData}
                  onInputChange={handleInputChange}
                />
              </TabsContent>

              <TabsContent value="timeline" className="space-y-6 mt-0">
                <TimelineStatusCard 
                  formData={formData}
                  onInputChange={handleInputChange}
                />
              </TabsContent>

              <TabsContent value="danger" className="space-y-6 mt-0">
                <DangerZoneCard 
                  project={project}
                  onDeleteProject={handleDeleteProject}
                  loading={loading}
                />
              </TabsContent>
            </div>

            {/* Save Button */}
            <div className="mt-8 flex justify-end">
              <Button 
                onClick={handleSave} 
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
```

## Task-Related Components

### 7. TaskBoardView.tsx
```typescript
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useTaskContext } from './TaskContext';
import { TaskBoardColumn } from './TaskBoardColumn';
import { TaskEditSidePanel } from './TaskEditSidePanel';
import { Task } from './TaskContext';

export const TaskBoardView = ({ projectId }: { projectId?: string }) => {
  const { tasks, addTask, updateTask } = useTaskContext();
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  const statusColumns = [
    { id: 'Not Started', title: 'Not Started', color: 'bg-gray-50' },
    { id: 'Pending', title: 'Pending', color: 'bg-yellow-50' },
    { id: 'In Progress', title: 'In Progress', color: 'bg-blue-50' },
    { id: 'Completed', title: 'Completed', color: 'bg-green-50' }
  ];

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const handleTaskClick = (task: Task) => {
    console.log('Board task clicked:', task);
    // Don't open side panel for temporary tasks being edited
    if (task.id.startsWith('temp-')) {
      return;
    }
    
    setSelectedTask(task);
    setIsSidePanelOpen(true);
    console.log('Board side panel should open now');
  };

  const handleCloseSidePanel = () => {
    setIsSidePanelOpen(false);
    setSelectedTask(null);
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If there's no destination or the item was dropped in the same place, do nothing
    if (!destination || (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )) {
      return;
    }

    // Find the task being dragged
    const draggedTask = tasks.find(task => task.id === draggableId);
    if (!draggedTask) return;

    // Update the task's status to match the destination column
    const newStatus = destination.droppableId as Task['status'];
    updateTask(draggedTask.id, { status: newStatus });

    console.log(`Moved task "${draggedTask.taskName}" from ${source.droppableId} to ${newStatus}`);
  };

  const handleAddTask = (status: string) => {
    const tempTaskId = `temp-${Date.now()}`;
    console.log(`Adding new task to ${status} column`);
    
    // Don't create temporary tasks - we'll handle this differently
    console.log("Add task clicked for status:", status);
    setEditingTaskId(tempTaskId);
    setNewTaskTitle('');
  };

  const handleSaveTask = (taskId: string, status: string) => {
    if (!newTaskTitle.trim()) {
      handleCancelEdit(taskId);
      return;
    }

    if (!projectId) return;
    
    const finalTask = {
      project_id: projectId,
      taskName: newTaskTitle.trim(),
      priority: 'Medium' as const,
      assignedTo: { name: 'Unassigned', avatar: '' },
      dueDate: new Date().toISOString().split('T')[0],
      status: status as 'Completed' | 'In Progress' | 'Pending' | 'Not Started',
      progress: 0,
      description: '',
      category: 'General'
    };

    addTask(finalTask);

    console.log(`Added new task: ${newTaskTitle} to ${status} column`);
    setEditingTaskId(null);
    setNewTaskTitle('');
  };

  const handleCancelEdit = (taskId: string) => {
    setEditingTaskId(null);
    setNewTaskTitle('');
  };

  const handleKeyPress = (e: React.KeyboardEvent, taskId: string, status: string) => {
    if (e.key === 'Enter') {
      handleSaveTask(taskId, status);
    } else if (e.key === 'Escape') {
      handleCancelEdit(taskId);
    }
  };

  const handleBlur = (taskId: string, status: string) => {
    // Only save if the task name is not empty, otherwise cancel the edit
    if (newTaskTitle.trim()) {
      handleSaveTask(taskId, status);
    } else {
      handleCancelEdit(taskId);
    }
  };

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {statusColumns.map((column) => (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`rounded-lg p-4 transition-colors ${
                    snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-blue-200' : ''
                  }`}
                >
                  <TaskBoardColumn
                    column={column}
                    tasks={getTasksByStatus(column.id)}
                    editingTaskId={editingTaskId}
                    newTaskTitle={newTaskTitle}
                    onTaskTitleChange={setNewTaskTitle}
                    onSaveTask={handleSaveTask}
                    onCancelEdit={handleCancelEdit}
                    onKeyPress={handleKeyPress}
                    onBlur={handleBlur}
                    onAddTask={handleAddTask}
                    onTaskClick={handleTaskClick}
                  />
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      <TaskEditSidePanel
        task={selectedTask}
        isOpen={isSidePanelOpen}
        onClose={handleCloseSidePanel}
      />
    </>
  );
};
```

## Supporting Components

### 8. Dashboard ProjectsList.tsx
```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Calendar, Users } from "lucide-react";

const projects = [
  {
    id: "01",
    name: "Project Alpha",
    status: "Running",
    deadline: "02 Sep 2023",
    team: 3,
    progress: 75
  },
  {
    id: "02",
    name: "Project Beta",
    status: "Pending",
    deadline: "15 Sep 2023",
    team: 5,
    progress: 25
  },
  {
    id: "20",
    name: "Project Gamma",
    status: "Completed",
    deadline: "28 Aug 2023",
    team: 4,
    progress: 100
  },
  {
    id: "10",
    name: "Project Delta",
    status: "Running",
    deadline: "10 Oct 2023",
    team: 6,
    progress: 60
  }
];

interface ProjectsListProps {
  onSelectProject: (projectId: string) => void;
  onNavigate: (page: string) => void;
}

export const ProjectsList = ({ onSelectProject, onNavigate }: ProjectsListProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Running":
        return { 
          variant: "default" as const, 
          className: "bg-blue-100 text-blue-700 hover:bg-blue-100",
          dotColor: "bg-blue-500"
        };
      case "Pending":
        return { 
          variant: "secondary" as const, 
          className: "bg-amber-100 text-amber-700 hover:bg-amber-100",
          dotColor: "bg-amber-500"
        };
      case "Completed":
        return { 
          variant: "default" as const, 
          className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
          dotColor: "bg-emerald-500"
        };
      default:
        return { 
          variant: "outline" as const, 
          className: "bg-slate-100 text-slate-700 hover:bg-slate-100",
          dotColor: "bg-slate-500"
        };
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-800">Recent Projects</CardTitle>
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {projects.map((project) => {
            const statusConfig = getStatusConfig(project.status);
            return (
              <div 
                key={project.id} 
                className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 rounded-xl transition-colors border border-slate-100"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-2 h-2 rounded-full ${statusConfig.dotColor}`}></div>
                    <span className="font-semibold text-slate-800 truncate">{project.name}</span>
                    <Badge 
                      variant={statusConfig.variant}
                      className={`text-xs px-2 py-1 ${statusConfig.className}`}
                    >
                      {project.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{project.deadline}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{project.team} members</span>
                    </div>
                  </div>
                  
                  {project.status !== "Completed" && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-500">Progress</span>
                        <span className="font-medium text-slate-700">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" 
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  onClick={() => {
                    onSelectProject(project.id);
                    onNavigate("project-detail");
                  }}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
```

### 9. Sales ProjectsDashboard.tsx
```typescript
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Search,
  Plus,
  Filter,
  List,
  LayoutGrid,
  Calendar,
  Users,
  DollarSign
} from 'lucide-react';

export const ProjectsDashboard = () => {
  const [viewMode, setViewMode] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');

  const projects = [
    {
      id: '1',
      name: 'Residential Extension',
      address: '123 Smith Street, Melbourne',
      client: 'John Smith',
      budget: '$250,000',
      actual: '$180,000',
      status: 'Active',
      pm: 'Sarah Wilson',
      serviceType: 'Residential',
      completion: 65,
      startDate: '2024-01-01',
      team: [
        { name: 'Mike Johnson', role: 'Engineer', avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png' },
        { name: 'Lisa Brown', role: 'Architect', avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png' }
      ],
      milestones: [
        { name: 'Design Complete', status: 'completed' },
        { name: 'Permits Approved', status: 'completed' },
        { name: 'Construction Started', status: 'active' },
        { name: 'Final Inspection', status: 'pending' }
      ]
    },
    {
      id: '2',
      name: 'Office Fitout',
      address: '456 Collins Street, Melbourne',
      client: 'TechCorp Ltd',
      budget: '$180,000',
      actual: '$95,000',
      status: 'On Hold',
      pm: 'David Miller',
      serviceType: 'Commercial',
      completion: 30,
      startDate: '2024-02-15',
      team: [
        { name: 'John Smith', role: 'PM', avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png' }
      ],
      milestones: [
        { name: 'Design Complete', status: 'completed' },
        { name: 'Material Orders', status: 'active' },
        { name: 'Installation', status: 'pending' },
        { name: 'Handover', status: 'pending' }
      ]
    },
    {
      id: '3',
      name: 'Kitchen Renovation',
      address: '789 High Street, Richmond',
      client: 'Emma Davis',
      budget: '$45,000',
      actual: '$45,000',
      status: 'Completed',
      pm: 'Lisa Brown',
      serviceType: 'Residential',
      completion: 100,
      startDate: '2023-11-01',
      team: [
        { name: 'David Miller', role: 'Electrician', avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png' },
        { name: 'Sarah Wilson', role: 'Designer', avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png' }
      ],
      milestones: [
        { name: 'Design Complete', status: 'completed' },
        { name: 'Demolition', status: 'completed' },
        { name: 'Installation', status: 'completed' },
        { name: 'Final Inspection', status: 'completed' }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'On Hold': return 'bg-yellow-100 text-yellow-700';
      case 'Completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const ProjectCard = ({ project }: { project: any }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">{project.name}</h3>
            <p className="text-sm text-gray-600">{project.address}</p>
            <p className="text-sm text-gray-600">Client: {project.client}</p>
          </div>
          <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Budget vs Actual</p>
            <p className="font-medium text-green-600">{project.budget}</p>
            <p className="text-sm text-gray-600">Spent: {project.actual}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Completion</p>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${project.completion}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">{project.completion}%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-400" />
            <div className="flex -space-x-2">
              {project.team.slice(0, 3).map((member: any, index: number) => (
                <Avatar key={index} className="w-6 h-6 border-2 border-white">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback className="text-xs">{member.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                </Avatar>
              ))}
              {project.team.length > 3 && (
                <div className="w-6 h-6 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-xs">+{project.team.length - 3}</span>
                </div>
              )}
            </div>
          </div>
          <Button size="sm" variant="outline">View Details</Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Projects Dashboard</h2>
          <p className="text-gray-600">Manage and track all your projects</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All PM" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All PM</SelectItem>
              <SelectItem value="sarah">Sarah Wilson</SelectItem>
              <SelectItem value="david">David Miller</SelectItem>
              <SelectItem value="lisa">Lisa Brown</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={viewMode === 'cards' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('cards')}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button 
            variant={viewMode === 'table' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Projects</CardTitle>
            <CardDescription>Detailed view of all projects</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>PM</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-gray-600">{project.address}</div>
                      </div>
                    </TableCell>
                    <TableCell>{project.client}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-green-600">{project.budget}</div>
                        <div className="text-sm text-gray-600">Spent: {project.actual}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${project.completion}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{project.completion}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{project.pm}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
```

### 10. Project Settings Cards

#### FinancialInformationCard.tsx
```typescript
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign } from "lucide-react";

interface FinancialInformationCardProps {
  formData: {
    contract_price: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export const FinancialInformationCard = ({ formData, onInputChange }: FinancialInformationCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Financial Information
        </CardTitle>
        <CardDescription>
          Project budget and contract details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          <Label htmlFor="contract-price">Contract Price</Label>
          <Input
            id="contract-price"
            value={formData.contract_price}
            onChange={(e) => onInputChange("contract_price", e.target.value)}
            placeholder="Enter contract price (e.g., $2,450,000)"
          />
        </div>
      </CardContent>
    </Card>
  );
};
```

### 11. Gantt Components

#### GanttHeader.tsx
```typescript
import React from 'react';
import { Download, Settings, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Project } from '@/hooks/useProjects';

interface GanttHeaderProps {
  project: Project;
}

export const GanttHeader = ({ project }: GanttHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Gantt Chart</h1>
        <p className="text-gray-600">{project.name} - Project Timeline</p>
      </div>
      <div className="flex space-x-3">
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Chart
        </Button>
        <Button variant="outline">
          <Settings className="w-4 h-4 mr-2" />
          View Options
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Calendar className="w-4 h-4 mr-2" />
          Update Tasks
        </Button>
      </div>
    </div>
  );
};
```