import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Play, ArrowLeftRight, Square, ChevronDown, Check, ChevronsUpDown, X, Menu, ClipboardList, Calendar as CalendarIcon, Inbox, User, Save, Bell, LogIn, LogOut, MessageCircle, Mic, Search, FolderOpen, Pause, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
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
import { AiChatSidebar } from '@/components/AiChatSidebar';
import { VoiceInterface } from '@/components/VoiceInterface';
import { useSkaiVoiceChat } from '@/hooks/useSkaiVoiceChat';
import { useIsMobile } from '@/hooks/use-mobile';
import { UpdateIndicator } from '@/components/UpdateIndicator';

interface MenuBarProps {
  isPublicView?: boolean;
  publicCompanyName?: string;
  publicCompanyLogo?: string;
  publicProjectName?: string;
  publicProjectCode?: string;
}

export const MenuBar = ({ 
  isPublicView = false,
  publicCompanyName,
  publicCompanyLogo,
  publicProjectName,
  publicProjectCode
}: MenuBarProps = {}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    toast
  } = useToast();
  const {
    activeTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    startTimer,
    settings,
    loading
  } = useTimeTracking();
  const {
    getProjects
  } = useProjects();
  const {
    userProfile
  } = useUser();
  const {
    unreadCount
  } = useNotifications();
  const {
    isAuthenticated,
    signOut
  } = useAuth();
  const {
    currentCompany
  } = useCompany();
  const {
    activeContext,
    setActiveContext
  } = useAppContext();
  const {
    toggleSidebar
  } = useGlobalSidebar();
const barRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Define search result types
  type ProjectResult = { id: string; name: string; project_id: string };
  type TaskResult = { id: string; task_name: string; project_name?: string };
  type SearchResults = { projects: ProjectResult[]; tasks: TaskResult[] };

  // Initialize voice chat functionality - stub implementation
  const voiceState = { 
    isConnected: false,
    isListening: false
  };
  const voiceSettings = {};
  const initializeVoiceChat = (mode?: string) => {};
  const startPushToTalk = () => {};
  const stopPushToTalk = () => {};
  const disconnectVoice = () => {};
  const [currentDuration, setCurrentDuration] = useState(0);
  const isPaused = activeTimer?.status === 'paused';

  // Timer creation form state
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [taskActivity, setTaskActivity] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [projectOpen, setProjectOpen] = useState(false);
  const [projects, setProjects] = useState<Array<{
    id: string;
    name: string;
  }>>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Header icons state
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  const [showVoiceInterface, setShowVoiceInterface] = useState(false);
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResults>({ projects: [], tasks: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [currentProject, setCurrentProject] = useState<{ id: string; name: string; project_id: string } | null>(null);
  const [projectSwitcherOpen, setProjectSwitcherOpen] = useState(false);
  const [projectSearchQuery, setProjectSearchQuery] = useState("");
  const [availableProjects, setAvailableProjects] = useState<Array<{ id: string; name: string; project_id: string }>>([]);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load available projects for project switcher
  useEffect(() => {
    const loadAvailableProjects = async () => {
      if (currentCompany) {
        try {
          const { data, error } = await supabase
            .from('projects')
            .select('id, name, project_id')
            .eq('company_id', currentCompany.id)
            .order('name');
          
          if (!error && data) {
            setAvailableProjects(data);
          }
        } catch (err) {
          console.error('Error loading projects:', err);
        }
      }
    };
    loadAvailableProjects();
  }, [currentCompany]);

  // Fetch current project from URL (supports both projectId and taskId)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const projectId = searchParams.get('projectId');
    const taskId = searchParams.get('taskId');
    const page = searchParams.get('page');
    
    if (projectId) {
      const fetchProject = async () => {
        try {
          const { data, error } = await supabase
            .from('projects')
            .select('id, name, project_id')
            .eq('id', projectId)
            .single();
          
          if (!error && data) {
            setCurrentProject(data);
          } else {
            setCurrentProject(null);
          }
        } catch (err) {
          console.error('Error fetching project:', err);
          setCurrentProject(null);
        }
      };
      fetchProject();
    } else if (taskId && page === 'task-edit') {
      // For task edit page, fetch project from task's project_id
      const fetchProjectFromTask = async () => {
        try {
          // First get the task to find its project_id
          const { data: taskData, error: taskError } = await supabase
            .from('tasks')
            .select('project_id')
            .eq('id', taskId)
            .single();
          
          if (taskError || !taskData?.project_id) {
            setCurrentProject(null);
            return;
          }
          
          // Then fetch the project details
          const { data: projectData, error: projectError } = await supabase
            .from('projects')
            .select('id, name, project_id')
            .eq('id', taskData.project_id)
            .single();
          
          if (!projectError && projectData) {
            setCurrentProject(projectData);
          } else {
            setCurrentProject(null);
          }
        } catch (err) {
          console.error('Error fetching project from task:', err);
          setCurrentProject(null);
        }
      };
      fetchProjectFromTask();
    } else {
      setCurrentProject(null);
    }
  }, [location.search]);

  // Debounced search function
  useEffect(() => {
    const searchBusinessData = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults({ projects: [], tasks: [] });
        setShowSearchResults(false);
        return;
      }

      setIsSearching(true);
      setShowSearchResults(true);

      try {
        const searchTerm = searchQuery.toLowerCase();

        // Helper to safely query and cast
        const queryProjects = async (): Promise<ProjectResult[]> => {
          // @ts-ignore - Avoiding deep type instantiation
          const result = await supabase
            .from('projects')
            .select('id, name, project_id')
            .eq('company_id', currentCompany?.id || '')
            .ilike('name', `%${searchTerm}%`)
            .limit(5);
          return (result.data || []) as ProjectResult[];
        };

        const queryTasks = async (): Promise<any[]> => {
          // @ts-ignore - Avoiding deep type instantiation
          const result = await supabase
            .from('tasks')
            .select('id, task_name, project_id')
            .eq('company_id', currentCompany?.id || '')
            .ilike('task_name', `%${searchTerm}%`)
            .limit(5);
          return (result.data || []) as any[];
        };

        const [projectsData, tasksRaw] = await Promise.all([
          queryProjects(),
          queryTasks()
        ]);

        // Get project names for tasks
        const tasksData: TaskResult[] = [];
        if (tasksRaw.length > 0) {
          const projectIds = tasksRaw.map((t: any) => t.project_id).filter(Boolean);
          let projectMap: Record<string, string> = {};
          
          if (projectIds.length > 0) {
            // @ts-ignore - Avoiding deep type instantiation
            const result = await supabase
              .from('projects')
              .select('id, name')
              .in('id', projectIds);
            
            const projectNames = (result.data || []) as any[];
            projectMap = Object.fromEntries(projectNames.map((p: any) => [p.id, p.name]));
          }

          tasksRaw.forEach((task: any) => {
            tasksData.push({
              id: task.id,
              task_name: task.task_name,
              project_name: task.project_id ? projectMap[task.project_id] : undefined
            });
          });
        }

        setSearchResults({
          projects: projectsData,
          tasks: tasksData
        });
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchBusinessData, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, currentCompany?.id]);

  // Listen for open-ai-chat event from other components
  useEffect(() => {
    const handleOpenAiChat = () => {
      setShowAiChat(true);
    };
    window.addEventListener('open-ai-chat', handleOpenAiChat);
    return () => {
      window.removeEventListener('open-ai-chat', handleOpenAiChat);
    };
  }, []);

  // Load projects
  useEffect(() => {
    const loadProjects = async () => {
      setLoadingProjects(true);
      try {
        const projectList = await getProjects();
        setProjects(projectList.map(p => ({
          id: p.id,
          name: p.name
        })));
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
    const minutes = Math.floor(seconds % 3600 / 60);
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
        variant: "destructive"
      });
      setIsFormExpanded(true); // Ensure form is visible
      return;
    }
    try {
      const projectName = selectedProject && selectedProject !== 'none' ? projects.find(p => p.id === selectedProject)?.name : undefined;
      await startTimer(taskActivity, selectedProject && selectedProject !== 'none' ? selectedProject : undefined);
      toast({
        title: "Timer Started",
        description: `Started tracking "${taskActivity}"`
      });
      setIsFormExpanded(false); // Collapse form after starting
    } catch (error) {
      console.error('Timer start error:', error);
      toast({
        title: "Error",
        description: "Failed to start timer. Please try again.",
        variant: "destructive"
      });
    }
  };
  const handleStopTimer = async () => {
    try {
      await stopTimer();
      toast({
        title: "Timer Stopped",
        description: `Time entry saved: ${formatDuration(currentDuration)}`
      });
      // Clear form after successful stop
      setTaskActivity('');
      setSelectedProject('');
      setCurrentDuration(0);
    } catch (error) {
      console.error('Timer stop error:', error);
      toast({
        title: "Error",
        description: "Failed to stop timer. Please try again.",
        variant: "destructive"
      });
    }
  };
  const handleLogout = async () => {
    try {
      await signOut(); // This will redirect to landing page automatically
      toast({
        title: "Success",
        description: "Successfully logged out"
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during logout",
        variant: "destructive"
      });
    }
  };
  const handleVoiceToggle = async () => {
    try {
      if (voiceState.isListening) {
        // Stop listening
        stopPushToTalk();
        disconnectVoice();
      } else {
        // Initialize and start listening
        await initializeVoiceChat('push-to-talk');
        startPushToTalk();
      }
    } catch (error) {
      console.error('Voice toggle error:', error);
      toast({
        title: "Voice Error",
        description: "Failed to start voice interface. Please check microphone permissions.",
        variant: "destructive"
      });
    }
  };
  const handleVoiceMessage = (message: string) => {
    // Voice message received - could be forwarded to AI chat if needed
    console.log('Voice message received:', message);
  };
  const handleVoiceEnd = () => {
    setShowAiChat(false);
    setIsVoiceSpeaking(false);
  };

  // Filter projects based on search query
  const filteredProjects = availableProjects.filter(project => 
    project.project_id.toLowerCase().includes(projectSearchQuery.toLowerCase()) ||
    project.name.toLowerCase().includes(projectSearchQuery.toLowerCase())
  );

  // Handle project switch
  const handleProjectSwitch = (project: { id: string; name: string; project_id: string }) => {
    setProjectSwitcherOpen(false);
    setProjectSearchQuery("");
    navigate(`/?page=project-detail&projectId=${project.id}`);
    toast({
      title: "Project switched",
      description: `Switched to ${project.project_id} - ${project.name}`,
    });
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
      const isDefaultCompanyName = currentCompany?.name && (currentCompany.name.includes('@') || currentCompany.name.endsWith('\'s Business') || currentCompany.name.endsWith('\'s Company'));

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

  // Keep --header-height in sync with actual bar height to prevent gaps
  React.useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const setVar = () => {
      const h = Math.ceil(el.getBoundingClientRect().height);
      document.documentElement.style.setProperty('--header-height', `${h}px`);
    };
    setVar();
    const ro = new ResizeObserver(() => setVar());
    ro.observe(el);
    window.addEventListener('resize', setVar);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', setVar);
    };
  }, [isFormExpanded, activeTimer]);

  // Always render the top bar, but show different content based on timer state
  return <>
      <div ref={barRef} className="fixed top-0 left-0 right-0 z-[11000] bg-white border-b border-border/20 shadow-sm">
        <div className="flex items-center justify-between px-6 py-2.5">
          {/* Left side - Menu and Company Logo */}
          <div className="flex items-center gap-4">
            {/* Show public company/project info in public view */}
            {isPublicView ? (
              <>
                {/* Company Logo & Name for Public View */}
                <div className="flex items-center gap-2">
                  {publicCompanyLogo ? (
                    <div className="w-9 h-9 bg-background rounded-lg overflow-hidden flex items-center justify-center">
                      <img src={publicCompanyLogo} alt={publicCompanyName || 'Company'} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 bg-foreground rounded-lg flex items-center justify-center">
                      <span className="text-background font-bold text-sm">
                        {(publicCompanyName || 'C').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <h1 className="text-base font-semibold text-foreground whitespace-nowrap">
                    {publicCompanyName || 'Company'}
                  </h1>
                </div>

                {/* Project Info for Public View */}
                {(publicProjectCode || publicProjectName) && (
                  <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-50 border border-border/30 rounded-lg ml-2">
                    <div className="flex flex-col flex-1">
                      <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                        {publicProjectCode && publicProjectName ? (
                          `${publicProjectCode} - ${publicProjectName}`
                        ) : publicProjectCode || publicProjectName}
                      </span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Redesigned Circular Hamburger Menu Button */}
                <button 
                  onClick={toggleSidebar} 
                  className="group relative w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 transition-all duration-200 flex items-center justify-center" 
                  aria-label="Toggle main navigation sidebar"
                >
                  <div className="flex flex-col gap-[3px] w-5">
                    <span className="block h-[2px] w-full bg-foreground rounded-full transition-all duration-200 group-hover:bg-primary group-hover:w-4"></span>
                    <span className="block h-[2px] w-full bg-foreground rounded-full transition-all duration-200 group-hover:bg-primary"></span>
                    <span className="block h-[2px] w-4 bg-foreground rounded-full transition-all duration-200 group-hover:bg-primary group-hover:w-full"></span>
                  </div>
                </button>
                
                {/* Company Logo & Name */}
                <div className="flex items-center gap-2">
                  <div 
                    className="w-9 h-9 bg-foreground rounded-lg flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity duration-200" 
                    onClick={() => {
                      if (activeContext === 'company') {
                        navigate('/?page=home');
                      } else {
                        navigate('/?page=profile');
                      }
                    }}
                  >
                    <span className="text-background font-bold text-sm">
                      {getCompanyDisplayText().charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h1 
                    className="text-base font-semibold text-foreground cursor-pointer hover:text-primary transition-colors whitespace-nowrap" 
                    onClick={e => {
                      e.stopPropagation();
                      if (activeContext === 'company') {
                        navigate('/?page=home');
                      } else {
                        navigate('/?page=profile');
                      }
                    }}
                  >
                    {getCompanyDisplayText()}
                  </h1>
                </div>

                {/* Project Selector - Always visible */}
                <Popover open={projectSwitcherOpen} onOpenChange={setProjectSwitcherOpen}>
                  <PopoverTrigger asChild>
                    <div className="hidden lg:flex items-center gap-2.5 px-4 py-2 bg-slate-50 border border-border/30 rounded-lg ml-2 hover:bg-slate-100 hover:shadow-sm cursor-pointer transition-all duration-200">
                      <div className="flex flex-col flex-1">
                        <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                          {currentProject ? (
                            `${currentProject.project_id} - ${currentProject.name}`
                          ) : (
                            "Select Project"
                          )}
                        </span>
                      </div>
                      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0 bg-white/95 backdrop-blur-xl border border-border/30 shadow-[0_4px_24px_rgba(0,0,0,0.08)] rounded-xl z-[12000]" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput 
                        placeholder="Search projects..." 
                        value={projectSearchQuery}
                        onValueChange={setProjectSearchQuery}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {loadingProjects ? "Loading projects..." : "No projects found."}
                        </CommandEmpty>
                        <CommandGroup>
                          {filteredProjects.map((project) => (
                            <CommandItem
                              key={project.id}
                              value={project.id}
                              onSelect={() => handleProjectSwitch(project)}
                              className="px-3 py-2 hover:bg-accent/30 rounded-md cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 text-luxury-gold",
                                  currentProject?.id === project.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <span className="text-sm">
                                {project.project_id} - {project.name}
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </>
            )}
          </div>

          {/* Center - Active Timer Display with Controls (Engraved Effect) */}
          {activeTimer && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3 hover:opacity-70 transition-opacity duration-200 cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-luxury-gold/60 rounded-full animate-pulse shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]"></div>
                    <Clock className="w-4 h-4 text-foreground/70" style={{ filter: 'drop-shadow(0 1px 0 rgba(255,255,255,0.3))' }} />
                    <span className="text-sm font-semibold text-foreground/80 tabular-nums" style={{ textShadow: '0 1px 0 rgba(255,255,255,0.3), 0 -1px 0 rgba(0,0,0,0.1)' }}>
                      {formatDuration(currentDuration)}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground/70 max-w-[200px] truncate" style={{ textShadow: '0 1px 0 rgba(255,255,255,0.3), 0 -1px 0 rgba(0,0,0,0.1)' }}>
                    {activeTimer.task_activity || 'No description'}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56 bg-background z-[12000]">
                <DropdownMenuItem onClick={handlePauseResume} className="cursor-pointer">
                  <Pause className="w-4 h-4 mr-2" />
                  {isPaused ? 'Resume Timer' : 'Pause Timer'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleStopTimer} className="cursor-pointer">
                  <Square className="w-4 h-4 mr-2" />
                  Stop Timer
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/?page=time-tracking')} className="cursor-pointer">
                  <Clock className="w-4 h-4 mr-2" />
                  Open Time Tracking
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Right side - Navigation icons and actions */}
          <div className="flex items-center gap-2">
            {/* Navigation Icons */}
            {isAuthenticated ? <>
                {/* Tasks Icon */}
                {!isMobile && (
                  <Link to="/tasks" className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors duration-200 text-foreground">
                    <ClipboardList className="w-4 h-4" />
                  </Link>
                )}
                
                {/* Update Indicator */}
                <UpdateIndicator />
                
                {/* Notifications */}
                <NotificationDropdown>
                  <NotificationBadge count={unreadCount}>
                    <button className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors duration-200 text-foreground">
                      <Bell className="w-4 h-4" />
                    </button>
                  </NotificationBadge>
                </NotificationDropdown>
                
                {/* Inbox Icon */}
                {!isMobile && (
                  <button onClick={() => navigate('/?page=inbox')} className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors duration-200 text-foreground">
                    <Inbox className="w-4 h-4" />
                  </button>
                )}
                
                {/* AI Chat Icon */}
                {!isMobile && (
                  <button onClick={() => setShowAiChat(true)} className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors duration-200 text-foreground" title="Open AI Assistant">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                )}
                
                {/* Voice Icon */}
                <button onClick={() => setShowVoiceInterface(true)} className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors duration-200 text-foreground" title="Voice Assistant">
                  <Mic className="w-4 h-4" />
                </button>
                
                {/* User Profile */}
                <div className="relative" ref={profileDropdownRef}>
                  <div className="flex items-center justify-center w-9 h-9 bg-slate-50 rounded-full cursor-pointer hover:bg-slate-100 transition-colors duration-200" onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={userProfile.avatarUrl || undefined} alt={`${userProfile?.firstName || 'User'} ${userProfile?.lastName || ''}`.trim()} onError={e => {
                    e.currentTarget.style.display = 'none';
                  }} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {userProfile?.firstName && userProfile?.lastName ? `${userProfile.firstName.charAt(0)}${userProfile.lastName.charAt(0)}`.toUpperCase() : userProfile?.firstName?.charAt(0)?.toUpperCase() || userProfile?.email?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  {/* Profile Dropdown */}
                  {showProfileDropdown && <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-border/30 shadow-lg z-40">
                      <div className="p-4 border-b border-border/20">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={userProfile.avatarUrl || undefined} alt={`${userProfile?.firstName || 'User'} ${userProfile?.lastName || ''}`.trim()} />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                              {userProfile?.firstName && userProfile?.lastName ? `${userProfile.firstName.charAt(0)}${userProfile.lastName.charAt(0)}`.toUpperCase() : userProfile?.firstName?.charAt(0)?.toUpperCase() || userProfile?.email?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {userProfile?.firstName && userProfile?.lastName ? `${userProfile.firstName} ${userProfile.lastName}` : userProfile?.email || 'User'}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {userProfile?.email || ''}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="py-1">
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-foreground hover:bg-slate-50 transition-colors duration-200">
                          <LogOut className="w-4 h-4" />
                          <span>Log out</span>
                        </button>
                      </div>
                    </div>}
                </div>

                {/* Play Dropdown - Minimal */}
                <button 
                  onClick={() => setIsFormExpanded(!isFormExpanded)} 
                  className="ml-2 pl-2 border-l border-border/30 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Play className="w-3.5 h-3.5 text-foreground" />
                  <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", isFormExpanded && "rotate-180")} />
                </button>
              </> : (
          <button onClick={() => window.location.href = '/?page=auth'} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200">
                <LogIn className="w-4 h-4" />
                <span className="text-sm font-medium">Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Expandable Timer Creation Form */}
        {isFormExpanded && !activeTimer && <div className="border-t border-border/20 bg-gradient-to-b from-white/95 to-white/98 backdrop-blur-xl">
            <div className="px-4 py-3 space-y-2.5">
              {/* Header */}
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-foreground tracking-wide uppercase">Quick Timer</span>
                <Button variant="ghost" size="sm" onClick={() => setIsFormExpanded(false)} className="h-6 w-6 p-0 hover:bg-muted/50" title="Collapse">
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* Single Row Form */}
              <div className="flex items-end gap-2">
                {/* Project Select - Compact */}
                <div className="flex-1">
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Project</label>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger className="h-9 text-sm backdrop-blur-md bg-white/80 border-border/30 hover:bg-white/90 transition-colors">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No project</SelectItem>
                      {projects.map(project => <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Task Description - Larger */}
                <div className="flex-[2]">
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Task</label>
                  <Input placeholder="What are you working on?" value={taskActivity} onChange={e => setTaskActivity(e.target.value)} className="h-9 text-sm backdrop-blur-md bg-white/80 border-border/30 hover:bg-white/90 transition-colors" onKeyDown={e => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  handleStartTimer();
                }
              }} />
                </div>

                {/* Start Button - Compact */}
                <Button onClick={handleStartTimer} disabled={!taskActivity.trim()} size="sm" className="h-9 px-4 gap-1.5 bg-luxury-gold hover:bg-luxury-gold/90 text-white font-medium shadow-md hover:shadow-lg transition-all">
                  <Play className="w-3.5 h-3.5" />
                  Start
                </Button>
              </div>

              {/* Keyboard Shortcuts Hint - More Subtle */}
              <div className="flex items-center justify-center pt-0.5">
                <div className="text-[10px] text-muted-foreground/70 font-medium">
                  <kbd className="px-1.5 py-0.5 rounded bg-muted/50 text-[9px] font-mono">Ctrl+Enter</kbd> to start
                  <span className="mx-1.5">•</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-muted/50 text-[9px] font-mono">Ctrl+Space</kbd> to toggle
                </div>
              </div>
            </div>
          </div>}
      </div>
      
      {/* AI Chat Modal */}
      <Dialog open={showAiChat} onOpenChange={setShowAiChat}>
        <DialogContent className="max-w-2xl h-[80vh] p-0 overflow-hidden">
          <DialogTitle className="sr-only">AI Assistant</DialogTitle>
          <AiChatSidebar isCollapsed={false} onToggleCollapse={() => {}} onNavigate={() => {}} fullScreen={true} />
        </DialogContent>
      </Dialog>

      {/* Voice Interface Modal with Debug Panel */}
      <Dialog open={showVoiceInterface} onOpenChange={setShowVoiceInterface}>
        <DialogContent className="max-w-lg h-[80vh] p-4 overflow-hidden">
          <DialogTitle className="sr-only">SkAi Voice Interface</DialogTitle>
          <VoiceInterface isActive={showVoiceInterface} onMessage={handleVoiceMessage} onEnd={() => setShowVoiceInterface(false)} />
        </DialogContent>
      </Dialog>
    </>;
};