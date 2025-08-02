import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Clock, ChevronUp, ChevronDown, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useTimeTracking } from '@/hooks/useTimeTracking';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface FloatingTimeTrackerProps {
  className?: string;
}

export const FloatingTimeTracker = ({ className }: FloatingTimeTrackerProps) => {
  const { toast } = useToast();
  const {
    activeTimer,
    startTimer,
    stopTimer,
    settings,
    loading
  } = useTimeTracking();

  const [isExpanded, setIsExpanded] = useState(false);
  const [taskActivity, setTaskActivity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [projectName, setProjectName] = useState('');
  const [currentDuration, setCurrentDuration] = useState(0);

  // Update timer duration every second
  useEffect(() => {
    if (activeTimer?.start_time) {
      const updateDuration = () => {
        const now = new Date();
        const start = new Date(activeTimer.start_time);
        const duration = Math.floor((now.getTime() - start.getTime()) / 1000);
        setCurrentDuration(duration);
      };

      updateDuration();
      const interval = setInterval(updateDuration, 1000);
      return () => clearInterval(interval);
    } else {
      setCurrentDuration(0);
    }
  }, [activeTimer]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = async () => {
    if (!taskActivity.trim()) {
      toast({
        title: "Task Required",
        description: "Please enter a task description before starting the timer.",
        variant: "destructive",
      });
      return;
    }

    try {
      await startTimer(taskActivity, selectedCategory || undefined, projectName || undefined);
      toast({
        title: "Timer Started",
        description: `Started tracking "${taskActivity}"`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start timer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStopTimer = async () => {
    try {
      await stopTimer();
      toast({
        title: "Timer Stopped",
        description: "Time entry has been saved.",
      });
      // Clear form
      setTaskActivity('');
      setSelectedCategory('');
      setProjectName('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to stop timer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const categories = settings?.productive_categories || ['Work', 'Development', 'Meeting', 'Research'];

  if (loading) {
    return null;
  }

  return (
    <Card className={cn(
      "fixed bottom-6 right-6 z-50 w-80 shadow-lg border backdrop-blur-sm bg-card/95",
      "transition-all duration-300 ease-in-out",
      isExpanded ? "h-auto" : "h-16",
      className
    )}>
      <CardContent className="p-4">
        {/* Collapsed Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-3 h-3 rounded-full",
              activeTimer ? "bg-green-500 animate-pulse" : "bg-gray-400"
            )} />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="font-mono text-lg font-semibold">
                  {formatDuration(currentDuration)}
                </span>
              </div>
              {activeTimer && (
                <span className="text-xs text-muted-foreground truncate max-w-32">
                  {activeTimer.task_activity}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {activeTimer ? (
              <Button
                size="sm"
                variant="destructive"
                onClick={handleStopTimer}
                className="h-8 w-8 p-0"
              >
                <Square className="w-3 h-3" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => isExpanded ? handleStartTimer() : setIsExpanded(true)}
                disabled={!isExpanded && !taskActivity}
                className="h-8 w-8 p-0"
              >
                <Play className="w-3 h-3" />
              </Button>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
            </Button>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-4 space-y-3 animate-fade-in">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Task Description</label>
              <Input
                placeholder="What are you working on?"
                value={taskActivity}
                onChange={(e) => setTaskActivity(e.target.value)}
                disabled={!!activeTimer}
                className="mt-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !activeTimer) {
                    handleStartTimer();
                  }
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Category</label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                  disabled={!!activeTimer}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Project</label>
                <Input
                  placeholder="Project name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  disabled={!!activeTimer}
                  className="mt-1"
                />
              </div>
            </div>

            {!activeTimer && (
              <Button
                onClick={handleStartTimer}
                disabled={!taskActivity.trim()}
                className="w-full"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Timer
              </Button>
            )}

            {activeTimer && (
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{activeTimer.task_activity}</div>
                    <div className="text-sm text-muted-foreground">
                      {activeTimer.category && `${activeTimer.category} • `}
                      {activeTimer.project_name || 'No project'}
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleStopTimer}
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Stop
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};