import React, { useState, useEffect } from 'react';
import { Play, ArrowLeftRight, Square, ChevronDown, Check, ChevronsUpDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTimeTracking } from '@/contexts/TimeTrackingContext';
import { useProjects } from '@/hooks/useProjects';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export const TimerTopBar = () => {
  const { toast } = useToast();
  const { activeTimer, stopTimer, pauseTimer, resumeTimer, startTimer, categories, addCategory, settings, loading } = useTimeTracking();
  const { getProjects } = useProjects();
  
  const [currentDuration, setCurrentDuration] = useState(0);
  const isPaused = activeTimer?.status === 'paused';
  
  // Timer creation form state
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [taskActivity, setTaskActivity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
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
        console.error('Error loading projects:', error);
      } finally {
        setLoadingProjects(false);
      }
    };

    loadProjects();
  }, [getProjects]);

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
          setIsFormExpanded(!isFormExpanded);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTimer, taskActivity, isFormExpanded]);

  // Debug logging
  React.useEffect(() => {
    console.log('TimerTopBar activeTimer state:', activeTimer);
    console.log('TimerTopBar rendering, activeTimer exists:', !!activeTimer);
  }, [activeTimer]);

  useEffect(() => {
    if (!activeTimer) return;

    // Update duration every second when timer is active
    const interval = setInterval(() => {
      if (!isPaused && activeTimer.start_time) {
        const startTime = new Date(activeTimer.start_time).getTime();
        const now = Date.now();
        setCurrentDuration(Math.floor((now - startTime) / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer, isPaused]);

  // Initialize duration when activeTimer changes
  useEffect(() => {
    if (activeTimer?.start_time) {
      const startTime = new Date(activeTimer.start_time).getTime();
      const now = Date.now();
      setCurrentDuration(Math.floor((now - startTime) / 1000));
    }
  }, [activeTimer]);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePauseResume = () => {
    if (isPaused) {
      resumeTimer();
    } else {
      pauseTimer();
    }
  };

  const handleStartTimer = async () => {
    if (!taskActivity.trim()) {
      toast({
        title: "Task Required",
        description: "Please enter a task description before starting the timer.",
        variant: "destructive",
      });
      setIsFormExpanded(true); // Ensure form is visible
      return;
    }

    try {
      const projectName = selectedProject && selectedProject !== 'none' ? projects.find(p => p.id === selectedProject)?.name : undefined;
      await startTimer(taskActivity, selectedCategory || undefined, projectName);
      toast({
        title: "Timer Started",
        description: `Started tracking "${taskActivity}"`,
      });
      setIsFormExpanded(false); // Collapse form after starting
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

  // Always render the top bar, but show different content based on timer state
  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-6 py-3">
          {activeTimer ? (
            // Active Timer State
            <>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-orange-500' : 'bg-green-500'} animate-pulse`} />
                  <span className="text-2xl font-mono font-semibold">
                    {formatDuration(currentDuration)}
                  </span>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {activeTimer.task_activity || 'No description'}
                </div>
                
                {activeTimer.category && (
                  <span className="px-2 py-1 text-xs bg-muted rounded-md">
                    {activeTimer.category}
                  </span>
                )}
                
                {activeTimer.project_name && (
                  <span className="px-2 py-1 text-xs bg-muted rounded-md">
                    {activeTimer.project_name}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePauseResume}
                  className="h-8 w-8 p-0"
                >
                  {isPaused ? (
                    <Play className="h-4 w-4" />
                  ) : (
                    <ArrowLeftRight className="h-4 w-4" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleStopTimer}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Square className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            // No Active Timer State with Form
            <>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                  <span className="text-2xl font-mono font-semibold text-gray-500">
                    00:00
                  </span>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  No active timer
                </div>
                
                <span className="px-2 py-1 text-xs bg-muted rounded-md text-gray-500">
                  Ready to track
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFormExpanded(!isFormExpanded)}
                  className="gap-2"
                >
                  <Play className="h-4 w-4" />
                  Start Timer
                  <ChevronDown className={cn("h-3 w-3 transition-transform", isFormExpanded && "rotate-180")} />
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Expandable Timer Creation Form */}
        {isFormExpanded && !activeTimer && (
          <div className="border-t border-border bg-card/98 backdrop-blur-sm">
            <div className="px-6 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Start New Timer</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFormExpanded(false)}
                  className="h-6 w-6 p-0"
                  title="Collapse"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Task Description */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Task Description</label>
                  <Input
                    placeholder="What are you working on?"
                    value={taskActivity}
                    onChange={(e) => setTaskActivity(e.target.value)}
                    className="mt-1 h-8"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleStartTimer();
                      }
                    }}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Category</label>
                  <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={categoryOpen}
                        className="mt-1 w-full h-8 justify-between text-left overflow-hidden"
                      >
                        <span className="truncate flex-1 min-w-0 text-xs">
                          {selectedCategory || "Select category..."}
                        </span>
                        <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
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
                                className="w-full justify-start text-xs"
                                onClick={async () => {
                                  if (selectedCategory && !categories.includes(selectedCategory)) {
                                    await addCategory(selectedCategory);
                                  }
                                  setCategoryOpen(false);
                                }}
                              >
                                <Check className="mr-2 h-3 w-3" />
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
                                  setSelectedCategory(currentValue === selectedCategory ? "" : currentValue);
                                  setCategoryOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-3 w-3",
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

                {/* Project */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Project</label>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger className="mt-1 h-8">
                      <SelectValue placeholder="Select project..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No project</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  Press Ctrl+Enter to start • Ctrl+Space to toggle
                </div>
                <Button
                  onClick={handleStartTimer}
                  disabled={!taskActivity.trim()}
                  size="sm"
                  className="gap-1"
                >
                  <Play className="w-3 h-3" />
                  Start Timer
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Spacer to push content down */}
      <div className="h-[73px]" />
    </>
  );
};