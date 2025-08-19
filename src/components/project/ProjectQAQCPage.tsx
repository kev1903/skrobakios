import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams } from 'react-router-dom';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { useProjects, Project } from '@/hooks/useProjects';
import { QAQCTable } from '@/components/qaqc/QAQCTable';
import { 
  useChecklists,
  useRFIs,
  useIssues,
  useDefects,
  useQualityInspections,
  useQualityPlans
} from '@/hooks/useQAQCData';
import { 
  Plus, 
  ListChecks,
  HelpCircle,
  AlertTriangle,
  Bug,
  FlaskConical,
  FileCheck
} from 'lucide-react';

interface ProjectQAQCPageProps {
  onNavigate: (page: string) => void;
}

export const ProjectQAQCPage = ({ onNavigate }: ProjectQAQCPageProps) => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const { getProject } = useProjects();
  const [project, setProject] = useState<Project | null>(null);

  // Fetch QA/QC data
  const { data: checklists, isLoading: checklistsLoading } = useChecklists(projectId || '');
  const { data: rfis, isLoading: rfisLoading } = useRFIs(projectId || '');
  const { data: issues, isLoading: issuesLoading } = useIssues(projectId || '');
  const { data: defects, isLoading: defectsLoading } = useDefects(projectId || '');
  const { data: inspections, isLoading: inspectionsLoading } = useQualityInspections(projectId || '');
  const { data: qualityPlans, isLoading: qualityPlansLoading } = useQualityPlans(projectId || '');

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
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate(`qaqc-checklists?projectId=${projectId}`)}>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <ListChecks className="w-8 h-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Checklists</p>
                    <p className="text-2xl font-bold text-foreground">{checklists?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate(`qaqc-rfis?projectId=${projectId}`)}>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <HelpCircle className="w-8 h-8 text-orange-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">RFIs</p>
                    <p className="text-2xl font-bold text-foreground">{rfis?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate(`qaqc-issues?projectId=${projectId}`)}>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Issues/NCRs</p>
                    <p className="text-2xl font-bold text-foreground">{issues?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate(`qaqc-defects?projectId=${projectId}`)}>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Bug className="w-8 h-8 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Defects</p>
                    <p className="text-2xl font-bold text-foreground">{defects?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate(`qaqc-inspections?projectId=${projectId}`)}>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <FlaskConical className="w-8 h-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Inspections</p>
                    <p className="text-2xl font-bold text-foreground">{inspections?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate(`qaqc-quality-plans?projectId=${projectId}`)}>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <FileCheck className="w-8 h-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">ITPs</p>
                    <p className="text-2xl font-bold text-foreground">{qualityPlans?.length || 0}</p>
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
                  <h3 className="text-lg font-semibold">Checklists</h3>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Checklist
                  </Button>
                </div>
                <QAQCTable data={checklists || []} type="checklists" isLoading={checklistsLoading} onNavigate={onNavigate} />
              </TabsContent>

              <TabsContent value="rfis" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Requests for Information</h3>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New RFI
                  </Button>
                </div>
                <QAQCTable data={rfis || []} type="rfis" isLoading={rfisLoading} onNavigate={onNavigate} />
              </TabsContent>

              <TabsContent value="issues" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Issues & Non-Conformance Reports</h3>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Issue/NCR
                  </Button>
                </div>
                <QAQCTable data={issues || []} type="issues" isLoading={issuesLoading} onNavigate={onNavigate} />
              </TabsContent>

              <TabsContent value="defects" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Defects & Punch List</h3>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Defect
                  </Button>
                </div>
                <QAQCTable data={defects || []} type="defects" isLoading={defectsLoading} onNavigate={onNavigate} />
              </TabsContent>

              <TabsContent value="inspections" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Quality Inspections & Tests</h3>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Inspection
                  </Button>
                </div>
                <QAQCTable data={inspections || []} type="inspections" isLoading={inspectionsLoading} onNavigate={onNavigate} />
              </TabsContent>

              <TabsContent value="itps" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Quality Plans & ITPs</h3>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Quality Plan
                  </Button>
                </div>
                <QAQCTable data={qualityPlans || []} type="plans" isLoading={qualityPlansLoading} onNavigate={onNavigate} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};