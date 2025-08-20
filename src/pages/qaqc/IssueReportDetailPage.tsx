import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSearchParams } from 'react-router-dom';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { useProjects, Project } from '@/hooks/useProjects';
import { QAQCTable } from '@/components/qaqc/QAQCTable';
import { Plus, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useIssueReport } from '@/hooks/useQAQCData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
        .order('created_at', { ascending: false });
      if (!error) setIssues(data || []);
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
        
        // Remove from local state
        setIssues(prev => prev.filter(issue => issue.id !== id));
        
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
      .order('created_at', { ascending: false });
    if (!error) setIssues(data || []);
    setLoading(false);
  };

  const handleBack = () => onNavigate(`project-qaqc?projectId=${projectId}&tab=issues`);
  const handleAddIssue = () => onNavigate(`qaqc-issue-create?projectId=${projectId}&reportId=${reportId}`);

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
    <div className="flex h-screen bg-gray-50 pt-[var(--header-height,60px)]">
      <ProjectSidebar
        project={project}
        onNavigate={onNavigate}
        getStatusColor={() => 'bg-blue-100 text-blue-800'}
        getStatusText={() => 'Active'}
        activeSection="qaqc"
      />

      <div className="flex-1 ml-48 p-6 overflow-auto">
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

          {/* Report Details Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>Report Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Report Title</h3>
                  <p className="text-foreground font-medium">{report?.title || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    report?.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : report?.status === 'closed'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {report?.status || 'N/A'}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Created Date</h3>
                  <p className="text-foreground">
                    {report?.created_at ? new Date(report.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'N/A'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Last Updated</h3>
                  <p className="text-foreground">
                    {report?.updated_at ? new Date(report.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'N/A'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Issues</h3>
                  <p className="text-foreground font-medium">{issues?.length || 0}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Open Issues</h3>
                  <p className="text-foreground font-medium text-red-600">
                    {issues?.filter(issue => issue.status === 'open').length || 0}
                  </p>
                </div>
              </div>
              {report?.description && (
                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                  <p className="text-foreground leading-relaxed">{report.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="bg-white rounded-lg shadow">
            <QAQCTable 
              data={issues} 
              type="issues" 
              isLoading={loading} 
              onNavigate={onNavigate} 
              onDelete={handleDelete}
              onRefresh={refreshIssues}
            />
          </div>
        </div>
      </div>
    </div>
  );
};