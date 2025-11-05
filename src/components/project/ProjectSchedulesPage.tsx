import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Layers, Plus, MoreHorizontal, Trash2, Edit, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProjectSchedule {
  id: string;
  project_id: string;
  name: string;
  type: string;
  status?: string;
  shared_with?: string[];
  is_public: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
  };
}

interface ProjectSchedulesPageProps {
  projectId: string;
  onBack: () => void;
}

export const ProjectSchedulesPage = ({ projectId, onBack }: ProjectSchedulesPageProps) => {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<ProjectSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ProjectSchedule | null>(null);
  const [scheduleName, setScheduleName] = useState('');

  useEffect(() => {
    fetchSchedules();
  }, [projectId]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('project_schedules')
        .select(`
          *,
          profiles!project_schedules_created_by_fkey(first_name, last_name)
        `)
        .eq('project_id', projectId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast({
        title: "Error",
        description: "Failed to load schedules",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('project_schedules')
        .insert({
          project_id: projectId,
          name: scheduleName || 'Untitled schedule',
          created_by: user?.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Schedule created successfully"
      });

      setDialogOpen(false);
      setScheduleName('');
      fetchSchedules();
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast({
        title: "Error",
        description: "Failed to create schedule",
        variant: "destructive"
      });
    }
  };

  const handleUpdateSchedule = async () => {
    if (!editingSchedule) return;

    try {
      const { error } = await supabase
        .from('project_schedules')
        .update({ name: scheduleName })
        .eq('id', editingSchedule.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Schedule updated successfully"
      });

      setDialogOpen(false);
      setEditingSchedule(null);
      setScheduleName('');
      fetchSchedules();
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast({
        title: "Error",
        description: "Failed to update schedule",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('project_schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Schedule deleted successfully"
      });

      fetchSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast({
        title: "Error",
        description: "Failed to delete schedule",
        variant: "destructive"
      });
    }
  };

  const openCreateDialog = () => {
    setEditingSchedule(null);
    setScheduleName('');
    setDialogOpen(true);
  };

  const openEditDialog = (schedule: ProjectSchedule) => {
    setEditingSchedule(schedule);
    setScheduleName(schedule.name);
    setDialogOpen(true);
  };

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Project Schedules</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage project schedules and timelines</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Create Schedule
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/80 backdrop-blur-xl border border-border/30 rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
          {/* Table Header */}
          <div className="grid grid-cols-[2fr,1fr,1.5fr,1fr,2fr,auto] gap-4 px-6 py-4 bg-muted/30 border-b border-border/30">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
              NAME
            </div>
            <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
              TYPE
            </div>
            <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
              SHARED WITH
            </div>
            <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
              STATUS
            </div>
            <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
              LAST UPDATED
            </div>
            <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
              ACTIONS
            </div>
          </div>

          {/* Table Body */}
          {loading ? (
            <div className="px-6 py-12 text-center text-muted-foreground">
              Loading schedules...
            </div>
          ) : schedules.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Layers className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No schedules yet</p>
              <p className="text-xs text-muted-foreground mt-1">Click "Create Schedule" to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="grid grid-cols-[2fr,1fr,1.5fr,1fr,2fr,auto] gap-4 px-6 py-4 hover:bg-accent/30 transition-colors"
                >
                  {/* Name */}
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm font-medium text-foreground truncate">
                      {schedule.name}
                    </span>
                  </div>

                  {/* Type */}
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground">
                      {schedule.type}
                    </span>
                  </div>

                  {/* Shared With */}
                  <div className="flex items-center">
                    {schedule.is_public ? (
                      <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600">
                        Public
                      </Badge>
                    ) : schedule.shared_with && schedule.shared_with.length > 0 ? (
                      <span className="text-sm text-muted-foreground">
                        {schedule.shared_with.length} user(s)
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Private</span>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex items-center">
                    {schedule.status && (
                      <Badge variant="outline">
                        {schedule.status}
                      </Badge>
                    )}
                  </div>

                  {/* Last Updated */}
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(schedule.updated_at), { addSuffix: true })}
                      {(schedule.profiles?.first_name || schedule.profiles?.last_name) && (
                        <> by {[schedule.profiles.first_name, schedule.profiles.last_name].filter(Boolean).join(' ')}</>
                      )}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(schedule)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteSchedule(schedule.id)} className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSchedule ? 'Edit Schedule' : 'Create Schedule'}
            </DialogTitle>
            <DialogDescription>
              {editingSchedule 
                ? 'Update the schedule name'
                : 'Enter a name for your new schedule'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Schedule Name</Label>
              <Input
                id="name"
                placeholder="Enter schedule name"
                value={scheduleName}
                onChange={(e) => setScheduleName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={editingSchedule ? handleUpdateSchedule : handleCreateSchedule}>
              {editingSchedule ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
