
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
      const fetchedProjects = await getProjects();
      setProjects(fetchedProjects);
    };

    fetchProjects();
  }, []);

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
      <div className="h-full overflow-auto font-manrope">
        <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-blue-100 p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading projects...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto font-manrope">
      <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-blue-100 p-8">
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
