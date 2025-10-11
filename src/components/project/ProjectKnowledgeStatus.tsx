import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, RefreshCw, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
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
  error_message?: string;
}

export const ProjectKnowledgeStatus = ({ projectId, companyId }: KnowledgeStatusProps) => {
  const [jobs, setJobs] = useState<SyncJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('knowledge_sync_jobs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setJobs((data || []) as SyncJob[]);
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
      const { data, error } = await supabase.functions.invoke('sync-project-knowledge', {
        body: { projectId, companyId }
      });

      if (error) throw error;

      toast({
        title: 'Sync Started',
        description: 'AI is processing your project documents...',
      });

      fetchJobs();
    } catch (error) {
      console.error('Error triggering sync:', error);
      toast({
        title: 'Sync Failed',
        description: 'Failed to start knowledge sync',
        variant: 'destructive'
      });
    } finally {
      setSyncing(false);
    }
  };

  const pendingJobs = jobs.filter(j => j.status === 'pending' || j.status === 'processing');
  const recentCompleted = jobs.filter(j => j.status === 'completed').slice(0, 3);
  const failedJobs = jobs.filter(j => j.status === 'failed');

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
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">AI Knowledge Status</h3>
        </div>
        <Button
          onClick={triggerManualSync}
          disabled={syncing}
          size="sm"
          variant="outline"
        >
          {syncing ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Sync Now
            </>
          )}
        </Button>
      </div>

      <div className="space-y-3">
        {/* Processing Queue */}
        {pendingJobs.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
            <span className="text-muted-foreground">
              Processing {pendingJobs.length} document{pendingJobs.length !== 1 ? 's' : ''}
            </span>
            <Badge variant="secondary" className="ml-auto">
              {pendingJobs[0].status === 'processing' ? 'In Progress' : 'Queued'}
            </Badge>
          </div>
        )}

        {/* Recent Completions */}
        {recentCompleted.length > 0 && (
          <div className="space-y-1.5">
            {recentCompleted.map((job) => (
              <div key={job.id} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-muted-foreground truncate">
                  Processed {job.job_type}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  <Clock className="h-3 w-3 inline mr-1" />
                  {new Date(job.created_at).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Failed Jobs */}
        {failedJobs.length > 0 && (
          <div className="space-y-1.5">
            {failedJobs.slice(0, 2).map((job) => (
              <div key={job.id} className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                <span className="text-destructive text-xs truncate">
                  {job.error_message || 'Processing failed'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {jobs.length === 0 && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            No knowledge extraction jobs yet. Upload documents to get started.
          </div>
        )}
      </div>
    </Card>
  );
};
