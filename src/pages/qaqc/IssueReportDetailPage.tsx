import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSearchParams } from 'react-router-dom';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { useProjects, Project } from '@/hooks/useProjects';
import { QAQCTable } from '@/components/qaqc/QAQCTable';
import { Plus, ArrowLeft, AlertTriangle, CheckCircle, Archive, Download, Trash2 } from 'lucide-react';
import { useIssueReport } from '@/hooks/useQAQCData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { exportIssueReportToPDF } from '@/utils/pdfExport';
import { exportSelectedIssuesToPDF } from '@/utils/exportSelectedIssues';

interface IssueReportDetailPageProps {
  onNavigate: (page: string) => void;
}

export const IssueReportDetailPage = ({ onNavigate }: IssueReportDetailPageProps) => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const reportId = searchParams.get('reportId');
  const { getProject } = useProjects();
  const [project, setProject] = useState<Project | null>(null);
  const { data: report } = useIssueReport(reportId || '');
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (projectId) {
      getProject(projectId).then(setProject).catch(console.error);
    }
  }, [projectId, getProject]);

  useEffect(() => {
    const fetchIssues = async () => {
      if (!reportId) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('project_id', projectId)
        .eq('report_id', reportId)
        .order('created_at', { ascending: true }); // Change to ascending for proper numbering
      if (!error) {
        // Add automatic numbering to issues in ascending order
        const numberedIssues = (data || []).map((issue, index) => ({
          ...issue,
          auto_number: index + 1
        }));
        setIssues(numberedIssues);
      }
      setLoading(false);
    };
    fetchIssues();
  }, [projectId, reportId]);

  const handleDelete = async (id: string, type: string) => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      
      if (type === 'issue') {
        const { error } = await supabase
          .from('issues')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        // Remove from local state and renumber
        setIssues(prev => {
          const filtered = prev.filter(issue => issue.id !== id);
          return filtered.map((issue, index) => ({
            ...issue,
            auto_number: index + 1
          }));
        });
        
        toast({
          title: "Success",
          description: "Issue deleted successfully"
        });
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshIssues = async () => {
    if (!reportId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .eq('project_id', projectId)
      .eq('report_id', reportId)
      .order('created_at', { ascending: true }); // Change to ascending for proper numbering
    if (!error) {
      // Add automatic numbering to issues in ascending order
      const numberedIssues = (data || []).map((issue, index) => ({
        ...issue,
        auto_number: index + 1
      }));
      setIssues(numberedIssues);
    }
    setLoading(false);
  };

  const handleBack = () => onNavigate(`project-qaqc?projectId=${projectId}&tab=issues`);
  const handleAddIssue = () => onNavigate(`qaqc-issue-create?projectId=${projectId}&reportId=${reportId}`);

  const handleBulkAction = async (action: string, selectedIds: string[]) => {
    try {
      switch (action) {
        case 'resolve':
          // Update selected issues status to resolved
          for (const id of selectedIds) {
            await supabase
              .from('issues')
              .update({ status: 'resolved' })
              .eq('id', id);
          }
          toast({
            title: "Issues Updated",
            description: `${selectedIds.length} issue${selectedIds.length > 1 ? 's' : ''} marked as resolved.`,
          });
          break;
          
        case 'archive':
          // Update selected issues status to closed
          for (const id of selectedIds) {
            await supabase
              .from('issues')
              .update({ status: 'closed' })
              .eq('id', id);
          }
          toast({
            title: "Issues Archived",
            description: `${selectedIds.length} issue${selectedIds.length > 1 ? 's' : ''} archived.`,
          });
          break;
          
        case 'delete':
          // Delete selected issues
          await supabase
            .from('issues')
            .delete()
            .in('id', selectedIds);
          toast({
            title: "Issues Deleted",
            description: `${selectedIds.length} issue${selectedIds.length > 1 ? 's' : ''} deleted.`,
          });
          break;
          
        case 'export':
          // Export selected issues to PDF
          if (projectId && reportId) {
            setLoading(true);
            await exportSelectedIssuesToPDF(selectedIds, reportId, projectId);
            toast({
              title: "Export Complete",
              description: `Successfully exported ${selectedIds.length} selected issue${selectedIds.length > 1 ? 's' : ''} to PDF.`,
            });
            setLoading(false);
          }
          break;
      }
      
      // Refresh the issues list
      refreshIssues();
    } catch (error) {
      console.error('Bulk action error:', error);
      toast({
        title: "Error",
        description: "An error occurred while performing the bulk action.",
        variant: "destructive",
      });
    }
  };

  const handleExportPDF = async (id: string, type: string) => {
    if (type === 'issueReport' && projectId) {
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    }
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h2>
          <Button onClick={() => onNavigate('projects')}>Back to Projects</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 bg-gray-50">
      <ProjectSidebar
        project={project}
        onNavigate={onNavigate}
        getStatusColor={() => 'bg-blue-100 text-blue-800'}
        getStatusText={() => 'Active'}
        activeSection="qaqc"
      />

      <div className="flex-1 ml-48 p-6">
        <div className="w-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to QA/QC
              </Button>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h1 className="text-2xl font-bold text-foreground">{report?.title || 'Issue Report'}</h1>
              </div>
            </div>
            <Button onClick={handleAddIssue}>
              <Plus className="w-4 h-4 mr-2" />
              Add Issue
            </Button>
          </div>

          {/* Compact Report Summary */}
          <div className="bg-card border border-border rounded-lg p-3 mb-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-muted-foreground">Status:</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  report?.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : report?.status === 'closed'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {report?.status || 'N/A'}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-muted-foreground">Created:</span>
                <span className="text-foreground">
                  {report?.created_at ? new Date(report.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  }) : 'N/A'}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-muted-foreground">Total:</span>
                <span className="text-foreground font-medium">{issues?.length || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-muted-foreground">Open:</span>
                <span className="text-red-600 font-medium">
                  {issues?.filter(issue => issue.status === 'open').length || 0}
                </span>
              </div>
            </div>

            {/* Bulk Actions - Show when items are selected */}
            {selectedItems.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedItems.length} issue{selectedItems.length > 1 ? 's' : ''} selected
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction('resolve', selectedItems)}
                      className="text-green-700 border-green-300 hover:bg-green-50"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark Resolved
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction('archive', selectedItems)}
                      className="text-gray-700 border-gray-300 hover:bg-gray-50"
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Archive
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction('export', selectedItems)}
                      className="text-blue-700 border-blue-300 hover:bg-blue-50"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction('delete', selectedItems)}
                      className="text-red-700 border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedItems([])}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Clear Selection
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
          </div>

          <div className="bg-white rounded-lg shadow">
            <QAQCTable 
              data={issues} 
              type="issues" 
              isLoading={loading} 
              onNavigate={onNavigate} 
              onDelete={handleDelete}
              onRefresh={refreshIssues}
              onExportPDF={handleExportPDF}
              onBulkAction={handleBulkAction}
              selectedItems={selectedItems}
              setSelectedItems={setSelectedItems}
            />
          </div>
        </div>
      </div>
    </div>
  );
};