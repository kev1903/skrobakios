import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Brain, RefreshCw, Clock, AlertCircle, CheckCircle2, FileText, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface KnowledgeStatusProps {
  projectId: string;
  companyId: string;
}

interface SyncJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  job_type: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  source_id?: string;
}

interface DocumentInfo {
  id: string;
  name: string;
  document_type?: string;
}

export const ProjectKnowledgeStatus = ({ projectId, companyId }: KnowledgeStatusProps) => {
  const [jobs, setJobs] = useState<SyncJob[]>([]);
  const [documents, setDocuments] = useState<Record<string, DocumentInfo>>({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [totalDocs, setTotalDocs] = useState(0);
  const { toast } = useToast();

  const fetchDocumentInfo = async (sourceIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('project_documents')
        .select('id, name, document_type')
        .in('id', sourceIds);

      if (error) throw error;
      
      const docMap: Record<string, DocumentInfo> = {};
      (data || []).forEach(doc => {
        docMap[doc.id] = doc;
      });
      setDocuments(prev => ({ ...prev, ...docMap }));
    } catch (error) {
      console.error('Error fetching document info:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('knowledge_sync_jobs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      const jobsData = (data || []) as SyncJob[];
      setJobs(jobsData);

      // Fetch document info for all source_ids
      const sourceIds = jobsData
        .filter(j => j.source_id)
        .map(j => j.source_id as string);
      
      if (sourceIds.length > 0) {
        fetchDocumentInfo(sourceIds);
      }

      // Count total documents
      const { count } = await supabase
        .from('project_documents')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId)
        .eq('processing_status', 'completed');
      
      setTotalDocs(count || 0);
    } catch (error) {
      console.error('Error fetching sync jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('knowledge-sync-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'knowledge_sync_jobs',
          filter: `project_id=eq.${projectId}`
        },
        () => {
          fetchJobs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const triggerManualSync = async () => {
    setSyncing(true);
    try {
      // First, delete all existing jobs for this project to reset the analysis
      const { error: deleteError } = await supabase
        .from('knowledge_sync_jobs')
        .delete()
        .eq('project_id', projectId);

      if (deleteError) throw deleteError;

      // Then create fresh jobs
      const { data, error } = await supabase.functions.invoke('sync-project-knowledge', {
        body: { projectId, companyId }
      });

      if (error) throw error;

      toast({
        title: 'Analysis Started',
        description: 'SkAi is analyzing your project documents...',
      });

      fetchJobs();
    } catch (error) {
      console.error('Error triggering sync:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Failed to start knowledge analysis',
        variant: 'destructive'
      });
    } finally {
      setSyncing(false);
    }
  };

  const stopSync = async () => {
    try {
      // Update all processing and pending jobs to failed status
      const { error } = await supabase
        .from('knowledge_sync_jobs')
        .update({ 
          status: 'failed',
          error_message: 'Analysis cancelled by user',
          completed_at: new Date().toISOString()
        })
        .eq('project_id', projectId)
        .in('status', ['processing', 'pending']);

      if (error) throw error;

      toast({
        title: 'Analysis Stopped',
        description: 'SkAi analysis has been cancelled',
      });

      setSyncing(false);
      fetchJobs();
    } catch (error) {
      console.error('Error stopping sync:', error);
      toast({
        title: 'Stop Failed',
        description: 'Failed to stop analysis',
        variant: 'destructive'
      });
    }
  };

  const processingJob = jobs.find(j => j.status === 'processing');
  const pendingJobs = jobs.filter(j => j.status === 'pending');
  const completedJobs = jobs.filter(j => j.status === 'completed');
  const failedJobs = jobs.filter(j => j.status === 'failed');

  // Calculate progress
  const totalJobs = jobs.length;
  const completedCount = completedJobs.length;
  const progressPercentage = totalJobs > 0 ? (completedCount / totalJobs) * 100 : 0;

  // Get document name helper
  const getDocumentName = (sourceId?: string) => {
    if (!sourceId) return 'Unknown document';
    const doc = documents[sourceId];
    return doc ? doc.name : 'Document';
  };

  const getDocumentType = (sourceId?: string) => {
    if (!sourceId) return '';
    const doc = documents[sourceId];
    return doc?.document_type || 'document';
  };

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading knowledge status...
        </div>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-xl bg-background border border-border rounded-lg shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <Brain className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">AI Knowledge Status</h3>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={triggerManualSync}
              disabled={syncing}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
            >
              {syncing ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  Analyse with SkAi
                </>
              )}
            </Button>
            {syncing && (
              <Button
                onClick={stopSync}
                size="sm"
                variant="destructive"
              >
                Stop
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-5">
          {/* Overall Progress */}
          {jobs.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground font-medium">
                  Overall Progress
                </span>
                <span className="text-sm text-foreground font-semibold">
                  {completedCount} of {totalJobs} completed
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}

          {/* Currently Processing */}
          {processingJob && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-pulse" />
                  <div className="absolute inset-0 animate-ping">
                    <Sparkles className="h-4 w-4 text-blue-400 opacity-75" />
                  </div>
                </div>
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  AI Processing in Progress
                </span>
              </div>
              <div className="flex items-start gap-2 ml-6">
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-blue-800 dark:text-blue-200 font-medium truncate">
                    {getDocumentName(processingJob.source_id)}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                    Extracting specifications, dates, risks, and compliance data...
                  </p>
                </div>
              </div>
              {processingJob.started_at && (
                <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 ml-6">
                  <Clock className="h-3 w-3" />
                  <span>
                    Started {new Date(processingJob.started_at).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Pending Queue */}
          {pendingJobs.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Queued ({pendingJobs.length})</span>
              </div>
              <div className="space-y-2">
                {pendingJobs.slice(0, 3).map((job) => (
                  <div key={job.id} className="flex items-center justify-between gap-3 py-2 px-3 rounded-md hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm text-foreground truncate">
                        {getDocumentName(job.source_id)}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {getDocumentType(job.source_id)}
                    </Badge>
                  </div>
                ))}
                {pendingJobs.length > 3 && (
                  <p className="text-xs text-muted-foreground pl-3 pt-1">
                    +{pendingJobs.length - 3} more in queue
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Recent Completions */}
          {completedJobs.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />
                <span className="text-sm font-medium text-foreground">Recently Completed</span>
              </div>
              <div className="space-y-2">
                {completedJobs.slice(0, 3).map((job) => (
                  <div key={job.id} className="flex items-center justify-between gap-3 py-2 px-3 rounded-md hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500 flex-shrink-0" />
                      <span className="text-sm text-foreground truncate">
                        {getDocumentName(job.source_id)}
                      </span>
                    </div>
                    {job.completed_at && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(job.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Failed Jobs */}
          {failedJobs.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">Failed ({failedJobs.length})</span>
              </div>
              <div className="space-y-2">
                {failedJobs.slice(0, 2).map((job) => (
                  <div key={job.id} className="flex items-start gap-2.5 py-2 px-3 rounded-md bg-destructive/5">
                    <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-destructive truncate font-medium">
                        {getDocumentName(job.source_id)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {job.error_message || 'Processing failed'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {jobs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground space-y-3">
              <Brain className="h-10 w-10 mx-auto text-muted-foreground/30" />
              <div>
                <p className="font-medium text-sm">No knowledge extraction jobs yet</p>
                <p className="text-xs mt-1">Upload documents to get started with AI analysis</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
