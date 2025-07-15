import React, { useState, useEffect } from 'react';
import { Calendar, Upload, CheckCircle, Clock, AlertTriangle, FileText, Building2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SK25008GanttChart } from './SK25008GanttChart';
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

export const SK25008Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('sk_25008_design')
        .select('*')
        .order('start_date');

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load project tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const optimizeSchedule = async () => {
    setIsOptimizing(true);
    try {
      const { data, error } = await supabase.functions.invoke('optimize-schedule', {
        body: { tasks, bufferDays: 2 }
      });

      if (error) throw error;

      // Check if the optimization was successful
      if (data?.success === false) {
        throw new Error(data.error || 'Optimization failed');
      }

      toast({
        title: "Schedule Optimized",
        description: "AI-powered schedule optimization completed successfully",
      });

      // Here you would update the tasks with optimized schedule
      // For now, we'll just show the toast
      console.log('Optimization result:', data);
    } catch (error) {
      console.error('Error optimizing schedule:', error);
      toast({
        title: "Optimization Failed",
        description: "Could not optimize schedule. Using current timeline.",
        variant: "destructive",
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

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.replace('-', ' ').toUpperCase()}
      </Badge>
    );
  };

  const calculateOverallProgress = () => {
    if (tasks.length === 0) return 0;
    const totalProgress = tasks.reduce((sum, task) => sum + task.progress_percentage, 0);
    return Math.round(totalProgress / tasks.length);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Project Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">SK_25008 - 38 Riverview Terrace, Bulleen</h1>
              <p className="text-muted-foreground">Residential Design Project</p>
            </div>
          </div>
          <Button 
            onClick={optimizeSchedule} 
            disabled={isOptimizing}
            className="bg-primary hover:bg-primary/90"
          >
            {isOptimizing ? 'Optimizing...' : 'Optimize Schedule'}
          </Button>
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{calculateOverallProgress()}%</div>
              <p className="text-sm text-muted-foreground">Overall Progress</p>
              <Progress value={calculateOverallProgress()} className="mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{tasks.filter(t => t.status === 'complete').length}</div>
              <p className="text-sm text-muted-foreground">Completed Tasks</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{tasks.filter(t => t.status === 'pending').length}</div>
              <p className="text-sm text-muted-foreground">Pending Tasks</p>
            </CardContent>
          </Card>
        </div>
      </div>


      {/* Task Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Task Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasks.map((task) => (
              <div 
                key={task.id} 
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => setSelectedTask(task)}
              >
                <div className="flex items-center space-x-4">
                  {getStatusIcon(task.status)}
                  <div>
                    <h3 className="font-medium">{task.task_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {task.duration_days} days • {new Date(task.start_date).toLocaleDateString()} - {new Date(task.end_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Progress value={task.progress_percentage} className="w-20" />
                  <span className="text-sm font-medium">{task.progress_percentage}%</span>
                  {getStatusBadge(task.status)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <SK25008FileUpload onUploadComplete={fetchTasks} />
      </div>

      {/* Gantt Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Project Timeline</CardTitle>
          <CardDescription>
            Visual timeline with critical path and dependencies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SK25008GanttChart tasks={tasks} />
        </CardContent>
      </Card>

      {/* Task Details Modal/Panel */}
      {selectedTask && (
        <SK25008TaskDetails 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)}
          onUpdate={fetchTasks}
        />
      )}
    </div>
  );
};