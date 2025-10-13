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
  selectedDocumentId?: string | null;
  onClearSelection?: () => void;
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

export const ProjectKnowledgeStatus = ({ projectId, companyId, selectedDocumentId, onClearSelection }: KnowledgeStatusProps) => {
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
      {selectedDocumentId && (
        <div className="px-4 py-3 border-b border-border bg-accent/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium text-foreground">
                Viewing document analysis
              </p>
            </div>
            <button
              onClick={onClearSelection}
              className="text-xs text-primary hover:underline cursor-pointer"
            >
              Show All
            </button>
          </div>
        </div>
      )}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages
            .filter((message) => {
              // Always show system messages if no document is selected
              if (message.type === 'system') return !selectedDocumentId;
              
              // If a document is selected, only show that document's analysis
              if (selectedDocumentId) {
                return message.id === selectedDocumentId;
              }
              
              // Otherwise show all analysis messages
              return true;
            })
            .map((message) => (
            <div key={message.id} className="flex gap-3">
              {message.type === 'system' ? (
                <div className="flex gap-3 w-full">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                      <p className="text-sm text-muted-foreground">{message.content}</p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 w-full">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Brain className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
                      {/* Document Summary Section */}
                      <div className="bg-accent/30 border border-border/50 rounded-md p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-base font-semibold text-foreground">
                            {message.documentName}
                          </h4>
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground font-medium">Type:</span>
                            <Badge variant="outline" className="text-xs">
                              {message.documentType || 'Document'}
                            </Badge>
                          </div>
                          {message.metadata?.author && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground font-medium">Author:</span>
                              <span className="text-foreground text-xs">
                                {message.metadata.author}
                              </span>
                            </div>
                          )}
                          {message.metadata?.date && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground font-medium">Date:</span>
                              <span className="text-foreground text-xs">
                                {message.metadata.date}
                              </span>
                            </div>
                          )}
                          {message.confidence && message.confidence > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground font-medium">Confidence:</span>
                              <span className="text-foreground text-xs">
                                {Math.round(message.confidence * 100)}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        {message.content.split(/\*\*([^*]+)\*\*/g).map((part, index) => {
                          if (index % 2 === 1) {
                            // This is a bolded section
                            return (
                              <h5 key={index} className="text-sm font-semibold text-foreground mt-3">
                                {part}
                              </h5>
                            );
                          } else if (part.trim()) {
                            // Regular text, split by bullet points or line breaks
                            return part.split(/\n/).map((line, lineIndex) => {
                              const trimmedLine = line.trim();
                              if (!trimmedLine) return null;
                              
                              // Check if it's a bullet point
                              if (trimmedLine.startsWith('*') || trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
                                return (
                                  <div key={`${index}-${lineIndex}`} className="flex gap-2 ml-4">
                                    <span className="text-primary mt-1">•</span>
                                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                                      {trimmedLine.replace(/^[*\-•]\s*/, '')}
                                    </p>
                                  </div>
                                );
                              }
                              
                              return (
                                <p key={`${index}-${lineIndex}`} className="text-sm text-muted-foreground leading-relaxed">
                                  {trimmedLine}
                                </p>
                              );
                            });
                          }
                          return null;
                        })}
                      </div>

                      {message.metadata?.status && (
                        <div className="pt-2 border-t border-border">
                          <Badge variant="secondary" className="text-xs">
                            {message.metadata.status}
                          </Badge>
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
