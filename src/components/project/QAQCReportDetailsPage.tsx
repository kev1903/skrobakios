import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeft, FileText, AlertTriangle, CheckCircle, Plus, MoreHorizontal, Download, Trash2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { useProjects, Project } from '@/hooks/useProjects';
import { useRFIs } from '@/hooks/useRFIs';
import { useIssues } from '@/hooks/useIssues';
import { useDefects } from '@/hooks/useDefects';

// Unified type for items across RFIs, Issues, and Defects (only fields we render)
export type CombinedItem = {
  id: string;
  status?: string;
  updated_at?: string;
  priority?: string;
  title?: string;
  description?: string;
  created_at?: string;
  due_date?: string | null;
  location?: string | null;
  category?: string | null;
  rfi_number?: string;
  issue_number?: string;
  defect_number?: string;
};

interface QAQCReportDetailsPageProps {
  onNavigate: (page: string) => void;
}

export const QAQCReportDetailsPage = ({ onNavigate }: QAQCReportDetailsPageProps) => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const reportType = searchParams.get('type'); // 'rfi', 'issues', or 'defects'
  const reportId = searchParams.get('reportId');
  const { getProject } = useProjects();
  const [project, setProject] = useState<Project | null>(null);
  
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

  const getReportData = () => {
    const titleParam = searchParams.get('title');

    // Only show items that belong to the selected report container
    const byReport = (items: CombinedItem[]): CombinedItem[] => {
      if (!reportId) return [];
      return items.filter((item) => (item as any)?.report_id === reportId);
    };

    switch (reportType) {
      case 'rfi':
        return {
          items: byReport(rfis as CombinedItem[]),
          loading: rfisLoading,
          title: 'Request for Information (RFI)',
          description: titleParam ? `Report: ${titleParam}` : 'RFI report items',
          icon: FileText,
          color: 'blue'
        };
      case 'issues':
        return {
          items: byReport(issues as CombinedItem[]),
          loading: issuesLoading,
          title: 'Project Issues',
          description: titleParam ? `Report: ${titleParam}` : 'Issue report items',
          icon: AlertTriangle,
          color: 'orange'
        };
      case 'defects':
        return {
          items: byReport(defects as CombinedItem[]),
          loading: defectsLoading,
          title: 'Defects & Quality Issues',
          description: titleParam ? `Report: ${titleParam}` : 'Defect report items',
          icon: CheckCircle,
          color: 'red'
        };
      default:
        return {
          items: [] as CombinedItem[],
          loading: false,
          title: 'Unknown Report',
          description: '',
          icon: FileText,
          color: 'gray'
        };
    }
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

  const handleVoidItem = async (itemId: string) => {
    try {
      switch (reportType) {
        case 'rfi':
          await deleteRFI(itemId);
          refetchRFIs();
          break;
        case 'issues':
          await voidIssue(itemId);
          refetchIssues();
          break;
        case 'defects':
          await deleteDefect(itemId);
          refetchDefects();
          break;
      }
    } catch (error) {
      console.error(`Failed to void ${reportType} item:`, error);
    }
  };

  const handleExportItem = async (item: any) => {
    try {
      switch (reportType) {
        case 'rfi':
          await exportRFI(item);
          break;
        case 'issues':
          await exportIssue(item);
          break;
        case 'defects':
          await exportDefect(item);
          break;
      }
    } catch (error) {
      console.error(`Failed to export ${reportType} item:`, error);
    }
  };

  const reportData = getReportData();
  const IconComponent = reportData.icon;
  const titleParam = searchParams.get('title');
  const headingTitle = titleParam || (
    reportType === 'rfi' ? 'RFI Report' : 
    reportType === 'issues' ? 'Issues Report' : 
    reportType === 'defects' ? 'Defects Report' : 'Report'
  );

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
            <div className="flex items-center gap-4 mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onNavigate(`project-qaqc?projectId=${projectId}`)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to QA/QC
              </Button>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <IconComponent className={`w-6 h-6 text-${reportData.color}-600`} />
                  <h1 className="text-3xl font-bold text-foreground">
                    {headingTitle}
                  </h1>
                </div>
                <p className="text-muted-foreground">#{project.project_id}</p>
                <p className="text-sm text-muted-foreground mt-1">{reportData.description}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export All
                </Button>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New {reportType === 'rfi' ? 'RFI' : reportType === 'issues' ? 'Issue' : 'Defect'}
                </Button>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <IconComponent className={`w-8 h-8 text-${reportData.color}-600`} />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                      <p className="text-2xl font-bold text-foreground">{reportData.items.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-muted-foreground">Open</p>
                      <p className="text-2xl font-bold text-foreground">
                        {reportData.items.filter(item => item.status === 'open').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                      <p className="text-2xl font-bold text-foreground">
                        {reportData.items.filter(item => item.status === 'resolved').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="w-8 h-8 text-yellow-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                      <p className="text-2xl font-bold text-foreground">
                        {reportData.items.filter(item => item.status === 'in_progress' || item.status === 'pending').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Items List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">{reportData.title} Items</CardTitle>
              <CardDescription className="text-muted-foreground">
                {reportData.items.length} item{reportData.items.length !== 1 ? 's' : ''} • Last updated: {reportData.items.length > 0 ? new Date(Math.max(...reportData.items.map(item => new Date(item.updated_at).getTime()))).toLocaleDateString() : 'N/A'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reportData.loading ? (
                <div className="text-center py-8">Loading {reportType} items...</div>
              ) : reportData.items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <IconComponent className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No {reportType} items found</p>
                  <p className="text-sm">Click "Add New" to create your first {reportType}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {reportData.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-medium text-sm text-foreground">
                            {item.rfi_number || item.issue_number || item.defect_number}
                          </span>
                          <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                          <Badge className={getPriorityColor(item.priority)}>{item.priority}</Badge>
                        </div>
                        <h4 className="font-medium text-foreground mb-1">{item.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          {reportType === 'rfi' && (
                            <>
                              <span>Due: {new Date(item.due_date).toLocaleDateString()}</span>
                              <span>Created: {new Date(item.created_at).toLocaleDateString()}</span>
                            </>
                          )}
                          {(reportType === 'issues' || reportType === 'defects') && (
                            <>
                              <span>Location: {item.location}</span>
                              {reportType === 'defects' && <span>Category: {item.category || 'General'}</span>}
                              <span>Created: {new Date(item.created_at).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-background z-50">
                          <DropdownMenuItem onClick={() => console.log('View Details:', item.id)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExportItem(item)}>
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
                                <AlertDialogTitle>Void {reportType.toUpperCase()} Item</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to void "{item.title}"? This will mark it as voided but keep it in the report for audit purposes.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleVoidItem(item.id)} className="bg-orange-600 hover:bg-orange-700">
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};