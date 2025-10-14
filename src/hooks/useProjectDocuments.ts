import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProjectDocument {
  id: string;
  project_id: string;
  name: string;
  file_url: string;
  content_type: string | null;
  document_type: string | null;
  file_size: number | null;
  created_at: string;
  created_by: string | null;
  document_status: string | null;
  category_id: string | null;
  processing_status: string | null;
  ai_summary: string | null;
  metadata?: any;
}

export const useProjectDocuments = (projectId: string | undefined) => {
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchDocuments = async () => {
    if (!projectId) {
      // Clear documents if no projectId
      setDocuments([]);
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('project_documents')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Ensure we only set documents that match the current projectId
      const filteredData = (data || []).filter(doc => doc.project_id === projectId);
      setDocuments(filteredData);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch documents',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      // Get the document to extract file path
      const document = documents.find(doc => doc.id === documentId);
      
      // Delete from database first
      const { error } = await supabase
        .from('project_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      // Delete file from storage if exists
      if (document?.file_url) {
        const filePath = document.file_url.split('/').pop();
        if (filePath) {
          await supabase.storage
            .from('project-documents')
            .remove([filePath]);
        }
      }

      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      toast({
        title: 'Success',
        description: 'Document deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive',
      });
    }
  };

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  useEffect(() => {
    // Clear documents immediately when projectId changes
    setDocuments([]);
    fetchDocuments();
  }, [projectId]);

  // Real-time subscription for document updates
  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel(`project-documents-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_documents',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          console.log('Document update received:', payload);
          
          if (payload.eventType === 'INSERT') {
            setDocuments(prev => [payload.new as ProjectDocument, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setDocuments(prev => prev.map(doc => 
              doc.id === payload.new.id ? payload.new as ProjectDocument : doc
            ));
          } else if (payload.eventType === 'DELETE') {
            setDocuments(prev => prev.filter(doc => doc.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  return {
    documents,
    loading,
    deleteDocument,
    formatFileSize,
    refetch: fetchDocuments,
  };
};
