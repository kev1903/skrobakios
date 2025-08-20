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
        <div className="max-w-7xl mx-auto">
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

          {report?.description && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Report Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{report.description}</p>
              </CardContent>
            </Card>
          )}

          <div className="bg-white rounded-lg shadow">
            <QAQCTable data={issues} type="issues" isLoading={loading} onNavigate={onNavigate} />
          </div>
        </div>
      </div>
    </div>
  );
};