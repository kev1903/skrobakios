import { useState, useEffect } from "react";
import { Plus, Filter, MoreHorizontal, Eye } from "lucide-react";
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

export const ProjectList = ({ onNavigate, onSelectProject }: ProjectListProps) => {
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
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
                  <TableHead className="font-medium text-gray-700">ID</TableHead>
                  <TableHead className="font-medium text-gray-700">Project Name</TableHead>
                  <TableHead className="font-medium text-gray-700">Location</TableHead>
                  <TableHead className="font-medium text-gray-700">Start Date</TableHead>
                  <TableHead className="font-medium text-gray-700">Due Date</TableHead>
                  <TableHead className="font-medium text-gray-700">Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => {
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
                        {project.location || '-'}
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
