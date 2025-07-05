import { useState, useEffect } from "react";
import { Plus, Filter, MoreHorizontal, Eye, ArrowUp, ArrowDown, LayoutGrid, List } from "lucide-react";
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
type ViewMode = 'list' | 'grid';

export const ProjectList = ({ onNavigate, onSelectProject }: ProjectListProps) => {
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
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
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "running":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      case "pending":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
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
      className="font-medium text-white cursor-pointer hover:bg-white/10 select-none transition-colors duration-200"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-2">
        <span>{children}</span>
        <div className="flex flex-col">
          <ArrowUp 
            className={`w-3 h-3 transition-colors duration-200 ${sortField === field && sortDirection === 'asc' ? 'text-blue-400' : 'text-white/60'}`} 
          />
          <ArrowDown 
            className={`w-3 h-3 transition-colors duration-200 ${sortField === field && sortDirection === 'desc' ? 'text-blue-400' : 'text-white/60'}`} 
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

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {getSortedProjects().map((project) => (
        <div key={project.id} className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-black/40 hover:border-white/30 transition-all duration-300 shadow-lg animate-fade-in">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
               <h3 className="text-lg font-semibold text-white mb-1">
                 <button
                   onClick={() => handleProjectClick(project.id)}
                   className="text-blue-300 hover:text-blue-200 hover:underline cursor-pointer text-left transition-colors duration-200"
                 >
                   {project.name}
                 </button>
               </h3>
               <p className="text-sm text-white/80 mb-2">#{project.project_id}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-white/80 hover:bg-white/20 hover:text-white transition-all duration-200">
                   <MoreHorizontal className="w-4 h-4" />
                 </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
                <DropdownMenuItem 
                  className="flex items-center space-x-2 text-white hover:bg-white/20 focus:bg-white/20 transition-colors duration-200"
                  onClick={() => handleProjectClick(project.id)}
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <p className="text-white/80 text-sm mb-4 line-clamp-2">
            {project.description || 'No description available'}
          </p>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Start Date:</span>
              <span className="text-white/80">{project.start_date ? formatDate(project.start_date) : '-'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Due Date:</span>
              <span className="text-white/80">{project.deadline ? formatDate(project.deadline) : '-'}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Badge 
              variant="outline" 
              className={getStatusColor(project.status)}
            >
              {getStatusText(project.status)}
            </Badge>
            <input
              type="checkbox"
              checked={selectedProjects.includes(project.id)}
              onChange={(e) => handleSelectProject(project.id, e.target.checked)}
              className="rounded border-white/30 bg-white/10 text-white focus:ring-white/30"
            />
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="h-full overflow-auto backdrop-blur-xl bg-black/20 border border-white/10 shadow-2xl">
        <div className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-white/80">Loading projects...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto backdrop-blur-xl bg-black/20 border border-white/10 shadow-2xl">
      <div className="p-8">
        {/* Create New Project Button - Prominent at top */}
        <div className="mb-6">
          <Button
            onClick={() => onNavigate("create-project")}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm flex items-center space-x-2 px-6 py-3 text-base font-medium transition-all duration-300"
            size="lg"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Project</span>
          </Button>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 font-poppins">Projects</h1>
            <p className="text-white/80 font-inter">Manage your construction projects ({projects.length} total)</p>
          </div>
          <div className="flex items-center space-x-3">
            {/* View Toggle Buttons */}
            <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/20">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={`${viewMode === 'list' 
                  ? 'bg-white/20 text-white hover:bg-white/30 border border-white/30' 
                  : 'text-white/80 hover:text-white hover:bg-white/10'
                } transition-all duration-200`}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`${viewMode === 'grid' 
                  ? 'bg-white/20 text-white hover:bg-white/30 border border-white/30' 
                  : 'text-white/80 hover:text-white hover:bg-white/10'
                } transition-all duration-200`}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:border-white/40 transition-all duration-200"
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </Button>
          </div>
        </div>

        {/* Projects Content */}
        {projects.length === 0 ? (
          <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/20 p-8 text-center shadow-lg">
            <div className="text-white/80 mb-4">No projects found</div>
            <Button
              onClick={() => onNavigate("create-project")}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm transition-all duration-300"
            >
              Create Your First Project
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          renderGridView()
        ) : (
          <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/20 shadow-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-black/40 border-white/10 hover:bg-black/50 transition-colors duration-200">
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isIndeterminate;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-white/30 bg-white/10 text-white focus:ring-white/30"
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
                    <TableRow key={project.id} className="hover:bg-black/30 border-white/10 transition-colors duration-200">
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedProjects.includes(project.id)}
                          onChange={(e) => handleSelectProject(project.id, e.target.checked)}
                          className="rounded border-white/30 bg-white/10 text-white focus:ring-white/30"
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm text-white/80">
                        #{project.project_id}
                      </TableCell>
                      <TableCell className="font-medium text-white">
                        <button
                          onClick={() => handleProjectClick(project.id)}
                          className="text-blue-300 hover:text-blue-200 hover:underline cursor-pointer text-left transition-colors duration-200"
                        >
                          {project.name}
                        </button>
                      </TableCell>
                      <TableCell className="text-white/80">
                        {project.description || '-'}
                      </TableCell>
                      <TableCell className="text-white/80">
                        {project.start_date ? formatDate(project.start_date) : '-'}
                      </TableCell>
                      <TableCell className="text-white/80">
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
                            <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-white/80 hover:bg-white/20 hover:text-white transition-all duration-200">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
                            <DropdownMenuItem 
                              className="flex items-center space-x-2 text-white hover:bg-white/20 focus:bg-white/20 transition-colors duration-200"
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
          </div>
        )}
      </div>
    </div>
  );
};
