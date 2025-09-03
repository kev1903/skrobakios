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
  useIssues,
  useQualityInspections,
  useQualityPlans,
  useIssueReports
} from '@/hooks/useQAQCData';
import { 
  Plus, 
  ListChecks,
  HelpCircle,
  AlertTriangle,
  FlaskConical,
  FileCheck
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { exportIssueReportToPDF } from '@/utils/pdfExport';

interface ProjectQAQCPageProps {
  onNavigate: (page: string) => void;
}

export const ProjectQAQCPage = ({ onNavigate }: ProjectQAQCPageProps) => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const tabParam = searchParams.get('tab') || 'checklists';
  const defaultTab = (['checklists','issues','inspections','itps'] as const).includes(tabParam as any) ? (tabParam as any) : 'checklists';
  const { getProject } = useProjects();
  const [project, setProject] = useState<Project | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch QA/QC data
  const { data: checklists, isLoading: checklistsLoading } = useChecklists(projectId || '');
  const { data: issues, isLoading: issuesLoading } = useIssues(projectId || '');
  const { data: inspections, isLoading: inspectionsLoading } = useQualityInspections(projectId || '');
  const { data: qualityPlans, isLoading: qualityPlansLoading } = useQualityPlans(projectId || '');
  const { data: issueReports, isLoading: issueReportsLoading } = useIssueReports(projectId || '');

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
      
      // Invalidate and refetch issue reports when the component mounts
      // This ensures fresh data is loaded
      queryClient.invalidateQueries({ queryKey: ['issue_reports', projectId] });
    }
  }, [projectId, getProject, queryClient]);

  const handleExportPDF = async (id: string, type: string) => {
    if (type === 'issueReport' && projectId) {
      try {
        await exportIssueReportToPDF(id, projectId);
        toast({
          title: "Success",
          description: "PDF report exported successfully"
        });
      } catch (error) {
        console.error('Error exporting PDF:', error);
        toast({
          title: "Error",
          description: "Failed to export PDF. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleDeleteIssueReport = async (id: string, type: string) => {
    if (!projectId) return;
    if (type === 'issueReport') {
      const confirmed = window.confirm('Delete this report and all associated issues? This cannot be undone.');
      if (!confirmed) return;
      
      try {
        // First, delete all issues associated with this report
        const { error: issuesError } = await supabase
          .from('issues')
          .delete()
          .eq('report_id', id);
        
        if (issuesError) {
          console.error('Failed to delete associated issues', issuesError);
          toast({ title: 'Error', description: 'Failed to delete associated issues', variant: 'destructive' });
          return;
        }

        // Then delete the report
        const { error: reportError } = await supabase
          .from('issue_reports')
          .delete()
          .eq('id', id);
          
        if (reportError) {
          console.error('Failed to delete report', reportError);
          toast({ title: 'Error', description: 'Failed to delete report', variant: 'destructive' });
          return;
        }
        
        toast({ title: 'Deleted', description: 'Report and associated issues deleted successfully' });
        await queryClient.invalidateQueries({ queryKey: ['issue_reports', projectId] });
        await queryClient.invalidateQueries({ queryKey: ['issues', projectId] });
      } catch (error) {
        console.error('Unexpected error during deletion', error);
        toast({ title: 'Error', description: 'An unexpected error occurred', variant: 'destructive' });
      }
    }
  };

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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
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
            
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate(`qaqc-issues?projectId=${projectId}`)}>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Issues/NCRs</p>
                    <p className="text-2xl font-bold text-foreground">{issueReports?.length || 0}</p>
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
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="checklists">Checklists</TabsTrigger>
                <TabsTrigger value="issues">Project Issues</TabsTrigger>
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

              <TabsContent value="issues" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Issues & Non-Conformance Reports</h3>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => queryClient.invalidateQueries({ queryKey: ['issue_reports', projectId] })}
                    >
                      Refresh
                    </Button>
                    <Button onClick={() => onNavigate(`qaqc-issue-report-create?projectId=${projectId}`)}>
                      <Plus className="w-4 h-4 mr-2" />
                      New Issue Report
                    </Button>
                  </div>
                </div>
                <QAQCTable data={issueReports || []} type="issueReports" isLoading={issueReportsLoading} onNavigate={onNavigate} onDelete={handleDeleteIssueReport} onExportPDF={handleExportPDF} />
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