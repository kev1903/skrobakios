import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams } from 'react-router-dom';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { ProjectPageHeader } from '@/components/project/ProjectPageHeader';
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
import { useScreenSize } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

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
  const screenSize = useScreenSize();
  const isMobile = screenSize === 'mobile' || screenSize === 'mobile-small';

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
    <div className="flex h-screen bg-background">
      {/* Project Sidebar - Hidden on mobile */}
      {!isMobile && (
        <ProjectSidebar
          project={project}
          onNavigate={onNavigate}
          getStatusColor={() => "bg-blue-100 text-blue-800"}
          getStatusText={() => "Active"}
          activeSection="qaqc"
        />
      )}

      {/* Main Content */}
      <div className={cn(
        "flex-1 h-screen overflow-y-auto bg-background",
        !isMobile && "ml-48"
      )}>
        {/* Header Section */}
        <ProjectPageHeader 
          projectName={project.name}
          pageTitle="QA/QC"
          onNavigate={onNavigate}
        />
        
        <div className={cn(
          "min-h-full",
          isMobile ? "p-3 pb-20" : "p-6"
        )}>
          <div className="max-w-7xl mx-auto">
          {/* Quick Stats */}
          <div className={cn(
            "grid gap-3 mb-4",
            isMobile ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"
          )}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate(`qaqc-checklists?projectId=${projectId}`)}>
              <CardContent className={cn(isMobile ? "p-3" : "p-4")}>
                <div className="flex items-center">
                  <ListChecks className={cn(isMobile ? "w-6 h-6" : "w-8 h-8", "text-blue-600")} />
                  <div className="ml-2">
                    <p className={cn(isMobile ? "text-xs" : "text-sm", "font-medium text-muted-foreground")}>Checklists</p>
                    <p className={cn(isMobile ? "text-xl" : "text-2xl", "font-bold text-foreground")}>{checklists?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate(`qaqc-issues?projectId=${projectId}`)}>
              <CardContent className={cn(isMobile ? "p-3" : "p-4")}>
                <div className="flex items-center">
                  <AlertTriangle className={cn(isMobile ? "w-6 h-6" : "w-8 h-8", "text-red-600")} />
                  <div className="ml-2">
                    <p className={cn(isMobile ? "text-xs" : "text-sm", "font-medium text-muted-foreground")}>RFIs/NCRs</p>
                    <p className={cn(isMobile ? "text-xl" : "text-2xl", "font-bold text-foreground")}>{issueReports?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>


            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate(`qaqc-inspections?projectId=${projectId}`)}>
              <CardContent className={cn(isMobile ? "p-3" : "p-4")}>
                <div className="flex items-center">
                  <FlaskConical className={cn(isMobile ? "w-6 h-6" : "w-8 h-8", "text-purple-600")} />
                  <div className="ml-2">
                    <p className={cn(isMobile ? "text-xs" : "text-sm", "font-medium text-muted-foreground")}>Inspections</p>
                    <p className={cn(isMobile ? "text-xl" : "text-2xl", "font-bold text-foreground")}>{inspections?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate(`qaqc-quality-plans?projectId=${projectId}`)}>
              <CardContent className={cn(isMobile ? "p-3" : "p-4")}>
                <div className="flex items-center">
                  <FileCheck className={cn(isMobile ? "w-6 h-6" : "w-8 h-8", "text-green-600")} />
                  <div className="ml-2">
                    <p className={cn(isMobile ? "text-xs" : "text-sm", "font-medium text-muted-foreground")}>ITPs</p>
                    <p className={cn(isMobile ? "text-xl" : "text-2xl", "font-bold text-foreground")}>{qualityPlans?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Tabs */}
          <div>
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className={cn(
                "w-full",
                isMobile ? "grid grid-cols-2 h-auto gap-1" : "grid grid-cols-4"
              )}>
                <TabsTrigger value="checklists" className={cn(isMobile && "text-xs py-2")}>
                  {isMobile ? "Checklists" : "Checklists"}
                </TabsTrigger>
                <TabsTrigger value="issues" className={cn(isMobile && "text-xs py-2")}>
                  {isMobile ? "RFIs" : "Project RFIs"}
                </TabsTrigger>
                <TabsTrigger value="inspections" className={cn(isMobile && "text-xs py-2")}>
                  {isMobile ? "Inspections" : "Inspections"}
                </TabsTrigger>
                <TabsTrigger value="itps" className={cn(isMobile && "text-xs py-2")}>
                  {isMobile ? "Plans" : "Quality Plans"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="checklists" className="space-y-4">
                <div className={cn(
                  "flex items-center justify-between",
                  isMobile && "flex-col items-start gap-2"
                )}>
                  <h3 className={cn(isMobile ? "text-base" : "text-lg", "font-semibold")}>Checklists</h3>
                  <Button size={isMobile ? "sm" : "default"} className={cn(isMobile && "w-full")}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Checklist
                  </Button>
                </div>
                <QAQCTable data={checklists || []} type="checklists" isLoading={checklistsLoading} onNavigate={onNavigate} isMobile={isMobile} />
              </TabsContent>

              <TabsContent value="issues" className="space-y-4">
                <div className={cn(
                  "flex items-center justify-between",
                  isMobile && "flex-col items-start gap-2"
                )}>
                  <h3 className={cn(isMobile ? "text-base" : "text-lg", "font-semibold")}>
                    {isMobile ? "Issues & NCRs" : "Issues & Non-Conformance Reports"}
                  </h3>
                  <div className={cn("flex gap-2", isMobile && "w-full flex-col")}>
                    <Button 
                      variant="outline" 
                      size={isMobile ? "sm" : "default"}
                      className={cn(isMobile && "w-full")}
                      onClick={() => queryClient.invalidateQueries({ queryKey: ['issue_reports', projectId] })}
                    >
                      Refresh
                    </Button>
                    <Button 
                      size={isMobile ? "sm" : "default"}
                      className={cn(isMobile && "w-full")}
                      onClick={() => onNavigate(`qaqc-issue-report-create?projectId=${projectId}`)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Issue Report
                    </Button>
                  </div>
                </div>
                <QAQCTable data={issueReports || []} type="issueReports" isLoading={issueReportsLoading} onNavigate={onNavigate} onDelete={handleDeleteIssueReport} onExportPDF={handleExportPDF} isMobile={isMobile} />
              </TabsContent>


              <TabsContent value="inspections" className="space-y-4">
                <div className={cn(
                  "flex items-center justify-between",
                  isMobile && "flex-col items-start gap-2"
                )}>
                  <h3 className={cn(isMobile ? "text-base" : "text-lg", "font-semibold")}>
                    {isMobile ? "Inspections & Tests" : "Quality Inspections & Tests"}
                  </h3>
                  <Button size={isMobile ? "sm" : "default"} className={cn(isMobile && "w-full")}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Inspection
                  </Button>
                </div>
                <QAQCTable data={inspections || []} type="inspections" isLoading={inspectionsLoading} onNavigate={onNavigate} isMobile={isMobile} />
              </TabsContent>

              <TabsContent value="itps" className="space-y-4">
                <div className={cn(
                  "flex items-center justify-between",
                  isMobile && "flex-col items-start gap-2"
                )}>
                  <h3 className={cn(isMobile ? "text-base" : "text-lg", "font-semibold")}>Quality Plans & ITPs</h3>
                  <Button size={isMobile ? "sm" : "default"} className={cn(isMobile && "w-full")}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Quality Plan
                  </Button>
                </div>
                <QAQCTable data={qualityPlans || []} type="plans" isLoading={qualityPlansLoading} onNavigate={onNavigate} isMobile={isMobile} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
          </div>
        </div>
      </div>
  );
};