import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Plus, AlertTriangle, FileText, CheckCircle, Clock, Filter, MoreHorizontal, Download, Trash2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { useProjects, Project } from '@/hooks/useProjects';
import { useRFIs } from '@/hooks/useRFIs';
import { useIssues } from '@/hooks/useIssues';
import { useDefects } from '@/hooks/useDefects';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { RFIForm } from '@/components/reports/RFIForm';
import { IssueForm } from '@/components/reports/IssueForm';
import { DefectForm } from '@/components/reports/DefectForm';

interface ProjectQAQCPageProps {
  onNavigate: (page: string) => void;
}

export const ProjectQAQCPage = ({ onNavigate }: ProjectQAQCPageProps) => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const { getProject } = useProjects();
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState("rfi");
  const [showNewReportDialog, setShowNewReportDialog] = useState(false);
  
  const { rfis, loading: rfisLoading, deleteRFI, exportRFI, refetch: refetchRFIs } = useRFIs(projectId);
  const { issues, loading: issuesLoading, voidIssue, exportIssue, refetch: refetchIssues } = useIssues(projectId);
  const { defects, loading: defectsLoading, deleteDefect, exportDefect, refetch: refetchDefects } = useDefects(projectId);

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

  const getTotalCount = () => rfis.length + issues.length + defects.length;
  const getOpenCount = () => {
    return [...rfis, ...issues, ...defects].filter(item => item.status === 'open').length;
  };
  const getInProgressCount = () => {
    return [...rfis, ...issues, ...defects].filter(item => item.status === 'in_progress' || item.status === 'pending').length;
  };
  const getResolvedCount = () => {
    return [...rfis, ...issues, ...defects].filter(item => item.status === 'resolved').length;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
      case 'active':
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'pending':
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'voided':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleNewReportClick = () => {
    setShowNewReportDialog(true);
  };

  const handleReportSuccess = () => {
    setShowNewReportDialog(false);
    // Refresh the appropriate data based on active tab
    if (activeTab === 'rfi') {
      refetchRFIs();
    } else if (activeTab === 'issues') {
      refetchIssues();
    } else if (activeTab === 'defects') {
      refetchDefects();
    }
  };

  const handleReportCancel = () => {
    setShowNewReportDialog(false);
  };

  const renderForm = () => {
    if (!projectId) return null;
    
    switch (activeTab) {
      case 'rfi':
        return <RFIForm projectId={projectId} projectName={project?.name} onSuccess={handleReportSuccess} onCancel={handleReportCancel} />;
      case 'issues':
        return <IssueForm projectId={projectId} projectName={project?.name} onSuccess={handleReportSuccess} onCancel={handleReportCancel} />;
      case 'defects':
        return <DefectForm projectId={projectId} projectName={project?.name} onSuccess={handleReportSuccess} onCancel={handleReportCancel} />;
      default:
        return null;
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
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {activeTab === 'rfi' && 'RFI Report'} 
                  {activeTab === 'issues' && 'Issues Report'} 
                  {activeTab === 'defects' && 'Defect Report'} - {project.name}
                </h1>
                <p className="text-muted-foreground">#{project.project_id}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button size="sm" onClick={handleNewReportClick}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Report
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-muted-foreground">Total RFIs</p>
                      <p className="text-2xl font-bold text-foreground">{rfis.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="w-8 h-8 text-yellow-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-muted-foreground">Active Issues</p>
                      <p className="text-2xl font-bold text-foreground">{issues.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-8 h-8 text-red-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-muted-foreground">Defects</p>
                      <p className="text-2xl font-bold text-foreground">{defects.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Clock className="w-8 h-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-muted-foreground">Avg Response</p>
                      <p className="text-2xl font-bold text-foreground">2.3d</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="rfi">RFI Report</TabsTrigger>
              <TabsTrigger value="issues">Issues Report</TabsTrigger>
              <TabsTrigger value="defects">Defect Report</TabsTrigger>
            </TabsList>

            {/* RFI Tab */}
            <TabsContent value="rfi" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-foreground">Request for Information (RFI)</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Track and manage information requests throughout the project lifecycle
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {rfisLoading ? (
                      <div className="text-center py-8">Loading RFI Reports...</div>
                    ) : rfis.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">No RFI Reports found</div>
                    ) : (
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <button 
                              onClick={() => onNavigate(`rfi-list?projectId=${projectId}&type=rfi`)}
                              className="font-medium text-foreground hover:text-foreground/80 transition-colors cursor-pointer"
                            >
                              {`RFI Report - ${project?.name || 'Project'}`}
                            </button>
                            <Badge className="bg-blue-100 text-blue-800">{rfis.length} Items</Badge>
                          </div>
                          <h3 className="font-medium text-foreground mb-1">Request for Information Report</h3>
                          <p className="text-sm text-muted-foreground">
                            Contains {rfis.length} RFI{rfis.length !== 1 ? 's' : ''} • Last updated: {rfis.length > 0 ? new Date(Math.max(...rfis.map(r => new Date(r.updated_at).getTime()))).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-background z-50">
                            <DropdownMenuItem onClick={() => console.log('Export RFI Report')}>
                              <Download className="mr-2 h-4 w-4" />
                              Export Report
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => console.log('Delete RFI Report')} className="text-red-600 focus:text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Report
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Issues Tab */}
            <TabsContent value="issues" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-foreground">Project Issues</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Monitor and resolve project issues and complications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {issuesLoading ? (
                      <div className="text-center py-8">Loading Issues Reports...</div>
                    ) : issues.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">No Issues Reports found</div>
                    ) : (
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <button 
                              onClick={() => onNavigate(`rfi-list?projectId=${projectId}&type=issue`)}
                              className="font-medium text-foreground hover:text-foreground/80 transition-colors cursor-pointer"
                            >
                              {`Issues Report - ${project?.name || 'Project'}`}
                            </button>
                            <Badge className="bg-orange-100 text-orange-800">{issues.length} Items</Badge>
                          </div>
                          <h3 className="font-medium text-foreground mb-1">Project Issues Report</h3>
                          <p className="text-sm text-muted-foreground">
                            Contains {issues.length} Issue{issues.length !== 1 ? 's' : ''} • Last updated: {issues.length > 0 ? new Date(Math.max(...issues.map(i => new Date(i.updated_at).getTime()))).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-background z-50">
                            <DropdownMenuItem onClick={() => console.log('Export Issues Report')}>
                              <Download className="mr-2 h-4 w-4" />
                              Export Report
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => console.log('Delete Issues Report')} className="text-red-600 focus:text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Report
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Defects Tab */}
            <TabsContent value="defects" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-foreground">Defects & Quality Issues</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Track construction defects and quality control issues
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {defectsLoading ? (
                      <div className="text-center py-8">Loading Defects Reports...</div>
                    ) : defects.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">No Defects Reports found</div>
                    ) : (
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <button 
                              onClick={() => onNavigate(`rfi-list?projectId=${projectId}&type=defects`)}
                              className="font-medium text-foreground hover:text-foreground/80 transition-colors cursor-pointer"
                            >
                              {`Defects Report - ${project?.name || 'Project'}`}
                            </button>
                            <Badge className="bg-red-100 text-red-800">{defects.length} Items</Badge>
                          </div>
                          <h3 className="font-medium text-foreground mb-1">Project Defects Report</h3>
                          <p className="text-sm text-muted-foreground">
                            Contains {defects.length} Defect{defects.length !== 1 ? 's' : ''} • Last updated: {defects.length > 0 ? new Date(Math.max(...defects.map(d => new Date(d.updated_at).getTime()))).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-background z-50">
                            <DropdownMenuItem onClick={() => console.log('Export Defects Report')}>
                              <Download className="mr-2 h-4 w-4" />
                              Export Report
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => console.log('Delete Defects Report')} className="text-red-600 focus:text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Report
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* New Report Dialog */}
      <Dialog open={showNewReportDialog} onOpenChange={setShowNewReportDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {renderForm()}
        </DialogContent>
      </Dialog>
    </div>
  );
};