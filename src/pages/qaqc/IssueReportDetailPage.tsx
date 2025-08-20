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

      <div className="flex-1 ml-48 p-6 pt-2 overflow-auto">
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
            {report?.description && (
              <div className="mt-2 pt-2 border-t border-border">
                <p className="text-sm text-muted-foreground">{report.description}</p>
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
            />
          </div>
        </div>
      </div>
    </div>
  );
};