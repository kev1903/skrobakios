import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Clock, ChevronUp, ChevronDown, Settings, Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTimeTracking } from '@/hooks/useTimeTracking';
import { useProjects } from '@/hooks/useProjects';
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
    categories,
    addCategory,
    settings,
    loading
  } = useTimeTracking();

  const { getProjects } = useProjects();

  const [isExpanded, setIsExpanded] = useState(false);
  const [taskActivity, setTaskActivity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [currentDuration, setCurrentDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  const [projects, setProjects] = useState<Array<{id: string, name: string}>>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Load projects
  useEffect(() => {
    const loadProjects = async () => {
      setLoadingProjects(true);
      try {
        const projectList = await getProjects();
        setProjects(projectList.map(p => ({ id: p.id, name: p.name })));
      } catch (error) {
        console.error('Failed to load projects:', error);
      } finally {
        setLoadingProjects(false);
      }
    };

    loadProjects();
  }, [getProjects]);

  // Auto-expand when timer is running
  useEffect(() => {
    if (activeTimer && !isExpanded) {
      setIsExpanded(true);
    }
  }, [activeTimer, isExpanded]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (activeTimer) {
            handleStopTimer();
          } else if (taskActivity.trim()) {
            handleStartTimer();
          }
        }
        if (e.key === ' ') {
          e.preventDefault();
          setIsExpanded(!isExpanded);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTimer, taskActivity, isExpanded]);

  // Update timer duration every second with more precision
  useEffect(() => {
    if (activeTimer?.start_time && activeTimer.status === 'running' && !isPaused) {
      const updateDuration = () => {
        const now = new Date();
        const start = new Date(activeTimer.start_time);
        const duration = Math.floor((now.getTime() - start.getTime()) / 1000);
        setCurrentDuration(duration);
      };

      updateDuration();
      const interval = setInterval(updateDuration, 1000);
      return () => clearInterval(interval);
    } else if (!activeTimer) {
      setCurrentDuration(0);
    }
  }, [activeTimer, isPaused]);

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
      setIsExpanded(true); // Ensure form is visible
      return;
    }

    try {
      const projectName = selectedProject ? projects.find(p => p.id === selectedProject)?.name : undefined;
      await startTimer(taskActivity, selectedCategory || undefined, projectName);
      setIsPaused(false);
      toast({
        title: "Timer Started",
        description: `Started tracking "${taskActivity}"`,
      });
      // Keep the form filled for editing
    } catch (error) {
      console.error('Timer start error:', error);
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
      setIsPaused(false);
      toast({
        title: "Timer Stopped",
        description: `Time entry saved: ${formatDuration(currentDuration)}`,
      });
      // Clear form after successful stop
      setTaskActivity('');
      setSelectedCategory('');
      setSelectedProject('');
      setCurrentDuration(0);
    } catch (error) {
      console.error('Timer stop error:', error);
      toast({
        title: "Error",
        description: "Failed to stop timer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePauseTimer = () => {
    setIsPaused(!isPaused);
    toast({
      title: isPaused ? "Timer Resumed" : "Timer Paused",
      description: isPaused ? "Timer is now running" : "Timer is paused",
    });
  };

  

  // Don't render the floating tracker if loading
  if (loading) {
    return null;
  }

  return (
    <Card className={cn(
      "fixed bottom-6 right-6 z-50 shadow-lg border backdrop-blur-sm bg-card/95",
      "transition-all duration-300 ease-in-out",
      isExpanded ? "w-80 h-auto" : "w-auto h-auto",
      className
    )}>
      <CardContent className={cn(
        "transition-all duration-300",
        isExpanded ? "p-4" : "p-2"
      )}>
        {/* Minimalist Collapsed View */}
        {!isExpanded && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-muted-foreground" />
            <span className="font-mono text-sm font-medium text-muted-foreground">
              0:00
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="h-6 w-6 p-0"
              title="Start Timer"
            >
              <Play className="w-3 h-3" />
            </Button>
          </div>
        )}

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-3 space-y-3 animate-fade-in w-72">
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
                <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={categoryOpen}
                      className="mt-1 w-full justify-between text-left overflow-hidden"
                      disabled={!!activeTimer}
                    >
                      <span className="truncate flex-1 min-w-0">
                        {selectedCategory || "Select or type category..."}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 bg-popover border border-border shadow-lg z-50">
                    <Command>
                      <CommandInput 
                        placeholder="Search or type new category..." 
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                      />
                      <CommandList>
                        <CommandEmpty>
                          <div className="p-2">
                            <Button 
                              variant="ghost" 
                              className="w-full justify-start"
                              onClick={async () => {
                                if (selectedCategory && !categories.includes(selectedCategory)) {
                                  await addCategory(selectedCategory);
                                }
                                setCategoryOpen(false);
                              }}
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Add "{selectedCategory}"
                            </Button>
                          </div>
                        </CommandEmpty>
                        <CommandGroup>
                          {categories.map((category) => (
                            <CommandItem
                              key={category}
                              value={category}
                              onSelect={(currentValue) => {
                                setSelectedCategory(currentValue);
                                setCategoryOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedCategory === category ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {category}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Project</label>
                <Select
                  value={selectedProject}
                  onValueChange={setSelectedProject}
                  disabled={!!activeTimer || loadingProjects}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={loadingProjects ? "Loading..." : "Select project"} />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <div className={cn(
                "rounded-lg p-3 transition-colors",
                isPaused ? "bg-yellow-50 border border-yellow-200" : "bg-muted/50"
              )}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{activeTimer.task_activity}</div>
                    <div className="text-sm text-muted-foreground">
                      {activeTimer.category && `${activeTimer.category} • `}
                      {activeTimer.project_name || 'No project'}
                      {isPaused && <span className="ml-2 text-yellow-600">• Paused</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={isPaused ? "default" : "secondary"}
                      size="sm"
                      onClick={handlePauseTimer}
                    >
                      {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                      {isPaused ? 'Resume' : 'Pause'}
                    </Button>
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
              </div>
            )}

            {/* Keyboard shortcuts help */}
            <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted/30 rounded">
              <div>⌘/Ctrl + Enter: {activeTimer ? 'Stop' : 'Start'} timer</div>
              <div>⌘/Ctrl + Space: Toggle expand/collapse</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};