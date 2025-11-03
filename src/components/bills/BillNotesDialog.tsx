import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Plus, Loader2 } from 'lucide-react';

interface BillNote {
  id: string;
  note: string;
  created_at: string;
  created_by: string;
  user_name?: string;
}

interface BillNotesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  billId: string;
  billNumber: string;
}

export const BillNotesDialog = ({ isOpen, onClose, billId, billNumber }: BillNotesDialogProps) => {
  const [notes, setNotes] = useState<BillNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && billId) {
      fetchNotes();
    }
  }, [isOpen, billId]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('bill_notes')
        .select(`
          id,
          note,
          created_at,
          created_by,
          profiles:created_by (
            full_name
          )
        `)
        .eq('bill_id', billId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedNotes = data.map((note: any) => ({
        ...note,
        user_name: note.profiles?.full_name || 'Unknown User'
      }));

      setNotes(formattedNotes);
    } catch (err: any) {
      console.error('Error fetching notes:', err);
      toast({
        title: 'Failed to Load Notes',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('bill_notes')
        .insert({
          bill_id: billId,
          note: newNote.trim(),
          created_by: user.id
        });

      if (error) throw error;

      toast({
        title: 'Note Added',
        description: 'Your note has been saved successfully'
      });

      setNewNote('');
      fetchNotes();
    } catch (err: any) {
      console.error('Error adding note:', err);
      toast({
        title: 'Failed to Add Note',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Notes - Bill {billNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto max-h-[calc(80vh-8rem)] pr-2">
          {/* Add New Note */}
          <div className="space-y-3 p-4 bg-muted/30 rounded-xl border border-border/30">
            <label className="text-sm font-semibold">Add New Note</label>
            <Textarea
              placeholder="Type your note here..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <Button
              onClick={handleAddNote}
              disabled={!newNote.trim() || saving}
              size="sm"
              className="w-full"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Note
                </>
              )}
            </Button>
          </div>

          {/* Notes Timeline */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Timeline
            </h3>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No notes yet</p>
                <p className="text-xs mt-1">Add your first note above</p>
              </div>
            ) : (
              <div className="relative pl-8 space-y-6">
                {/* Timeline line */}
                <div className="absolute left-[13px] top-2 bottom-2 w-[2px] bg-border"></div>
                
                {notes.map((note, index) => (
                  <div key={note.id} className="relative">
                    {/* Timeline dot */}
                    <div className="absolute -left-8 mt-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-white"></div>
                    </div>
                    
                    {/* Note content */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-border/30 p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-semibold text-foreground">
                          {note.user_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(note.created_at), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                        {note.note}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
