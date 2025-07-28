
import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Task, useTaskContext } from './TaskContext';
import { TaskEditHeader } from './TaskEditHeader';
import { TaskEditForm } from './TaskEditForm';
import { EnhancedTaskEditForm } from './enhanced/EnhancedTaskEditForm';
import { TaskEditActions } from './TaskEditActions';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { SubtasksList } from './subtasks';
import { TaskCommentsActivity } from './TaskCommentsActivity';
import { SubmittalWorkflow } from './SubmittalWorkflow';
import { TaskAttachmentsDisplay } from './TaskAttachmentsDisplay';
import { useIsMobile } from '@/hooks/use-mobile';

import { useToast } from '@/hooks/use-toast';

interface TaskEditSidePanelProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
}

export const TaskEditSidePanel = ({ task, isOpen, onClose, projectId }: TaskEditSidePanelProps) => {
  const { updateTask, deleteTask } = useTaskContext();
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    attachments: false,
    subtasks: true,
    workflow: false,
    activity: false
  });
  const isMobile = useIsMobile();
  const { toast } = useToast();

  useEffect(() => {
    if (task) {
      setEditedTask({ ...task });
      setHasUnsavedChanges(false);
    } else {
      setEditedTask(null);
      setHasUnsavedChanges(false);
    }
  }, [task, isOpen]);

  if (!editedTask) {
    return null;
  }

  const handleSave = async () => {
    if (editedTask && hasUnsavedChanges) {
      try {
        // Save immediately without blocking UI
        updateTask(editedTask.id, editedTask);
        setHasUnsavedChanges(false);
        // Remove the success toast to make it completely seamless
      } catch (error) {
        toast({
          title: "Error saving task",
          description: "There was an error saving your changes. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleFieldChange = (field: keyof Task, value: any) => {
    if (editedTask) {
      setEditedTask({
        ...editedTask,
        [field]: value
      });
      setHasUnsavedChanges(true);
    }
  };

  const handleMarkComplete = async () => {
    if (editedTask) {
      const updates = {
        status: 'Completed' as const,
        progress: 100
      };
      
      // Update local state immediately
      setEditedTask({
        ...editedTask,
        ...updates
      });
      
      // Save to database immediately
      try {
        await updateTask(editedTask.id, updates);
      } catch (error) {
        console.error('Error marking task as complete:', error);
      }
    }
  };

  const handleDelete = async () => {
    if (editedTask) {
      await deleteTask(editedTask.id);
      onClose();
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      case 'low': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-success/10 text-success border-success/20';
      case 'in progress': return 'bg-primary/10 text-primary border-primary/20';
      case 'pending': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-muted text-muted-foreground border-muted';
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent 
        className={`${
          isMobile 
            ? '!w-full !max-w-full' 
            : '!w-[800px] !max-w-[800px] sm:!w-[800px] sm:!max-w-[800px]'
        } overflow-y-auto bg-background border-l border-border p-0`}
        side={isMobile ? "bottom" : "right"}
      >
        {/* Redesigned Header Section */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-20">
          <TaskEditHeader 
            task={editedTask} 
            onMarkComplete={handleMarkComplete} 
            onDelete={handleDelete}
            onTaskNameChange={(newName) => handleFieldChange('taskName', newName)}
            onSave={handleSave}
          />
          
          {/* Task Status Bar */}
          <div className="px-6 py-3 flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-3">
              <div className={`px-2 py-1 rounded-md text-xs font-medium border ${getPriorityBadgeColor(editedTask.priority)}`}>
                {editedTask.priority || 'Medium'}
              </div>
              <div className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusBadgeColor(editedTask.status)}`}>
                {editedTask.status || 'Not Started'}
              </div>
              {editedTask.dueDate && (
                <div className="text-xs text-muted-foreground">
                  Due: {editedTask.dueDate}
                </div>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {editedTask.progress || 0}% complete
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Primary Task Details - Always Visible */}
          <div className="p-6 border-b border-border">
            <EnhancedTaskEditForm
              task={editedTask}
              projectId={projectId || ''}
              onTaskUpdate={(updates) => {
                setEditedTask(prev => prev ? { ...prev, ...updates } : prev);
                setHasUnsavedChanges(true);
              }}
              onSave={handleSave}
              onCancel={handleClose}
            />
          </div>

          {/* Secondary Sections - Collapsible */}
          <div className="space-y-0">
            {/* Subtasks Section */}
            <Collapsible 
              open={expandedSections.subtasks} 
              onOpenChange={() => toggleSection('subtasks')}
            >
              <CollapsibleTrigger className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors group border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    {expandedSections.subtasks ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                  <h3 className="font-medium text-foreground">Subtasks</h3>
                </div>
                <div className="text-xs text-muted-foreground">
                  Manage task breakdown
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-6 py-4 bg-muted/20">
                <SubtasksList 
                  taskId={editedTask.id}
                  projectMembers={[]}
                  onSubtaskClick={(subtask) => {
                    console.log('Opening subtask:', subtask);
                  }}
                />
              </CollapsibleContent>
            </Collapsible>

            {/* Attachments Section */}
            <Collapsible 
              open={expandedSections.attachments} 
              onOpenChange={() => toggleSection('attachments')}
            >
              <CollapsibleTrigger className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors group border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    {expandedSections.attachments ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                  <h3 className="font-medium text-foreground">Attachments</h3>
                </div>
                <div className="text-xs text-muted-foreground">
                  Files and documents
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-6 py-4 bg-muted/20">
                <TaskAttachmentsDisplay taskId={editedTask.id} />
              </CollapsibleContent>
            </Collapsible>

            {/* Submittal Workflow Section */}
            <Collapsible 
              open={expandedSections.workflow} 
              onOpenChange={() => toggleSection('workflow')}
            >
              <CollapsibleTrigger className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors group border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    {expandedSections.workflow ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                  <h3 className="font-medium text-foreground">Workflow</h3>
                </div>
                <div className="text-xs text-muted-foreground">
                  Submittal process
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-6 py-4 bg-muted/20">
                <SubmittalWorkflow 
                  taskId={editedTask.id}
                  projectMembers={[]}
                />
              </CollapsibleContent>
            </Collapsible>

            {/* Comments and Activity Section */}
            <Collapsible 
              open={expandedSections.activity} 
              onOpenChange={() => toggleSection('activity')}
            >
              <CollapsibleTrigger className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors group">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    {expandedSections.activity ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                  <h3 className="font-medium text-foreground">Activity</h3>
                </div>
                <div className="text-xs text-muted-foreground">
                  Comments and updates
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-6 py-4 bg-muted/20">
                <TaskCommentsActivity taskId={editedTask.id} />
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
