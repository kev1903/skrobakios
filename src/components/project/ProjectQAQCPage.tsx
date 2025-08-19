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
import { useRFIReports } from '@/hooks/useRFIReports';
import { useIssueReports } from '@/hooks/useIssueReports';
import { useDefectReports } from '@/hooks/useDefectReports';
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
  const { issues, loading: issuesLoading, voidIssue, deleteIssuesForProject, exportIssue, refetch: refetchIssues } = useIssues(projectId);
  const { defects, loading: defectsLoading, deleteDefect, exportDefect, refetch: refetchDefects } = useDefects(projectId);
  
  // Report containers
  const { reports: rfiReports, loading: rfiReportsLoading, createReport: createRFIReport, deleteReport: deleteRFIReport, refetch: refetchRFIReports } = useRFIReports(projectId);
  const { reports: issueReports, loading: issueReportsLoading, createReport: createIssueReport, deleteReport: deleteIssueReport, refetch: refetchIssueReports } = useIssueReports(projectId);
  const { reports: defectReports, loading: defectReportsLoading, createReport: createDefectReport, deleteReport: deleteDefectReport, refetch: refetchDefectReports } = useDefectReports(projectId);

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
      case 'void':
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

  // Handle voiding individual items (items cannot be deleted, only voided)
  const handleVoidRFI = async (rfiId: string) => {
    try {
      // Note: This should call a void function rather than delete
      // For now using delete until void functionality is implemented
      await deleteRFI(rfiId);
      refetchRFIs();
    } catch (error) {
      console.error('Failed to void RFI:', error);
    }
  };

  const handleVoidIssue = async (issueId: string) => {
    try {
      await voidIssue(issueId);
      refetchIssues();
    } catch (error) {
      console.error('Failed to void issue:', error);
    }
  };

  const handleVoidDefect = async (defectId: string) => {
    try {
      // Note: This should call a void function rather than delete
      // For now using delete until void functionality is implemented
      await deleteDefect(defectId);
      refetchDefects();
    } catch (error) {
      console.error('Failed to void defect:', error);
    }
  };

  // Handle deleting entire reports (all items within the report)
  const handleDeleteRFIReport = async () => {
    if (rfis.length === 0) return;
    try {
      for (const rfi of rfis) {
        await deleteRFI(rfi.id);
      }
      refetchRFIs();
    } catch (error) {
      console.error('Failed to delete RFI report:', error);
    }
  };

  const handleDeleteIssuesReport = async () => {
    if (issues.length === 0) return;
    try {
      await deleteIssuesForProject();
      refetchIssues();
    } catch (error) {
      console.error('Failed to delete issues report:', error);
    }
  };

  const handleDeleteDefectsReport = async () => {
    if (defects.length === 0) return;
    try {
      for (const defect of defects) {
        await deleteDefect(defect.id);
      }
      refetchDefects();
    } catch (error) {
      console.error('Failed to delete defects report:', error);
    }
  };

  // Handle deleting all QA/QC items for the project
  const handleDeleteAllItems = async () => {
    try {
      // Delete all RFIs
      for (const rfi of rfis) {
        await deleteRFI(rfi.id);
      }
      
      // Delete all Issues
      await deleteIssuesForProject();
      
      // Delete all Defects
      for (const defect of defects) {
        await deleteDefect(defect.id);
      }
      
      // Refresh all data
      refetchRFIs();
      refetchIssues();
      refetchDefects();
      
      console.log('All QA/QC items deleted successfully');
    } catch (error) {
      console.error('Failed to delete all items:', error);
    }
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
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete All Items
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete All QA/QC Items</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete ALL QA/QC items for this project? This will permanently remove:
                        <br />• {rfis.length} RFI item{rfis.length !== 1 ? 's' : ''}
                        <br />• {issues.length} Issue item{issues.length !== 1 ? 's' : ''}
                        <br />• {defects.length} Defect item{defects.length !== 1 ? 's' : ''}
                        <br /><br />This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAllItems} className="bg-red-600 hover:bg-red-700">
                        Delete All Items
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
                      <p className="text-sm font-medium text-muted-foreground">RFI Reports</p>
                      <p className="text-2xl font-bold text-foreground">{rfiReports.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="w-8 h-8 text-yellow-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-muted-foreground">Issue Reports</p>
                      <p className="text-2xl font-bold text-foreground">{issueReports.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-8 h-8 text-red-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-muted-foreground">Defect Reports</p>
                      <p className="text-2xl font-bold text-foreground">{defectReports.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Clock className="w-8 h-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                      <p className="text-2xl font-bold text-foreground">{rfis.length + issues.length + defects.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="rfi">RFI Reports</TabsTrigger>
              <TabsTrigger value="issues">Issue Reports</TabsTrigger>
              <TabsTrigger value="defects">Defect Reports</TabsTrigger>
            </TabsList>

            {/* RFI Tab */}
            <TabsContent value="rfi" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-foreground">RFI Reports</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Manage RFI report containers and their information requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* RFI Reports Container */}
                  <div className="space-y-4">
                    {/* RFI Reports List */}
                    {rfiReportsLoading ? (
                      <div className="text-center py-8">Loading RFI reports...</div>
                    ) : rfiReports.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No RFI reports found</p>
                        <p className="text-sm">Click "New Report" to create your first RFI report</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {rfiReports.map((report) => (
                          <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <span className="font-medium text-sm text-foreground">Report #{report.id.slice(0, 8)}</span>
                                <Badge className="bg-blue-100 text-blue-800">{report.status}</Badge>
                              </div>
                              <h4 
                                className="font-medium text-foreground mb-1 cursor-pointer hover:text-blue-600 transition-colors"
                                onClick={() => onNavigate(`qaqc-report-details?projectId=${projectId}&type=rfi&title=${encodeURIComponent(report.title)}`)}
                              >
                                {report.title}
                              </h4>
                              <p className="text-sm text-muted-foreground line-clamp-2">{report.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span>Created: {new Date(report.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-background z-50">
                                <DropdownMenuItem onClick={() => onNavigate(`qaqc-report-details?projectId=${projectId}&type=rfi&title=${encodeURIComponent(report.title)}`)}>
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => console.log('Export Report:', report.id)}>
                                  <Download className="mr-2 h-4 w-4" />
                                  Export
                                </DropdownMenuItem>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-orange-600 focus:text-orange-600">
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete Report
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete RFI Report</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "{report.title}"? This will also delete all RFI items within this report. This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteRFIReport(report.id)} className="bg-orange-600 hover:bg-orange-700">
                                        Delete Report
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        ))}
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
                  {/* Issues Report Container */}
                  <div className="space-y-4">

                    {/* Issues Items List */}
                    {issuesLoading ? (
                      <div className="text-center py-8">Loading issue items...</div>
                    ) : issues.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No issue items found</p>
                        <p className="text-sm">Click "New Report" to create your first issue</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {issues.map((issue) => (
                          <div key={issue.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <span className="font-medium text-sm text-foreground">{issue.issue_number}</span>
                                <Badge className={getStatusColor(issue.status)}>{issue.status}</Badge>
                                <Badge className={getPriorityColor(issue.priority)}>{issue.priority}</Badge>
                              </div>
                              <h4 
                                className="font-medium text-foreground mb-1 cursor-pointer hover:text-orange-600 transition-colors"
                                onClick={() => onNavigate(`qaqc-report-details?projectId=${projectId}&type=issues&title=${encodeURIComponent(issue.title)}`)}
                              >
                                {issue.title}
                              </h4>
                              <p className="text-sm text-muted-foreground line-clamp-2">{issue.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span>Location: {issue.location}</span>
                                <span>Created: {new Date(issue.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-background z-50">
                                <DropdownMenuItem onClick={() => console.log('View Issue:', issue.id)}>
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => console.log('Export Issue:', issue.id)}>
                                  <Download className="mr-2 h-4 w-4" />
                                  Export
                                </DropdownMenuItem>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-orange-600 focus:text-orange-600">
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Void Item
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Void Issue Item</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to void issue "{issue.title}"? This will mark it as void but keep it in the report for audit purposes.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleVoidIssue(issue.id)} className="bg-orange-600 hover:bg-orange-700">
                                        Void Item
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        ))}
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
                  {/* Defects Report Container */}
                  <div className="space-y-4">

                    {/* Defects Items List */}
                    {defectsLoading ? (
                      <div className="text-center py-8">Loading defect items...</div>
                    ) : defects.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No defect items found</p>
                        <p className="text-sm">Click "New Report" to create your first defect</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {defects.map((defect) => (
                          <div key={defect.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <span className="font-medium text-sm text-foreground">{defect.defect_number}</span>
                                <Badge className={getStatusColor(defect.status)}>{defect.status}</Badge>
                                <Badge className={getPriorityColor(defect.priority)}>{defect.priority}</Badge>
                              </div>
                              <h4 
                                className="font-medium text-foreground mb-1 cursor-pointer hover:text-red-600 transition-colors"
                                onClick={() => onNavigate(`qaqc-report-details?projectId=${projectId}&type=defects&title=${encodeURIComponent(defect.title)}`)}
                              >
                                {defect.title}
                              </h4>
                              <p className="text-sm text-muted-foreground line-clamp-2">{defect.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span>Location: {defect.location}</span>
                                <span>Category: {defect.category || 'General'}</span>
                                <span>Created: {new Date(defect.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-background z-50">
                                <DropdownMenuItem onClick={() => console.log('View Defect:', defect.id)}>
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => console.log('Export Defect:', defect.id)}>
                                  <Download className="mr-2 h-4 w-4" />
                                  Export
                                </DropdownMenuItem>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-orange-600 focus:text-orange-600">
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Void Item
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Void Defect Item</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to void defect "{defect.title}"? This will mark it as voided but keep it in the report for audit purposes.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleVoidDefect(defect.id)} className="bg-orange-600 hover:bg-orange-700">
                                        Void Item
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        ))}
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