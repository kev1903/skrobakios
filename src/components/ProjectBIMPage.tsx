import { ArrowLeft, Box, Upload, Download, Eye, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/hooks/useProjects";

interface ProjectBIMPageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const ProjectBIMPage = ({ project, onNavigate }: ProjectBIMPageProps) => {
  // Mock BIM data for demonstration
  const bimModels = [
    {
      id: "1",
      name: "Architectural Model",
      type: "Architecture",
      version: "v2.1",
      lastModified: "2024-06-20",
      size: "45.2 MB",
      status: "current"
    },
    {
      id: "2", 
      name: "Structural Model",
      type: "Structure",
      version: "v1.8",
      lastModified: "2024-06-18",
      size: "32.8 MB",
      status: "current"
    },
    {
      id: "3",
      name: "MEP Model",
      type: "MEP",
      version: "v1.5",
      lastModified: "2024-06-15",
      size: "28.4 MB",
      status: "outdated"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "current":
        return "bg-green-100 text-green-800 border-green-200";
      case "outdated":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

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
                onClick={() => onNavigate('project-detail')}
                className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 hover:bg-white/40 backdrop-blur-sm transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium">Back to Project</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
                  BIM Models
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Manage and view Building Information Models for {project.name}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Model
              </Button>
              <Button className="flex items-center gap-2">
                <SettingsIcon className="w-4 h-4" />
                BIM Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="backdrop-blur-sm bg-white/60 border-white/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Models</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{bimModels.length}</div>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-sm bg-white/60 border-white/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Current Models</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {bimModels.filter(m => m.status === 'current').length}
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/60 border-white/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Size</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">106.4 MB</div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/60 border-white/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Last Updated</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">Today</div>
              </CardContent>
            </Card>
          </div>

          {/* BIM Models List */}
          <Card className="backdrop-blur-sm bg-white/60 border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Box className="w-5 h-5" />
                BIM Models
              </CardTitle>
              <CardDescription>
                Manage your project's Building Information Models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bimModels.map((model) => (
                  <div
                    key={model.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Box className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{model.name}</h3>
                        <div className="flex items-center space-x-3 text-sm text-slate-600">
                          <span>{model.type}</span>
                          <span>•</span>
                          <span>Version {model.version}</span>
                          <span>•</span>
                          <span>{model.size}</span>
                        </div>
                        <p className="text-sm text-slate-500">
                          Last modified: {model.lastModified}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(model.status)}>
                        {model.status}
                      </Badge>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
