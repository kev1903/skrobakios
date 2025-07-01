
import { ArrowLeft, Box, Upload, Settings as SettingsIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Project } from "@/hooks/useProjects";
import { SimpleBIMViewer } from "@/components/bim/SimpleBIMViewer";
import { BIMControls } from "@/components/bim/BIMControls";

interface ProjectBIMPageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const ProjectBIMPage = ({ project, onNavigate }: ProjectBIMPageProps) => {
  const [activeTab, setActiveTab] = useState("3d-view");
  const [performanceMode, setPerformanceMode] = useState(true); // Start in performance mode

  // Simplified BIM data
  const bimStats = {
    totalModels: 3,
    currentModels: 2,
    totalSize: "45.2 MB",
    lastUpdated: "Today"
  };

  const handleResetView = () => {
    console.log("Reset view");
  };

  const handleTogglePerformance = () => {
    setPerformanceMode(!performanceMode);
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
                  Building Information Models for {project.name}
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="3d-view">3D Viewer</TabsTrigger>
              <TabsTrigger value="models">Model Library</TabsTrigger>
              <TabsTrigger value="properties">Properties</TabsTrigger>
            </TabsList>

            <TabsContent value="3d-view" className="space-y-6">
              <div className="relative">
                <Card className="backdrop-blur-sm bg-white/60 border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Box className="w-5 h-5" />
                      3D Model Viewer
                      {performanceMode && (
                        <Badge variant="secondary" className="ml-auto">Performance Mode</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Interactive 3D view with optimized performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                      <SimpleBIMViewer 
                        modelId="1" 
                        className="w-full h-[500px]"
                        performanceMode={performanceMode}
                      />
                      <BIMControls
                        onResetView={handleResetView}
                        onTogglePerformance={handleTogglePerformance}
                        performanceMode={performanceMode}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="models" className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="backdrop-blur-sm bg-white/60 border-white/20">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-slate-900">{bimStats.totalModels}</div>
                    <p className="text-sm text-slate-600">Total Models</p>
                  </CardContent>
                </Card>
                
                <Card className="backdrop-blur-sm bg-white/60 border-white/20">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">{bimStats.currentModels}</div>
                    <p className="text-sm text-slate-600">Current Models</p>
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-sm bg-white/60 border-white/20">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-slate-900">{bimStats.totalSize}</div>
                    <p className="text-sm text-slate-600">Total Size</p>
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-sm bg-white/60 border-white/20">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-slate-900">{bimStats.lastUpdated}</div>
                    <p className="text-sm text-slate-600">Last Updated</p>
                  </CardContent>
                </Card>
              </div>

              {/* Models List */}
              <Card className="backdrop-blur-sm bg-white/60 border-white/20">
                <CardHeader>
                  <CardTitle>Available Models</CardTitle>
                  <CardDescription>
                    Manage your project's BIM models
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Box className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-900">Main Building Model</h3>
                          <p className="text-sm text-slate-500">Architecture • v2.1 • 25.8 MB</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Current
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="properties" className="space-y-6">
              <Card className="backdrop-blur-sm bg-white/60 border-white/20">
                <CardHeader>
                  <CardTitle>Model Properties</CardTitle>
                  <CardDescription>
                    View properties of selected model elements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-slate-500">
                    <Box className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                    <p>Select an element in the 3D viewer to view its properties</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
