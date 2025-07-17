import React, { useState, useEffect } from 'react';
import { Calendar, Upload, CheckCircle, Clock, AlertTriangle, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ProjectSidebar } from './ProjectSidebar';
import { Project } from '@/hooks/useProjects';
import { TraditionalGanttChart } from './TraditionalGanttChart';
import { SK25008FileUpload } from './SK25008FileUpload';
import { SK25008TaskDetails } from './SK25008TaskDetails';
interface Task {
  id: string;
  task_name: string;
  task_type: string;
  status: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  progress_percentage: number;
  description: string;
  requirements: string;
  compliance_notes: string;
  client_feedback?: string;
  design_files: any;
  company_id?: string;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
}
interface SK25008DashboardProps {
  projectId?: string;
}
export const SK25008Dashboard: React.FC<SK25008DashboardProps> = ({
  projectId = 'sk-25008'
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const {
    toast
  } = useToast();
  const navigate = useNavigate();

  // Navigation function for ProjectSidebar
  const handleNavigate = (page: string) => {
    if (page.includes('&projectId=')) {
      navigate(`/?page=${page}`);
    } else {
      navigate(`/?page=${page}&projectId=${project?.id || projectId}`);
    }
  };

  // Fetch the actual project data from database
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('projects').select('*').or(`project_id.eq.${projectId.toUpperCase()},project_id.eq.SK_25008,id.eq.${projectId}`).single();
        if (data && !error) {
          setProject(data);
          console.log('Found project:', data);
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        // Create a fallback project if not found
        setProject({
          id: projectId,
          project_id: 'SK_25008',
          name: '38 Riverview Terrace, Bulleen',
          description: 'Residential Design Project',
          status: 'running',
          priority: 'high',
          location: '38 Riverview Terrace, Bulleen',
          company_id: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    };
    fetchProject();
    fetchTasks();
  }, [projectId]);

  // Status helper functions for ProjectSidebar
  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "text-green-600";
      case "completed":
        return "text-blue-600";
      case "paused":
        return "text-yellow-600";
      case "cancelled":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };
  const getStatusText = (status: string) => {
    switch (status) {
      case "running":
        return "Active";
      case "completed":
        return "Completed";
      case "paused":
        return "Paused";
      case "cancelled":
        return "Cancelled";
      default:
        return "Active";
    }
  };
  const fetchTasks = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('sk_25008_design').select('*').order('start_date', {
        ascending: true
      });
      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load project tasks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const optimizeSchedule = async () => {
    setIsOptimizing(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('optimize-schedule', {
        body: {
          tasks,
          bufferDays: 2
        }
      });
      if (error) throw error;

      // Check if the optimization was successful
      if (data?.success === false) {
        toast({
          title: "Optimization Notice",
          description: data.error || 'AI optimization not available. Using current schedule.',
          variant: "destructive"
        });
        return;
      }
      toast({
        title: "Schedule Optimized",
        description: "AI-powered schedule optimization completed successfully"
      });

      // Here you would update the tasks with optimized schedule
      // For now, we'll just show the toast
      console.log('Optimization result:', data);
    } catch (error) {
      console.error('Error optimizing schedule:', error);
      toast({
        title: "Optimization Failed",
        description: "Could not optimize schedule. Using current timeline.",
        variant: "destructive"
      });
    } finally {
      setIsOptimizing(false);
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'delayed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };
  const getStatusBadge = (status: string) => {
    const variants = {
      complete: 'default',
      'in-progress': 'secondary',
      pending: 'outline',
      delayed: 'destructive'
    } as const;
    return <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.replace('-', ' ').toUpperCase()}
      </Badge>;
  };
  const calculateOverallProgress = () => {
    if (tasks.length === 0) return 0;
    const totalProgress = tasks.reduce((sum, task) => sum + task.progress_percentage, 0);
    return Math.round(totalProgress / tasks.length);
  };
  if (loading || !project) {
    return <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>;
  }
  return <div className="h-screen flex backdrop-blur-xl bg-black/20 border border-white/10">
      {/* Project Sidebar */}
      <ProjectSidebar project={project} onNavigate={handleNavigate} getStatusColor={getStatusColor} getStatusText={getStatusText} activeSection="dashboard" />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-48 backdrop-blur-xl bg-white/5 border-l border-white/10 overflow-hidden">
        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6">
          {/* Project Overview Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Status Card */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={getStatusColor(project.status || 'active')}>
                  {getStatusText(project.status || 'active')}
                </Badge>
              </CardContent>
            </Card>

            {/* Progress Card */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{calculateOverallProgress()}%</div>
                <p className="text-white/60">Overall completion</p>
              </CardContent>
            </Card>

            {/* Tasks Summary Card */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{tasks.length}</div>
                <p className="text-white/60">Total tasks</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button 
                onClick={() => handleNavigate('project-schedule')}
                className="h-auto p-4 flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Calendar className="h-6 w-6" />
                <span className="text-sm">View Schedule</span>
              </button>
              <button 
                onClick={() => handleNavigate('project-tasks')}
                className="h-auto p-4 flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <CheckCircle className="h-6 w-6" />
                <span className="text-sm">Manage Tasks</span>
              </button>
              <button 
                onClick={() => handleNavigate('project-activities')}
                className="h-auto p-4 flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <AlertTriangle className="h-6 w-6" />
                <span className="text-sm">Activities</span>
              </button>
              <button 
                onClick={() => handleNavigate('project-settings')}
                className="h-auto p-4 flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Upload className="h-6 w-6" />
                <span className="text-sm">Settings</span>
              </button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Task Details Modal/Panel */}
      {selectedTask && <SK25008TaskDetails task={selectedTask} onClose={() => setSelectedTask(null)} onUpdate={fetchTasks} />}
    </div>;
};