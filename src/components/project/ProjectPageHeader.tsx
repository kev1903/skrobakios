import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Pause, Square, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTimeTracking } from '@/contexts/TimeTrackingContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface ProjectPageHeaderProps {
  projectName: string;
  pageTitle: string;
  onNavigate: (page: string) => void;
  actions?: React.ReactNode;
}

export const ProjectPageHeader = ({ projectName, pageTitle, onNavigate, actions }: ProjectPageHeaderProps) => {
  const { activeTimer, pauseTimer, stopTimer, resumeTimer, updateTimeEntry } = useTimeTracking();
  const { toast } = useToast();
  const [elapsedTime, setElapsedTime] = useState<string>('00:00');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTaskActivity, setEditTaskActivity] = useState('');

  // Update elapsed time every second when timer is active
  useEffect(() => {
    if (!activeTimer || activeTimer.status !== 'running') {
      return;
    }

    const updateElapsed = () => {
      const start = new Date(activeTimer.start_time).getTime();
      const now = Date.now();
      const diff = Math.floor((now - start) / 1000); // seconds
      
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      
      const formatted = hours > 0 
        ? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      setElapsedTime(formatted);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [activeTimer]);

  const handlePause = async () => {
    try {
      if (activeTimer?.status === 'running') {
        await pauseTimer();
        toast({
          title: "Timer Paused",
          description: "Your time tracking has been paused.",
        });
      } else if (activeTimer?.status === 'paused') {
        await resumeTimer();
        toast({
          title: "Timer Resumed",
          description: "Your time tracking has been resumed.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to pause/resume timer.",
        variant: "destructive",
      });
    }
  };

  const handleStop = async () => {
    try {
      await stopTimer();
      toast({
        title: "Timer Stopped",
        description: "Your time entry has been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to stop timer.",
        variant: "destructive",
      });
    }
  };

  const handleEditOpen = () => {
    if (activeTimer) {
      setEditTaskActivity(activeTimer.task_activity || '');
      setEditDialogOpen(true);
    }
  };

  const handleEditSave = async () => {
    if (activeTimer && editTaskActivity.trim()) {
      try {
        await updateTimeEntry(activeTimer.id, { task_activity: editTaskActivity });
        toast({
          title: "Timer Updated",
          description: "Task activity has been updated.",
        });
        setEditDialogOpen(false);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update timer.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="flex-shrink-0 border-b border-border bg-white">
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-foreground font-inter">{projectName}</h1>
          
          {/* Active Time Tracker Indicator */}
          {activeTimer && (activeTimer.status === 'running' || activeTimer.status === 'paused') && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full animate-pulse-subtle hover:bg-primary/20 transition-colors cursor-pointer">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <Clock className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-primary">{elapsedTime}</span>
                  <span className="text-xs text-muted-foreground max-w-[200px] truncate">
                    {activeTimer.task_activity}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 bg-background">
                <DropdownMenuItem onClick={handlePause} className="cursor-pointer">
                  <Pause className="w-4 h-4 mr-2" />
                  {activeTimer.status === 'paused' ? 'Resume' : 'Pause'} Timer
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleStop} className="cursor-pointer">
                  <Square className="w-4 h-4 mr-2" />
                  Stop Timer
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEditOpen} className="cursor-pointer">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Timer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Edit Timer Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-background">
          <DialogHeader>
            <DialogTitle>Edit Time Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="task-activity">Task Activity</Label>
              <Input
                id="task-activity"
                value={editTaskActivity}
                onChange={(e) => setEditTaskActivity(e.target.value)}
                placeholder="What are you working on?"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
