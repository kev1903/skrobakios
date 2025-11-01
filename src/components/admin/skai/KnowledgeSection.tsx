import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { KnowledgeForm } from './KnowledgeForm';
import { KnowledgeList } from './KnowledgeList';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type KnowledgeType = 'business' | 'industry' | 'project';

interface KnowledgeEntry {
  id: string;
  title: string;
  prompt_id?: string;
  content: string;
  category?: string;
  tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface KnowledgeSectionProps {
  type: KnowledgeType;
  title: string;
  description: string;
  companyId?: string;
}

export const KnowledgeSection: React.FC<KnowledgeSectionProps> = ({
  type,
  title,
  description,
  companyId
}) => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<KnowledgeEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, [type, companyId]);

  const fetchEntries = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('skai_knowledge')
        .select('*')
        .eq('knowledge_type', type)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching knowledge:', error);
      toast({
        title: "Error",
        description: "Failed to load knowledge entries",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      setIsSubmitting(true);
      
      if (selectedEntry) {
        // Update existing
        const { error } = await supabase
          .from('skai_knowledge')
          .update({
            ...formData,
            updated_by: (await supabase.auth.getUser()).data.user?.id
          })
          .eq('id', selectedEntry.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Knowledge entry updated successfully"
        });
      } else {
        // Create new
        const { error } = await supabase
          .from('skai_knowledge')
          .insert({
            ...formData,
            knowledge_type: type,
            company_id: null,
            created_by: (await supabase.auth.getUser()).data.user?.id
          });

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Knowledge entry created successfully"
        });
      }

      setIsFormOpen(false);
      setSelectedEntry(null);
      fetchEntries();
    } catch (error) {
      console.error('Error saving knowledge:', error);
      toast({
        title: "Error",
        description: "Failed to save knowledge entry",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (entry: KnowledgeEntry) => {
    setSelectedEntry(entry);
    setIsFormOpen(true);
  };

  const handleView = (entry: KnowledgeEntry) => {
    setSelectedEntry(entry);
    setIsViewOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this knowledge entry?')) return;

    try {
      const { error } = await supabase
        .from('skai_knowledge')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Knowledge entry deleted successfully"
      });
      
      fetchEntries();
    } catch (error) {
      console.error('Error deleting knowledge:', error);
      toast({
        title: "Error",
        description: "Failed to delete knowledge entry",
        variant: "destructive"
      });
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedEntry(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Knowledge
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : (
            <KnowledgeList
              entries={entries}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedEntry ? 'Edit' : 'Add'} {title}
            </DialogTitle>
          </DialogHeader>
          <KnowledgeForm
            initialData={selectedEntry || undefined}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedEntry?.title}</DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div className="bg-muted/50 p-3 rounded-lg">
                <span className="font-semibold">Prompt Knowledge ID: </span>
                {selectedEntry.prompt_id ? (
                  <code className="font-mono text-sm bg-background px-2 py-1 rounded">
                    {selectedEntry.prompt_id}
                  </code>
                ) : (
                  <span className="text-muted-foreground italic">Not set - Edit to add an ID</span>
                )}
              </div>
              {selectedEntry.category && (
                <div>
                  <span className="font-semibold">Category: </span>
                  {selectedEntry.category}
                </div>
              )}
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{selectedEntry.content}</p>
              </div>
              {selectedEntry.tags.length > 0 && (
                <div>
                  <span className="font-semibold">Tags: </span>
                  {selectedEntry.tags.join(', ')}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
