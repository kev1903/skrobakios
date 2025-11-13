import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useProjects } from '@/hooks/useProjects';
import { useWBS } from '@/hooks/useWBS';
import { useUser } from '@/contexts/UserContext';
import { useCompany } from '@/contexts/CompanyContext';
import { useToast } from '@/hooks/use-toast';
import { useTaskAssignmentEmail } from '@/hooks/useTaskAssignmentEmail';

interface CreateTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated?: () => void;
}

export const CreateTaskDialog = ({ isOpen, onClose, onTaskCreated }: CreateTaskDialogProps) => {
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedWbsItemId, setSelectedWbsItemId] = useState<string>('');
  const [taskType, setTaskType] = useState<'Task' | 'Bug' | 'Feature' | 'Issue'>('Task');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<Array<{ id: string; name: string; project_id: string }>>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const { getProjects } = useProjects();
  const { wbsItems, loadWBSItems } = useWBS(selectedProjectId);
  const { userProfile } = useUser();
  const { currentCompany } = useCompany();
  const { toast } = useToast();
  const { sendTaskAssignmentEmail } = useTaskAssignmentEmail();

  // Load projects when dialog opens
  useEffect(() => {
    if (isOpen && currentCompany?.id) {
      loadProjects();
    }
  }, [isOpen, currentCompany?.id]);

  // Load WBS items when project is selected
  useEffect(() => {
    if (selectedProjectId) {
      loadWBSItems();
    }
  }, [selectedProjectId]);

  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      const projectList = await getProjects();
      setProjects(projectList);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load projects',
        variant: 'destructive',
      });
    } finally {
      setLoadingProjects(false);
    }
  };

  const resetForm = () => {
    setTaskName('');
    setDescription('');
    setSelectedProjectId('');
    setSelectedWbsItemId('');
    setTaskType('Task');
    setPriority('Medium');
    setDueDate(undefined);
  };

  const handleSubmit = async () => {
    if (!taskName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Task name is required',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedProjectId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a project',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Set due date to midnight if no date selected (backlog)
      const taskDueDate = dueDate || new Date();
      taskDueDate.setHours(0, 0, 0, 0);

      const taskData = {
        project_id: selectedProjectId,
        wbs_item_id: selectedWbsItemId || null,
        task_name: taskName,
        description: description || '',
        task_type: taskType,
        category: 'General',
        priority: priority,
        assigned_to_name: `${userProfile.firstName} ${userProfile.lastName}`.trim(),
        assigned_to_avatar: userProfile.avatarUrl || '',
        assigned_to_user_id: user.id,
        due_date: taskDueDate.toISOString(),
        status: 'Not Started',
        progress: 0,
        is_milestone: false,
        is_critical_path: false,
        duration: 1,
      };

      const { data: newTask, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single();

      if (error) throw error;

      // Send assignment email notification
      if (newTask?.id) {
        await sendTaskAssignmentEmail(newTask.id);
      }

      toast({
        title: 'Task Created',
        description: `"${taskName}" has been created successfully`,
      });

      resetForm();
      onClose();
      onTaskCreated?.();
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to create task. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWbsDisplayText = (wbsItem: any) => {
    const indent = '　'.repeat(wbsItem.level || 0);
    return `${indent}${wbsItem.wbs_id} - ${wbsItem.title}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-xl border border-border/30 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-playfair text-foreground">Create New Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Project Selection */}
          <div className="space-y-2">
            <Label htmlFor="project" className="text-sm font-semibold text-foreground">
              Project <span className="text-destructive">*</span>
            </Label>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId} disabled={loadingProjects}>
              <SelectTrigger className="h-11 bg-white/80 backdrop-blur-md border-border/30">
                <SelectValue placeholder={loadingProjects ? "Loading projects..." : "Select a project"} />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-xl border-border/30">
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.project_id} - {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* WBS Item Selection (optional) */}
          {selectedProjectId && wbsItems.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="wbs" className="text-sm font-semibold text-foreground">
                WBS Item (Optional)
              </Label>
              <Select value={selectedWbsItemId} onValueChange={setSelectedWbsItemId}>
                <SelectTrigger className="h-11 bg-white/80 backdrop-blur-md border-border/30">
                  <SelectValue placeholder="Select a WBS item" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-xl border-border/30 max-h-[300px]">
                  <SelectItem value="">None</SelectItem>
                  {wbsItems.map((wbs) => (
                    <SelectItem key={wbs.id} value={wbs.id} className="font-mono text-xs">
                      {getWbsDisplayText(wbs)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Task Name */}
          <div className="space-y-2">
            <Label htmlFor="taskName" className="text-sm font-semibold text-foreground">
              Task Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="taskName"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="Enter task name"
              className="h-11 bg-white/80 backdrop-blur-md border-border/30"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-foreground">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              className="min-h-[100px] bg-white/80 backdrop-blur-md border-border/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Task Type */}
            <div className="space-y-2">
              <Label htmlFor="taskType" className="text-sm font-semibold text-foreground">
                Task Type
              </Label>
              <Select value={taskType} onValueChange={(value: any) => setTaskType(value)}>
                <SelectTrigger className="h-11 bg-white/80 backdrop-blur-md border-border/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-xl border-border/30">
                  <SelectItem value="Task">Task</SelectItem>
                  <SelectItem value="Bug">Bug</SelectItem>
                  <SelectItem value="Feature">Feature</SelectItem>
                  <SelectItem value="Issue">Issue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-semibold text-foreground">
                Priority
              </Label>
              <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                <SelectTrigger className="h-11 bg-white/80 backdrop-blur-md border-border/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-xl border-border/30">
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-11 justify-start text-left font-normal bg-white/80 backdrop-blur-md border-border/30",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : <span>Pick a date (optional)</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white/95 backdrop-blur-xl border-border/30" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="bg-white/60 backdrop-blur-md border-border/30 hover:bg-accent/50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !taskName.trim() || !selectedProjectId}
            className="bg-luxury-gold hover:bg-luxury-gold/90 text-white shadow-md hover:scale-[1.02] transition-all duration-200"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Task'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
