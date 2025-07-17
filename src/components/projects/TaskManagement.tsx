import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  Flag,
  Filter,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Users,
  Paperclip,
  MessageSquare,
  BarChart3,
  List
} from 'lucide-react';
import { useCompany } from '@/contexts/CompanyContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';


import { addDays, format } from 'date-fns';
import { SkaiTaskAssistant } from '@/components/tasks/SkaiTaskAssistant';

interface TaskManagementProps {
  onNavigate: (page: string) => void;
  projectId?: string;
}

interface Task {
  id: string;
  task_name: string;
  description: string;
  status: string;
  priority: string;
  progress: number;
  assigned_to_name: string;
  assigned_to_avatar: string;
  due_date: string;
  category: string;
  project_id: string;
  
  created_at: string;
  updated_at: string;
}

interface Project {
  id: string;
  name: string;
  project_id: string;
}

export const TaskManagement = ({ onNavigate, projectId }: TaskManagementProps) => {
  const { currentCompany } = useCompany();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>(projectId || '');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'gantt'>('list');
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  
  const [newTask, setNewTask] = useState({
    task_name: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assigned_to_name: '',
    due_date: '',
    category: 'development',
  });

  useEffect(() => {
    if (currentCompany) {
      loadData();
    }
  }, [currentCompany, selectedProject]);

  const loadData = async () => {
    if (!currentCompany?.id) return;
    
    setLoading(true);
    try {
      // Load projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('id, name, project_id')
        .eq('company_id', currentCompany.id)
        .order('name');

      if (projectsData) {
        setProjects(projectsData);
        if (!selectedProject && projectsData.length > 0) {
          setSelectedProject(projectsData[0].id);
        }
      }

      // Load tasks
      let tasksQuery = supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedProject) {
        tasksQuery = tasksQuery.eq('project_id', selectedProject);
      }

      const { data: tasksData, error } = await tasksQuery;

      if (error) throw error;
      setTasks(tasksData || []);

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load task data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    if (!selectedProject || !newTask.task_name.trim()) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          ...newTask,
          project_id: selectedProject,
          progress: 0
        }])
        .select()
        .single();

      if (error) throw error;

      setTasks(prev => [data, ...prev]);
      setShowCreateDialog(false);
      setNewTask({
        task_name: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        assigned_to_name: '',
        due_date: '',
        category: 'development',
        
      });

      toast({
        title: "Success",
        description: "Task created successfully"
      });

    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive"
      });
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status,
          progress: status === 'completed' ? 100 : status === 'in-progress' ? 50 : 0
        })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, status, progress: status === 'completed' ? 100 : status === 'in-progress' ? 50 : 0 }
          : task
      ));

      toast({
        title: "Success",
        description: "Task status updated"
      });

    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      });
    }
  };

  const updateTaskField = async (taskId: string, field: string, value: string) => {
    try {
      const updateData: any = { [field]: value };
      
      // Update progress based on status if field is status
      if (field === 'status') {
        updateData.progress = value === 'completed' ? 100 : value === 'in-progress' ? 50 : 0;
      }

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, ...updateData }
          : task
      ));

      setEditingTask(null);
      setEditingField(null);
      setTempValue('');

      toast({
        title: "Success",
        description: `Task ${field.replace('_', ' ')} updated`
      });

    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: `Failed to update task ${field.replace('_', ' ')}`,
        variant: "destructive"
      });
    }
  };

  const startEditing = (taskId: string, field: string, currentValue: string) => {
    setEditingTask(taskId);
    setEditingField(field);
    setTempValue(currentValue || '');
  };

  const cancelEditing = () => {
    setEditingTask(null);
    setEditingField(null);
    setTempValue('');
  };

  const saveEdit = () => {
    if (editingTask && editingField) {
      updateTaskField(editingTask, editingField, tempValue);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.filter(task => task.id !== taskId));

      toast({
        title: "Success",
        description: "Task deleted successfully"
      });

    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white';
      case 'in-progress': return 'bg-blue-500 text-white';
      case 'todo': return 'bg-gray-500 text-white';
      case 'on-hold': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesSearch = task.task_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    todo: tasks.filter(t => t.status === 'todo').length
  };


  // Calculate project timeline
  const projectStartDate = new Date(Math.min(...tasks.map(t => new Date(t.created_at).getTime())));
  const projectEndDate = addDays(projectStartDate, 90); // 3 months default

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Task Management</h1>
          <p className="text-muted-foreground">
            Organize and track project tasks efficiently
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {selectedProject && (
            <SkaiTaskAssistant 
              projectId={selectedProject} 
              onTaskCreated={loadData}
            />
          )}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>New Task</span>
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Task Name</label>
                <Input
                  value={newTask.task_name}
                  onChange={(e) => setNewTask(prev => ({ ...prev, task_name: e.target.value }))}
                  placeholder="Enter task name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Task description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={newTask.priority} onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select value={newTask.category} onValueChange={(value) => setNewTask(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="testing">Testing</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Assigned To</label>
                <Input
                  value={newTask.assigned_to_name}
                  onChange={(e) => setNewTask(prev => ({ ...prev, assigned_to_name: e.target.value }))}
                  placeholder="Assignee name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Due Date</label>
                <Input
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                />
              </div>
              <Button onClick={createTask} className="w-full">
                Create Task
              </Button>
            </div>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Project Selector and View Toggle */}
      <div className="flex items-center justify-between">
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2 bg-muted rounded-lg p-1">
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="flex items-center space-x-2"
          >
            <List className="h-4 w-4" />
            <span>List</span>
          </Button>
          <Button
            variant={viewMode === 'gantt' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('gantt')}
            className="flex items-center space-x-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Gantt</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                <p className="text-3xl font-bold">{taskStats.total}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-green-600">{taskStats.completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-3xl font-bold text-blue-600">{taskStats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">To Do</p>
                <p className="text-3xl font-bold text-gray-600">{taskStats.todo}</p>
              </div>
              <Clock className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters - Only show in list view */}
      {viewMode === 'list' && (
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Content based on view mode */}
      {viewMode === 'gantt' ? (
        // Gantt Chart View
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Schedule functionality has been removed
        </div>
      ) : (
        // Tasks List View
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="glass-card hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {editingTask === task.id && editingField === 'task_name' ? (
                      <div className="flex items-center space-x-2">
                        <Input
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit();
                            if (e.key === 'Escape') cancelEditing();
                          }}
                          className="text-lg font-semibold"
                          autoFocus
                        />
                        <Button size="sm" onClick={saveEdit}>Save</Button>
                        <Button size="sm" variant="ghost" onClick={cancelEditing}>Cancel</Button>
                      </div>
                    ) : (
                      <h3 
                        className="text-lg font-semibold cursor-pointer hover:bg-muted/50 px-2 py-1 rounded transition-colors"
                        onClick={() => startEditing(task.id, 'task_name', task.task_name)}
                        title="Click to edit task name"
                      >
                        {task.task_name}
                      </h3>
                    )}
                    <Badge className={getStatusColor(task.status)}>
                      {task.status.replace('-', ' ')}
                    </Badge>
                    <Badge variant="outline" className={getPriorityColor(task.priority)}>
                      <Flag className="h-3 w-3 mr-1" />
                      {task.priority}
                    </Badge>
                  </div>
                  
                  {editingTask === task.id && editingField === 'description' ? (
                    <div className="mb-4">
                      <Textarea
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.ctrlKey) saveEdit();
                          if (e.key === 'Escape') cancelEditing();
                        }}
                        className="mb-2"
                        rows={3}
                        autoFocus
                      />
                      <div className="flex items-center space-x-2">
                        <Button size="sm" onClick={saveEdit}>Save</Button>
                        <Button size="sm" variant="ghost" onClick={cancelEditing}>Cancel</Button>
                        <span className="text-xs text-muted-foreground">Ctrl+Enter to save</span>
                      </div>
                    </div>
                  ) : (
                    <p 
                      className="text-muted-foreground mb-4 cursor-pointer hover:bg-muted/50 px-2 py-1 rounded transition-colors min-h-[1.5rem]"
                      onClick={() => startEditing(task.id, 'description', task.description)}
                      title="Click to edit description"
                    >
                      {task.description || 'Click to add description...'}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-6 mb-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {editingTask === task.id && editingField === 'assigned_to_name' ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit();
                              if (e.key === 'Escape') cancelEditing();
                            }}
                            placeholder="Assignee name"
                            className="w-32"
                            autoFocus
                          />
                          <Button size="sm" onClick={saveEdit}>Save</Button>
                          <Button size="sm" variant="ghost" onClick={cancelEditing}>Cancel</Button>
                        </div>
                      ) : (
                        <span 
                          className="text-sm cursor-pointer hover:bg-muted/50 px-2 py-1 rounded transition-colors"
                          onClick={() => startEditing(task.id, 'assigned_to_name', task.assigned_to_name)}
                          title="Click to edit assignee"
                        >
                          {task.assigned_to_name || 'Unassigned'}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {editingTask === task.id && editingField === 'due_date' ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="date"
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit();
                              if (e.key === 'Escape') cancelEditing();
                            }}
                            className="w-40"
                            autoFocus
                          />
                          <Button size="sm" onClick={saveEdit}>Save</Button>
                          <Button size="sm" variant="ghost" onClick={cancelEditing}>Cancel</Button>
                        </div>
                      ) : (
                        <span 
                          className="text-sm cursor-pointer hover:bg-muted/50 px-2 py-1 rounded transition-colors"
                          onClick={() => startEditing(task.id, 'due_date', task.due_date)}
                          title="Click to edit due date"
                        >
                          {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                        </span>
                      )}
                    </div>
                    

                    <div className="flex items-center space-x-2">
                      <Flag className="h-4 w-4 text-muted-foreground" />
                      <Select value={task.priority} onValueChange={(value) => updateTaskField(task.id, 'priority', value)}>
                        <SelectTrigger className="w-24 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-muted-foreground">{task.progress}%</span>
                    </div>
                    <Progress value={task.progress} className="h-2" />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Select value={task.status} onValueChange={(value) => updateTaskStatus(task.id, value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => deleteTask(task.id)}
                    className="text-destructive hover:text-destructive"
                    title="Delete task"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredTasks.length === 0 && (
          <Card className="glass-card">
            <CardContent className="text-center py-12">
              <CheckCircle2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No tasks found</h3>
              <p className="text-muted-foreground mb-6">
                {filterStatus === 'all' 
                  ? "Create your first task to get started" 
                  : `No tasks with status "${filterStatus}"`
                }
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </CardContent>
          </Card>
        )}
        </div>
      )}
    </div>
  );
};