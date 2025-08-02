import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, ArrowLeftRight, Square, ChevronDown, Check, ChevronsUpDown, X, Menu, ClipboardList, Calendar as CalendarIcon, Inbox, User, Save, Bell, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { NotificationBadge } from '@/components/ui/notification-badge';
import { NotificationDropdown } from '@/components/ui/notification-dropdown';
// Removed useSidebar import since we're not using global sidebar provider
import { useTimeTracking } from '@/contexts/TimeTrackingContext';
import { useProjects } from '@/hooks/useProjects';
import { useUser } from '@/contexts/UserContext';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { useAppContext } from '@/contexts/AppContextProvider';
import { useGlobalSidebar } from '@/contexts/GlobalSidebarContext';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const MenuBar = () => {
  const { toast } = useToast();
  const { activeTimer, stopTimer, pauseTimer, resumeTimer, startTimer, categories, addCategory, settings, loading } = useTimeTracking();
  const { getProjects } = useProjects();
  const { userProfile } = useUser();
  const { unreadCount } = useNotifications();
  const { isAuthenticated } = useAuth();
  const { currentCompany } = useCompany();
  const { activeContext } = useAppContext();
  const { toggleSidebar } = useGlobalSidebar();
  
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
  
  // Header icons state
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

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

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Error",
          description: "Failed to log out. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Successfully logged out",
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during logout",
        variant: "destructive",
      });
    }
  };

  // Get display text for company logo - using same logic as CenteredCompanyName
  const getCompanyDisplayText = () => {
    if (activeContext === 'personal') {
      // Show user's full name for personal context
      if (userProfile.firstName || userProfile.lastName) {
        return `${userProfile.firstName} ${userProfile.lastName}`.trim();
      }
      // Fallback to email for personal context
      return userProfile.email || "Personal";
    } else {
      // Show business name for company context
      // Check if company name looks like an auto-generated default
      const isDefaultCompanyName = currentCompany?.name && (
        currentCompany.name.includes('@') || 
        currentCompany.name.endsWith('\'s Business') ||
        currentCompany.name.endsWith('\'s Company')
      );
      
      // If we have a real company name (not auto-generated), show it
      if (currentCompany?.name && !isDefaultCompanyName) {
        return currentCompany.name;
      }
      
      // Fallback to user's name or default for company context
      if (userProfile.firstName || userProfile.lastName) {
        return `${userProfile.firstName} ${userProfile.lastName}`.trim();
      }
      
      return userProfile.email || "SKROBAKI";
    }
  };

  // Always render the top bar, but show different content based on timer state
  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Left side - Menu and Company Logo */}
          <div className="flex items-center space-x-4">
            {/* Hamburger Menu Icon */}
            <button 
              onClick={toggleSidebar}
              className="w-8 h-8 bg-background/20 backdrop-blur-sm rounded-md border border-border flex items-center justify-center hover:bg-background/30 transition-colors duration-200"
              aria-label="Toggle main navigation sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
            
            {/* Company Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">
                  {getCompanyDisplayText().charAt(0).toUpperCase()}
                </span>
              </div>
              <h1 className="text-sm font-bold text-foreground hidden sm:block">
                {getCompanyDisplayText()}
              </h1>
            </div>
          </div>

          {/* Center - Timer info */}
          <div className="flex items-center space-x-4">
            {activeTimer && (
              <>
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
              </>
            )}
          </div>

          {/* Right side - Navigation icons and actions */}
          <div className="flex items-center space-x-3">
            {/* Navigation Icons */}
            {isAuthenticated ? (
              <>
                {/* Tasks Icon */}
                <Link 
                  to="/tasks"
                  className="w-8 h-8 bg-background/20 backdrop-blur-sm rounded-md border border-border flex items-center justify-center hover:bg-background/30 transition-colors duration-200"
                >
                  <ClipboardList className="w-4 h-4" />
                </Link>
                
                {/* Notifications */}
                <NotificationDropdown>
                  <NotificationBadge count={unreadCount}>
                    <button className="w-8 h-8 bg-background/20 backdrop-blur-sm rounded-md border border-border flex items-center justify-center hover:bg-background/30 transition-colors duration-200">
                      <Bell className="w-4 h-4" />
                    </button>
                  </NotificationBadge>
                </NotificationDropdown>
                
                {/* Inbox Icon */}
                <button 
                  onClick={() => window.location.href = '/?page=inbox'} 
                  className="w-8 h-8 bg-background/20 backdrop-blur-sm rounded-md border border-border flex items-center justify-center hover:bg-background/30 transition-colors duration-200"
                >
                  <Inbox className="w-4 h-4" />
                </button>
                
                {/* User Profile */}
                <div className="relative">
                  <div 
                    className="flex items-center gap-2 px-2 py-1 bg-background/20 backdrop-blur-sm rounded-full border border-border cursor-pointer hover:bg-background/30 transition-colors duration-200"
                    onMouseEnter={() => setShowProfileDropdown(true)}
                    onMouseLeave={() => setShowProfileDropdown(false)}
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarImage 
                        src={userProfile.avatarUrl || undefined} 
                        alt={`${userProfile?.firstName || 'User'} ${userProfile?.lastName || ''}`.trim()}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <AvatarFallback className="bg-background/40 text-xs">
                        {userProfile?.firstName && userProfile?.lastName 
                          ? `${userProfile.firstName.charAt(0)}${userProfile.lastName.charAt(0)}`.toUpperCase()
                          : userProfile?.firstName?.charAt(0)?.toUpperCase() || userProfile?.email?.charAt(0)?.toUpperCase() || 'U'
                        }
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  {/* Profile Dropdown */}
                  {showProfileDropdown && (
                    <div 
                      className="absolute right-0 top-full mt-2 w-48 bg-card/95 backdrop-blur-sm rounded-lg border border-border shadow-lg z-40"
                      onMouseEnter={() => setShowProfileDropdown(true)}
                      onMouseLeave={() => setShowProfileDropdown(false)}
                    >
                      <div className="p-3 border-b border-border">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage 
                              src={userProfile.avatarUrl || undefined} 
                              alt={`${userProfile?.firstName || 'User'} ${userProfile?.lastName || ''}`.trim()}
                            />
                            <AvatarFallback className="bg-primary/20 text-primary text-xs">
                              {userProfile?.firstName && userProfile?.lastName 
                                ? `${userProfile.firstName.charAt(0)}${userProfile.lastName.charAt(0)}`.toUpperCase()
                                : userProfile?.firstName?.charAt(0)?.toUpperCase() || userProfile?.email?.charAt(0)?.toUpperCase() || 'U'
                              }
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {userProfile?.firstName && userProfile?.lastName 
                                ? `${userProfile.firstName} ${userProfile.lastName}`
                                : userProfile?.email || 'User'
                              }
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {userProfile?.email || ''}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="py-2">
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-foreground hover:bg-background/20 transition-colors duration-200"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Log out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Sign In Button for unauthenticated users */
              <button 
                onClick={() => window.location.href = '/?page=auth'} 
                className="flex items-center gap-2 px-4 py-2 bg-primary/20 backdrop-blur-sm rounded-lg border border-primary/30 text-primary hover:bg-primary/30 transition-colors duration-200"
              >
                <LogIn className="w-4 h-4" />
                <span className="text-sm font-medium">Sign In</span>
              </button>
            )}

            {/* Timer Control Buttons */}
            {activeTimer ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-border">
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
            ) : (
              <div className="flex items-center space-x-2 pl-2 border-l border-border">
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
            )}
          </div>
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
    </>
  );
};