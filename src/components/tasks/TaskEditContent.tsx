import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Task } from '@/components/tasks/TaskContext';
import { ArrowLeft, Trash2, Save, FileText, Upload, MessageSquare, CheckSquare, DollarSign, Sparkles, Check, X } from 'lucide-react';
import { TaskDetailsTab } from '@/components/tasks/tabs/TaskDetailsTab';
import { TaskSubmittalsTab } from '@/components/tasks/tabs/TaskSubmittalsTab';
import { TaskReviewsTab } from '@/components/tasks/tabs/TaskReviewsTab';
import { TaskQATab } from '@/components/tasks/tabs/TaskQATab';
import { TaskCostsTab } from '@/components/tasks/tabs/TaskCostsTab';
import { TaskAISummaryTab } from '@/components/tasks/tabs/TaskAISummaryTab';
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
    <div className={isDialog ? "flex flex-col h-full" : "h-full w-full flex flex-col bg-[hsl(var(--background))]"}>
      {/* Luxury Header Bar with Glass Effect */}
      <div className="sticky top-0 z-30 border-b border-border/50 bg-gradient-to-b from-white to-accent/20 backdrop-blur-sm">
        <div className="px-8 py-6 mt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isDialog ? (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onClose} 
                    className="text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Close
                  </Button>
                  <div className="h-4 w-px bg-border/50" />
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onBack} 
                    className="text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Tasks
                  </Button>
                  <div className="h-4 w-px bg-border/50" />
                </>
              )}
              <h2 className="text-lg font-semibold text-foreground">
                {task.taskName}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={onMarkComplete}
                variant={task.status === 'Completed' ? 'default' : 'outline'}
                size="sm"
                disabled={task.status === 'Completed'}
                className={task.status === 'Completed' 
                  ? 'bg-luxury-gold text-white hover:bg-luxury-gold/90' 
                  : 'border-border/50 hover:bg-luxury-gold/10 hover:border-luxury-gold/50'}
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
              {hasUnsavedChanges && (
                <div className="h-4 w-px bg-border/50" />
              )}
              <Button 
                variant="default" 
                size="sm" 
                onClick={onSave}
                disabled={!hasUnsavedChanges}
                className="bg-luxury-gold text-white hover:bg-luxury-gold-dark shadow-[0_2px_8px_rgba(0,0,0,0.1)] disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content with Tabs */}
      <div className="flex-1 overflow-y-auto bg-[hsl(var(--background))]">
        <div className="max-w-7xl mx-auto w-full px-8 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full bg-white/80 border border-border/30 rounded-xl h-auto p-1 mb-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)] inline-flex justify-start">
              <TabsTrigger 
                value="details" 
                className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 data-[state=active]:bg-luxury-gold data-[state=active]:text-white data-[state=active]:shadow-[0_2px_8px_rgba(0,0,0,0.1)] data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-accent/50"
              >
                <FileText className="w-4 h-4" />
                <span>Details</span>
              </TabsTrigger>
              <TabsTrigger 
                value="submittals" 
                className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 data-[state=active]:bg-luxury-gold data-[state=active]:text-white data-[state=active]:shadow-[0_2px_8px_rgba(0,0,0,0.1)] data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-accent/50"
              >
                <Upload className="w-4 h-4" />
                <span>Submittals</span>
              </TabsTrigger>
              <TabsTrigger 
                value="reviews" 
                className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 data-[state=active]:bg-luxury-gold data-[state=active]:text-white data-[state=active]:shadow-[0_2px_8px_rgba(0,0,0,0.1)] data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-accent/50"
                disabled={!canViewSubModule('tasks', 'reviews')}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Reviews</span>
              </TabsTrigger>
              <TabsTrigger 
                value="qa" 
                className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 data-[state=active]:bg-luxury-gold data-[state=active]:text-white data-[state=active]:shadow-[0_2px_8px_rgba(0,0,0,0.1)] data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-accent/50"
              >
                <CheckSquare className="w-4 h-4" />
                <span>Q&A</span>
              </TabsTrigger>
              <TabsTrigger 
                value="costs" 
                className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 data-[state=active]:bg-luxury-gold data-[state=active]:text-white data-[state=active]:shadow-[0_2px_8px_rgba(0,0,0,0.1)] data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-accent/50"
              >
                <DollarSign className="w-4 h-4" />
                <span>Costs</span>
              </TabsTrigger>
              <TabsTrigger 
                value="summary" 
                className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 data-[state=active]:bg-luxury-gold data-[state=active]:text-white data-[state=active]:shadow-[0_2px_8px_rgba(0,0,0,0.1)] data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-accent/50"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Summary</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-0">
              <TaskDetailsTab 
                task={task} 
                onUpdate={onTaskUpdate}
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

            <TabsContent value="summary" className="mt-0">
              <TaskAISummaryTab taskId={task.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
