import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSearchParams } from 'react-router-dom';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { useProjects, Project } from '@/hooks/useProjects';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import { useIssueReport } from '@/hooks/useQAQCData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface IssueReportEditPageProps {
  onNavigate: (page: string) => void;
}

export const IssueReportEditPage = ({ onNavigate }: IssueReportEditPageProps) => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const reportId = searchParams.get('reportId');
  const { getProject } = useProjects();
  const [project, setProject] = useState<Project | null>(null);
  const { data: report } = useIssueReport(reportId || '');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    status: 'active',
    description: ''
  });

  useEffect(() => {
    if (projectId) {
      getProject(projectId).then(setProject).catch(console.error);
    }
  }, [projectId, getProject]);

  useEffect(() => {
    if (report) {
      setFormData({
        title: report.title || '',
        status: report.status || 'active',
        description: report.description || ''
      });
    }
  }, [report]);

  const handleBack = () => onNavigate(`qaqc-issue-report-detail?projectId=${projectId}&reportId=${reportId}`);

  const handleSave = async () => {
    if (!reportId || !formData.title.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('issue_reports')
        .update({
          title: formData.title.trim(),
          status: formData.status,
          description: formData.description.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Issue report updated successfully"
      });

      // Navigate back to detail view
      handleBack();
    } catch (error) {
      console.error('Error updating issue report:', error);
      toast({
        title: "Error",
        description: "Failed to update issue report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
                Back to Report
              </Button>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h1 className="text-2xl font-bold text-foreground">Edit Issue Report</h1>
              </div>
            </div>
            <Button onClick={handleSave} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

          {/* Edit Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>Report Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Report Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter report title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter report description (optional)"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};