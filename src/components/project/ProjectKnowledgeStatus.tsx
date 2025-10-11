import { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, FileText, Sparkles, CheckCircle2 } from 'lucide-react';
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

interface ChatMessage {
  id: string;
  type: 'system' | 'analysis';
  content: string;
  documentName?: string;
  documentType?: string;
  metadata?: any;
  confidence?: number;
  timestamp: Date;
}

export const ProjectKnowledgeStatus = ({ projectId, companyId }: KnowledgeStatusProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      type: 'system',
      content: 'Welcome to SkAi Analysis! Click the ✨ icon on any document category to start AI-powered analysis.',
      timestamp: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const addAnalysisMessage = (doc: any) => {
    const newMessage: ChatMessage = {
      id: doc.id,
      type: 'analysis',
      content: doc.ai_summary || 'Analysis completed',
      documentName: doc.name,
      documentType: doc.document_type,
      metadata: doc.metadata,
      confidence: doc.ai_confidence,
      timestamp: new Date(doc.updated_at)
    };

    setMessages(prev => [...prev, newMessage]);
    
    // Scroll to bottom
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  };

  const loadExistingAnalysis = async () => {
    try {
      const { data, error } = await supabase
        .from('project_documents')
        .select('*')
        .eq('project_id', projectId)
        .not('ai_summary', 'is', null)
        .order('updated_at', { ascending: true });

      if (error) throw error;
      
      if (data && data.length > 0) {
        const analysisMessages: ChatMessage[] = data.map(doc => ({
          id: doc.id,
          type: 'analysis' as const,
          content: doc.ai_summary || 'Analysis completed',
          documentName: doc.name,
          documentType: doc.document_type,
          metadata: doc.metadata,
          confidence: doc.ai_confidence,
          timestamp: new Date(doc.updated_at)
        }));

        setMessages(prev => [prev[0], ...analysisMessages]);
      }
    } catch (error) {
      console.error('Error loading existing analysis:', error);
    }
  };

  useEffect(() => {
    loadExistingAnalysis();

    // Subscribe to real-time updates for new analysis
    const channel = supabase
      .channel('skai-analysis-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'project_documents',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          if (payload.new.ai_summary && payload.new.ai_summary !== payload.old?.ai_summary) {
            addAnalysisMessage(payload.new);
            toast({
              title: 'Analysis Complete',
              description: `SkAi has analyzed ${payload.new.name}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);


  return (
    <Card className="backdrop-blur-xl bg-background border border-border rounded-lg shadow-sm flex flex-col h-[600px]">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">SkAi Analysis</h3>
            <p className="text-xs text-muted-foreground">AI-powered document insights</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex gap-3">
              {message.type === 'system' ? (
                <div className="flex gap-3 w-full">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm text-muted-foreground">{message.content}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 w-full">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Brain className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2 min-w-0 flex-1">
                          <FileText className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-semibold text-foreground truncate">
                              {message.documentName}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {message.documentType || 'document'}
                              </Badge>
                              {message.confidence && message.confidence > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  {Math.round(message.confidence * 100)}% confidence
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm text-foreground leading-relaxed">
                          {message.content}
                        </p>
                      </div>

                      {message.metadata && Object.keys(message.metadata).length > 0 && (
                        <div className="pt-2 border-t border-border">
                          <div className="flex flex-wrap gap-2">
                            {message.metadata.date && (
                              <Badge variant="secondary" className="text-xs">
                                📅 {message.metadata.date}
                              </Badge>
                            )}
                            {message.metadata.status && (
                              <Badge variant="secondary" className="text-xs">
                                {message.metadata.status}
                              </Badge>
                            )}
                            {message.metadata.author && (
                              <Badge variant="secondary" className="text-xs">
                                👤 {message.metadata.author}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground pt-1">
                        {message.timestamp.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
    </Card>
  );
};
