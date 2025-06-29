
import { Upload, Calendar, MapPin, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProjectDashboardProps {
  onSelectProject: (projectId: string) => void;
  onNavigate: (page: string) => void;
}

export const ProjectDashboard = ({ onSelectProject, onNavigate }: ProjectDashboardProps) => {
  const projects = [
    {
      id: "1",
      name: "Riverside Office Complex",
      location: "Portland, OR",
      dateCreated: "2024-06-15",
      status: "completed",
      wbsCount: 12,
      totalCost: "$2,450,000",
      progress: 100
    },
    {
      id: "2",
      name: "Mountain View Residential",
      location: "Boulder, CO",
      dateCreated: "2024-06-20",
      status: "processing",
      wbsCount: 8,
      totalCost: "$1,850,000",
      progress: 65
    },
    {
      id: "3",
      name: "Downtown Retail Center",
      location: "Austin, TX",
      dateCreated: "2024-06-25",
      status: "pending",
      wbsCount: 15,
      totalCost: "Pending",
      progress: 0
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "processing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "pending":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="h-full overflow-auto">
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Dashboard</h1>
            <p className="text-gray-600">Manage your construction estimation projects</p>
          </div>
          <Button 
            onClick={() => onNavigate("upload")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2"
          >
            <Upload className="w-5 h-5" />
            <span>New Project</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => (
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
                    {project.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{project.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{new Date(project.dateCreated).toLocaleDateString()}</span>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">WBS Components</span>
                    <span className="text-sm font-medium">{project.wbsCount}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-600">Estimated Cost</span>
                    <span className="text-sm font-bold text-gray-900">{project.totalCost}</span>
                  </div>
                  
                  {project.progress > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-500">Progress</span>
                        <span className="text-xs text-gray-500">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${project.progress}%` }}
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
          ))}
        </div>
      </div>
    </div>
  );
};
