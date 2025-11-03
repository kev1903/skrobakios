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
import { Plus, Loader2, Pencil, Trash2, Check, X } from 'lucide-react';

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
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
          profiles!created_by (
            first_name,
            last_name,
            email
          )
        `)
        .eq('bill_id', billId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedNotes = data.map((note: any) => {
        const profile = note.profiles;
        const userName = profile 
          ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email || 'Unknown User'
          : 'Unknown User';
        
        return {
          ...note,
          user_name: userName
        };
      });

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

  const handleEditNote = async (noteId: string) => {
    if (!editText.trim()) return;

    try {
      const { error } = await supabase
        .from('bill_notes')
        .update({ note: editText.trim() })
        .eq('id', noteId);

      if (error) throw error;

      toast({
        title: 'Note Updated',
        description: 'Your note has been updated successfully'
      });

      setEditingId(null);
      setEditText('');
      fetchNotes();
    } catch (err: any) {
      console.error('Error updating note:', err);
      toast({
        title: 'Failed to Update Note',
        description: err.message,
        variant: 'destructive'
      });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      setDeleting(noteId);
      const { error } = await supabase
        .from('bill_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      toast({
        title: 'Note Deleted',
        description: 'Your note has been deleted successfully'
      });

      fetchNotes();
    } catch (err: any) {
      console.error('Error deleting note:', err);
      toast({
        title: 'Failed to Delete Note',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setDeleting(null);
    }
  };

  const startEdit = (note: BillNote) => {
    setEditingId(note.id);
    setEditText(note.note);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
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
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(note.created_at), 'MMM dd, yyyy HH:mm')}
                          </span>
                          {editingId !== note.id && (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => startEdit(note)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteNote(note.id)}
                                disabled={deleting === note.id}
                              >
                                {deleting === note.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {editingId === note.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            rows={3}
                            className="resize-none text-sm"
                          />
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleEditNote(note.id)}
                              disabled={!editText.trim()}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={cancelEdit}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                          {note.note}
                        </p>
                      )}
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
