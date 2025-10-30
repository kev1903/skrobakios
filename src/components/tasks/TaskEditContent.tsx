import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Task } from '@/components/tasks/TaskContext';
import { ArrowLeft, Trash2, Save, FileText, Upload, MessageSquare, CheckSquare, DollarSign, Sparkles, Check, X, Paperclip } from 'lucide-react';
import { TaskDetailsTab } from '@/components/tasks/tabs/TaskDetailsTab';
import { TaskSubmittalsTab } from '@/components/tasks/tabs/TaskSubmittalsTab';
import { TaskReviewsTab } from '@/components/tasks/tabs/TaskReviewsTab';
import { TaskQATab } from '@/components/tasks/tabs/TaskQATab';
import { TaskCostsTab } from '@/components/tasks/tabs/TaskCostsTab';
import { TaskAISummaryTab } from '@/components/tasks/tabs/TaskAISummaryTab';
import { TaskAttachmentPreview } from '@/components/tasks/TaskAttachmentPreview';
import { UserPermissionsContext } from '@/contexts/UserPermissionsContext';

interface TaskEditContentProps {
  task: Task;
  hasUnsavedChanges: boolean;
  onBack: () => void;
  onSave: () => void;
  onDelete: () => void;
  onMarkComplete: () => void;
  onTaskUpdate: (updates: Partial<Task>) => void;
  isDialog?: boolean;
  onClose?: () => void;
}

export const TaskEditContent = ({ 
  task, 
  hasUnsavedChanges, 
  onBack, 
  onSave, 
  onDelete, 
  onMarkComplete, 
  onTaskUpdate,
  isDialog = false,
  onClose
}: TaskEditContentProps) => {
  const [activeTab, setActiveTab] = useState('details');
  
  // Optional permissions context - may not be available if no company is selected
  const permissionsContext = React.useContext(UserPermissionsContext);
  const canViewSubModule = permissionsContext?.canViewSubModule ?? (() => true);

  return (
    <div className={isDialog ? "flex flex-col h-full" : "h-full w-full flex flex-col bg-background"}>
      {/* Tabs Container - Full Width */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full w-full flex flex-col">
        <div className="flex-shrink-0 border-b border-border bg-white">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Left: Back Button & Task Name */}
            <div className="flex items-center gap-4">
              {!isDialog && (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onBack} 
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Tasks
                  </Button>
                  <div className="h-4 w-px bg-border/50" />
                </>
              )}
              {isDialog && (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onClose} 
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Close
                  </Button>
                  <div className="h-4 w-px bg-border/50" />
                </>
              )}
              <h2 className="text-lg font-semibold text-foreground">
                {task.taskName}
              </h2>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-2">
              <Button 
                onClick={onMarkComplete}
                variant={task.status === 'Completed' ? 'default' : 'outline'}
                size="sm"
                disabled={task.status === 'Completed'}
              >
                <Check className="w-4 h-4 mr-2" />
                {task.status === 'Completed' ? 'Completed' : 'Mark Complete'}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onDelete} 
                className="text-muted-foreground hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={onSave}
                disabled={!hasUnsavedChanges}
                className="disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>

          {/* Tabs Row */}
          <div className="px-6 pb-2">
            <TabsList className="inline-flex h-9 items-center justify-start bg-muted/30 p-1 rounded-md">
              <TabsTrigger 
                value="details" 
                className="flex items-center gap-2 text-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Details</span>
              </TabsTrigger>
              <TabsTrigger 
                value="submittals" 
                className="flex items-center gap-2 text-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Submittals</span>
              </TabsTrigger>
              <TabsTrigger 
                value="reviews" 
                className="flex items-center gap-2 text-xs"
                disabled={!canViewSubModule('tasks', 'reviews')}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Reviews</span>
              </TabsTrigger>
              <TabsTrigger 
                value="qa" 
                className="flex items-center gap-2 text-xs"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Q&A</span>
              </TabsTrigger>
              <TabsTrigger 
                value="costs" 
                className="flex items-center gap-2 text-xs"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Costs</span>
              </TabsTrigger>
              <TabsTrigger 
                value="attachments" 
                className="flex items-center gap-2 text-xs"
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>Attachments</span>
              </TabsTrigger>
              <TabsTrigger 
                value="summary" 
                className="flex items-center gap-2 text-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Summary</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <TabsContent value="details" className="mt-0">
        <TaskDetailsTab 
          task={task} 
          onUpdate={onTaskUpdate}
          projectId={task.project_id}
        />
            </TabsContent>

            <TabsContent value="submittals" className="mt-0">
              <TaskSubmittalsTab taskId={task.id} />
            </TabsContent>

            <TabsContent value="reviews" className="mt-0">
              <TaskReviewsTab taskId={task.id} />
            </TabsContent>

            <TabsContent value="qa" className="mt-0">
              <TaskQATab taskId={task.id} />
            </TabsContent>

            <TabsContent value="costs" className="mt-0">
              <TaskCostsTab taskId={task.id} />
            </TabsContent>

            <TabsContent value="attachments" className="mt-0">
              <TaskAttachmentPreview taskId={task.id} />
            </TabsContent>

            <TabsContent value="summary" className="mt-0">
              <TaskAISummaryTab taskId={task.id} />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
};
