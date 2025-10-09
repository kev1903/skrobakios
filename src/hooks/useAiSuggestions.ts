import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AiSuggestion {
  id: string;
  user_id: string;
  company_id: string;
  project_id: string | null;
  suggestion_type: 'alert' | 'suggestion' | 'insight' | 'warning';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'budget' | 'timeline' | 'tasks' | 'resources' | 'risk' | 'quality' | 'general';
  title: string;
  description: string;
  action_items: Array<{ action: string; link: string | null }>;
  metadata: Record<string, any>;
  dismissed: boolean;
  actioned: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useAiSuggestions = (projectId?: string, companyId?: string) => {
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSuggestions = async () => {
    try {
      let query = supabase
        .from('ai_suggestions')
        .select('*')
        .eq('dismissed', false)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSuggestions((data || []) as AiSuggestion[]);
    } catch (error) {
      console.error('Error fetching AI suggestions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load AI suggestions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestions = async (targetProjectId: string, targetCompanyId: string, userId: string) => {
    try {
      const { error } = await supabase.functions.invoke('generate-ai-suggestions', {
        body: { 
          projectId: targetProjectId, 
          companyId: targetCompanyId,
          userId 
        },
      });

      if (error) throw error;
      await fetchSuggestions();
      
      toast({
        title: 'Analysis Complete',
        description: 'AI has analyzed your project and generated suggestions',
      });
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate AI suggestions',
        variant: 'destructive',
      });
    }
  };

  const dismissSuggestion = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ai_suggestions')
        .update({ dismissed: true, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      setSuggestions(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error dismissing suggestion:', error);
      toast({
        title: 'Error',
        description: 'Failed to dismiss suggestion',
        variant: 'destructive',
      });
    }
  };

  const markAsActioned = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ai_suggestions')
        .update({ actioned: true, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      setSuggestions(prev => prev.map(s => 
        s.id === id ? { ...s, actioned: true } : s
      ));
    } catch (error) {
      console.error('Error marking suggestion as actioned:', error);
      toast({
        title: 'Error',
        description: 'Failed to update suggestion',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchSuggestions();

    // Set up real-time subscription
    const channel = supabase
      .channel('ai_suggestions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_suggestions',
          filter: projectId ? `project_id=eq.${projectId}` : undefined
        },
        () => {
          fetchSuggestions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, companyId]);

  return {
    suggestions,
    loading,
    generateSuggestions,
    dismissSuggestion,
    markAsActioned,
    refetch: fetchSuggestions,
  };
};