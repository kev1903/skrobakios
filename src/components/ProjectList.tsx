import { useState, useEffect } from "react";
import { Plus, Filter, MoreHorizontal, Eye, ArrowUp, ArrowDown, LayoutGrid, List, ArrowLeft } from "lucide-react";
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

type SortField = 'project_id' | 'name' | 'description' | 'contract_price' | 'location' | 'priority' | 'start_date' | 'deadline' | 'status';
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
        return "bg-green-500/20 text-green-700 border-green-500/30";
      case "running":
        return "bg-orange-500/20 text-orange-700 border-orange-500/30";
      case "pending":
        return "bg-red-500/20 text-red-700 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-700 border-gray-500/30";
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
      className="font-medium text-foreground cursor-pointer hover:bg-muted/50 select-none transition-colors duration-200"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-2">
        <span>{children}</span>
        <div className="flex flex-col">
          <ArrowUp 
            className={`w-3 h-3 transition-colors duration-200 ${sortField === field && sortDirection === 'asc' ? 'text-primary' : 'text-muted-foreground'}`} 
          />
          <ArrowDown 
            className={`w-3 h-3 transition-colors duration-200 ${sortField === field && sortDirection === 'desc' ? 'text-primary' : 'text-muted-foreground'}`} 
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
        <div key={project.id} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
               <h3 className="text-lg font-semibold text-foreground mb-1">
                 <button
                   onClick={() => handleProjectClick(project.id)}
                   className="text-primary hover:text-primary/80 hover:underline cursor-pointer text-left transition-colors duration-200"
                 >
                   {project.name}
                 </button>
               </h3>
               <p className="text-sm text-muted-foreground mb-2">#{project.project_id}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200">
                   <MoreHorizontal className="w-4 h-4" />
                 </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border border-border shadow-xl">
                <DropdownMenuItem 
                  className="flex items-center space-x-2 text-foreground hover:bg-muted focus:bg-muted transition-colors duration-200"
                  onClick={() => handleProjectClick(project.id)}
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {project.description || 'No description available'}
          </p>
          
           <div className="space-y-2 mb-4">
             <div className="flex justify-between text-sm">
               <span className="text-muted-foreground">Contract Price:</span>
               <span className="text-foreground">{project.contract_price || '-'}</span>
             </div>
             <div className="flex justify-between text-sm">
               <span className="text-muted-foreground">Location:</span>
               <span className="text-foreground">{project.location || '-'}</span>
             </div>
             <div className="flex justify-between text-sm">
               <span className="text-muted-foreground">Priority:</span>
               <span className="text-foreground">{project.priority || '-'}</span>
             </div>
             <div className="flex justify-between text-sm">
               <span className="text-muted-foreground">Start Date:</span>
               <span className="text-foreground">{project.start_date ? formatDate(project.start_date) : '-'}</span>
             </div>
             <div className="flex justify-between text-sm">
               <span className="text-muted-foreground">Due Date:</span>
               <span className="text-foreground">{project.deadline ? formatDate(project.deadline) : '-'}</span>
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
              className="rounded border-input bg-background text-primary focus:ring-primary/30"
            />
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background z-40 overflow-auto">
        <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.15)_1px,transparent_0)] bg-[length:24px_24px] pointer-events-none" />
          <div className="relative z-10 p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                <div className="text-muted-foreground">Loading projects...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-40 overflow-auto">
      <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.15)_1px,transparent_0)] bg-[length:24px_24px] pointer-events-none" />
        <div className="relative z-10 p-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onNavigate("home")}
            className="flex items-center space-x-2 text-foreground hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Button>
        </div>

        {/* Create New Project Button - Prominent at top */}
        <div className="mb-6">
          <Button
            onClick={() => onNavigate("create-project")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center space-x-2 px-6 py-3 text-base font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
            size="lg"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Project</span>
          </Button>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 heading-modern">Projects</h1>
            <p className="text-muted-foreground body-modern">Manage your construction projects ({projects.length} total)</p>
          </div>
          <div className="flex items-center space-x-3">
            {/* View Toggle Buttons */}
            <div className="flex items-center bg-muted rounded-lg p-1 border border-border">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="transition-all duration-200"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="transition-all duration-200"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 transition-all duration-200"
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </Button>
          </div>
        </div>

        {/* Projects Content */}
        {projects.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center shadow-sm">
            <div className="text-muted-foreground mb-4">No projects found</div>
            <Button
              onClick={() => onNavigate("create-project")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Create Your First Project
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          renderGridView()
        ) : (
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 border-border hover:bg-muted transition-colors duration-200">
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isIndeterminate;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-input bg-background text-primary focus:ring-primary/30"
                    />
                  </TableHead>
                   <SortableHeader field="project_id">ID</SortableHeader>
                   <SortableHeader field="name">Project Name</SortableHeader>
                   <SortableHeader field="description">Description</SortableHeader>
                   <SortableHeader field="contract_price">Contract Price</SortableHeader>
                   <SortableHeader field="location">Location</SortableHeader>
                   <SortableHeader field="priority">Priority</SortableHeader>
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
                    <TableRow key={project.id} className="hover:bg-muted/50 border-border transition-colors duration-200">
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedProjects.includes(project.id)}
                          onChange={(e) => handleSelectProject(project.id, e.target.checked)}
                          className="rounded border-input bg-background text-primary focus:ring-primary/30"
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        #{project.project_id}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        <button
                          onClick={() => handleProjectClick(project.id)}
                          className="text-primary hover:text-primary/80 hover:underline cursor-pointer text-left transition-colors duration-200"
                        >
                          {project.name}
                        </button>
                      </TableCell>
                       <TableCell className="text-muted-foreground">
                         {project.description || '-'}
                       </TableCell>
                       <TableCell className="text-muted-foreground">
                         {project.contract_price || '-'}
                       </TableCell>
                       <TableCell className="text-muted-foreground">
                         {project.location || '-'}
                       </TableCell>
                       <TableCell className="text-muted-foreground">
                         {project.priority || '-'}
                       </TableCell>
                       <TableCell className="text-muted-foreground">
                         {project.start_date ? formatDate(project.start_date) : '-'}
                       </TableCell>
                       <TableCell className="text-muted-foreground">
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
                            <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border border-border shadow-xl">
                            <DropdownMenuItem 
                              className="flex items-center space-x-2 text-foreground hover:bg-muted focus:bg-muted transition-colors duration-200"
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
    </div>
  );
};
