import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useProjects, Project } from '@/hooks/useProjects';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateIssueReportPageProps {
  onNavigate?: (page: string) => void;
}

export const CreateIssueReportPage: React.FC<CreateIssueReportPageProps> = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectId = searchParams.get('projectId');
  const { getProject } = useProjects();
  const [project, setProject] = useState<Project | null>(null);
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (projectId) {
      getProject(projectId).then(setProject).catch(err => console.error('Failed to fetch project:', err));
    }
  }, [projectId, getProject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !project) {
      toast({ title: 'Error', description: 'Project information is missing', variant: 'destructive' });
      return;
    }
    if (!title.trim()) {
      toast({ title: 'Error', description: 'Report title is required', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('issue_reports')
        .insert({
          project_id: projectId,
          company_id: project.company_id,
          title: title.trim(),
          description: description.trim() || null,
          created_by: userData.user?.id || null,
          status: 'active',
        })
        .select('*')
        .single();
      if (error) throw error;
      toast({ title: 'Success', description: 'Issue report created' });
      navigate(`/?page=qaqc-issue-report-detail&projectId=${projectId}&reportId=${data.id}`);
    } catch (err) {
      console.error('Create report error:', err);
      toast({ title: 'Error', description: 'Failed to create report', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/?page=project-qaqc&projectId=${projectId}&tab=issues`);
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Project Not Found</h2>
          <Button onClick={handleCancel}>Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background pt-[var(--header-height,60px)]">
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>New Issue Report</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Report Title *</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Site Safety Issues - August" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description or scope for this report" rows={4} />
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create Report'}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
