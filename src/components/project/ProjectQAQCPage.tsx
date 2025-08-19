import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams } from 'react-router-dom';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { useProjects, Project } from '@/hooks/useProjects';
import { 
  Plus, 
  ClipboardCheck, 
  AlertTriangle, 
  FileText, 
  ListChecks,
  HelpCircle,
  AlertCircle,
  Bug,
  FlaskConical,
  FileCheck,
  CheckSquare,
  Eye,
  Clock,
  TrendingUp
} from 'lucide-react';

interface ProjectQAQCPageProps {
  onNavigate: (page: string) => void;
}

export const ProjectQAQCPage = ({ onNavigate }: ProjectQAQCPageProps) => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const { getProject } = useProjects();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    if (projectId) {
      const fetchProject = async () => {
        try {
          const fetchedProject = await getProject(projectId);
          setProject(fetchedProject);
        } catch (error) {
          console.error('Failed to fetch project:', error);
        }
      };
      fetchProject();
    }
  }, [projectId, getProject]);

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">The requested project could not be found.</p>
          <Button onClick={() => onNavigate('projects')}>Back to Projects</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Project Sidebar */}
      <ProjectSidebar
        project={project}
        onNavigate={onNavigate}
        getStatusColor={() => "bg-blue-100 text-blue-800"}
        getStatusText={() => "Active"}
        activeSection="qaqc"
      />

      {/* Main Content */}
      <div className="flex-1 ml-48 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <ListChecks className="w-8 h-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Checklists</p>
                    <p className="text-2xl font-bold text-foreground">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <HelpCircle className="w-8 h-8 text-orange-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">RFIs</p>
                    <p className="text-2xl font-bold text-foreground">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Issues/NCRs</p>
                    <p className="text-2xl font-bold text-foreground">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Bug className="w-8 h-8 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Defects</p>
                    <p className="text-2xl font-bold text-foreground">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <FlaskConical className="w-8 h-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Inspections</p>
                    <p className="text-2xl font-bold text-foreground">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <FileCheck className="w-8 h-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">ITPs</p>
                    <p className="text-2xl font-bold text-foreground">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Tabs */}
          <div>
              <Tabs defaultValue="checklists" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="checklists">Checklists</TabsTrigger>
                  <TabsTrigger value="rfis">RFIs</TabsTrigger>
                  <TabsTrigger value="issues">Issues/NCRs</TabsTrigger>
                  <TabsTrigger value="defects">Defects</TabsTrigger>
                  <TabsTrigger value="inspections">Inspections</TabsTrigger>
                  <TabsTrigger value="itps">Quality Plans</TabsTrigger>
                </TabsList>

                <TabsContent value="checklists" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Standardized Inspections</h3>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      New Checklist
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Site Setup Inspection</h4>
                          <CheckSquare className="w-5 h-5 text-green-600" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">Initial site setup and safety verification</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="w-3 h-3 mr-1" />
                          Last updated: 2 days ago
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Structural Inspection</h4>
                          <Eye className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">Foundation and structural compliance checks</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="w-3 h-3 mr-1" />
                          Last updated: 1 week ago
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Services Inspection</h4>
                          <Eye className="w-5 h-5 text-orange-600" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">Plumbing, electrical, HVAC verification</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="w-3 h-3 mr-1" />
                          Last updated: 3 days ago
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="rfis" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Requests for Information</h3>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      New RFI
                    </Button>
                  </div>
                  <div className="text-center py-8">
                    <HelpCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No RFIs created yet. Start by creating your first request for information.</p>
                  </div>
                </TabsContent>

                <TabsContent value="issues" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Issues & Non-Conformance Reports</h3>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      New Issue/NCR
                    </Button>
                  </div>
                  <div className="text-center py-8">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No issues or NCRs logged yet. Track quality and compliance problems here.</p>
                  </div>
                </TabsContent>

                <TabsContent value="defects" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Defects & Punch List</h3>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      New Defect
                    </Button>
                  </div>
                  <div className="text-center py-8">
                    <Bug className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No defects recorded yet. Track final stage defects and punch list items here.</p>
                  </div>
                </TabsContent>

                <TabsContent value="inspections" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Quality Inspections & Tests</h3>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      New Inspection
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">Concrete Slump Tests</h4>
                        <p className="text-sm text-muted-foreground mb-2">Material testing and quality verification</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">0 tests recorded</span>
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">Waterproofing Tests</h4>
                        <p className="text-sm text-muted-foreground mb-2">Membrane and seal integrity verification</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">0 tests recorded</span>
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="itps" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Quality Plans & ITPs</h3>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      New Quality Plan
                    </Button>
                  </div>
                  <div className="text-center py-8">
                    <FileCheck className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No quality plans created yet. Set up Inspection & Test Plans with hold/witness points.</p>
                  </div>
                </TabsContent>
              </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};