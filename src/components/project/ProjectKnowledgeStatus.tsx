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
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [totalDocs, setTotalDocs] = useState(0);
  const { toast } = useToast();

  const fetchAnalysisResults = async () => {
    try {
      const { data, error } = await supabase
        .from('project_documents')
        .select('*')
        .eq('project_id', projectId)
        .not('ai_summary', 'is', null)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setAnalysisResults(data || []);
    } catch (error) {
      console.error('Error fetching analysis results:', error);
    }
  };

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

      // Fetch analysis results
      await fetchAnalysisResults();
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
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_documents',
          filter: `project_id=eq.${projectId}`
        },
        () => {
          fetchAnalysisResults();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);


  const processingJob = jobs.find(j => j.status === 'processing');
  const pendingJobs = jobs.filter(j => j.status === 'pending');
  const completedJobs = jobs.filter(j => j.status === 'completed');
  const failedJobs = jobs.filter(j => j.status === 'failed');

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
          Loading analysis results...
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
        </div>

        <div className="space-y-4">
          {/* Analysis Results */}
          {analysisResults.length > 0 ? (
            <div className="space-y-4">
              {analysisResults.map((doc) => (
                <div key={doc.id} className="rounded-lg border border-border bg-card p-4 space-y-3">
                  {/* Document Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-foreground truncate">
                          {doc.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {doc.document_type || 'document'}
                          </Badge>
                          {doc.ai_confidence > 0 && (
                            <span className="text-xs text-muted-foreground">
                              Confidence: {Math.round(doc.ai_confidence * 100)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  </div>

                  {/* AI Summary */}
                  {doc.ai_summary && (
                    <div className="space-y-1.5">
                      <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        AI Summary
                      </h5>
                      <p className="text-sm text-foreground leading-relaxed">
                        {doc.ai_summary}
                      </p>
                    </div>
                  )}

                  {/* Metadata */}
                  {doc.metadata && Object.keys(doc.metadata).length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Key Information
                      </h5>
                      <div className="grid grid-cols-2 gap-2">
                        {doc.metadata.date && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs text-foreground">
                              Date: {doc.metadata.date}
                            </span>
                          </div>
                        )}
                        {doc.metadata.status && (
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {doc.metadata.status}
                            </Badge>
                          </div>
                        )}
                        {doc.metadata.author && (
                          <div className="text-xs text-muted-foreground col-span-2">
                            Author: {doc.metadata.author}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Rationale */}
                  {doc.ai_rationale && (
                    <div className="space-y-1.5 pt-2 border-t border-border">
                      <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Analysis Notes
                      </h5>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {doc.ai_rationale}
                      </p>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t border-border">
                    <Clock className="h-3 w-3" />
                    <span>
                      Analyzed {new Date(doc.updated_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground space-y-3">
              <Brain className="h-12 w-12 mx-auto text-muted-foreground/30" />
              <div>
                <p className="font-medium text-sm">No analysis results yet</p>
                <p className="text-xs mt-1">
                  Click the <Sparkles className="h-3 w-3 inline" /> icon on a document category to start AI analysis
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
