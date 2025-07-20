import { useState, useEffect } from 'react';
import { Project } from '@/hooks/useProjects';
import { useToast } from '@/hooks/use-toast';
import { useCentralTasks } from '@/hooks/useCentralTasks';
import { useUser } from '@/contexts/UserContext';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Activity, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Clock, 
  DollarSign,
  MoreHorizontal,
  ChevronDown,
  ChevronRight 
} from 'lucide-react';
import { format } from 'date-fns';
import { SkaiActivityAssistant } from '@/components/activities/SkaiActivityAssistant';
import { BulkActivityImport } from '@/components/activities/BulkActivityImport';
import { ActivityData, buildActivityHierarchy } from '@/utils/activityUtils';
import { ActivitiesTable } from '@/components/activities/ActivitiesTable';

interface ProjectActivitiesPageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const ProjectActivitiesPage = ({ project, onNavigate }: ProjectActivitiesPageProps) => {
  const [hierarchicalActivities, setHierarchicalActivities] = useState<ActivityData[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  const [newActivity, setNewActivity] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    cost_est: '',
    parent_id: '',
    stage: '4.0 PRELIMINARY'
  });
  const { toast } = useToast();
  const { userProfile } = useUser();
  
  // Use centralized tasks hook
  const {
    tasks,
    loading,
    createTask,
    deleteTask,
    loadTasks
  } = useCentralTasks(project.id, project.company_id);

  useEffect(() => {
    if (tasks.length > 0) {
      // Convert CentralTask to ActivityData format
      const activitiesData: ActivityData[] = tasks.map(task => ({
        id: task.id,
        name: task.name,
        description: task.description,
        start_date: task.start_date,
        end_date: task.end_date,
        cost_est: task.budgeted_cost,
        cost_actual: task.actual_cost,
        parent_id: task.parent_id,
        level: task.level,
        stage: task.stage,
        is_expanded: task.is_expanded,
        project_id: task.project_id,
        company_id: task.company_id,
        created_at: task.created_at,
        updated_at: task.updated_at,
        dependencies: task.dependencies || [],
        duration: task.duration,
        sort_order: task.sort_order
      }));
      
      const hierarchy = buildActivityHierarchy(activitiesData);
      setHierarchicalActivities(hierarchy);
    } else {
      setHierarchicalActivities([]);
    }
  }, [tasks]);

  const reloadActivities = () => {
    loadTasks();
  };

  const createActivity = async () => {
    try {
      const parentLevel = newActivity.parent_id 
        ? tasks.find(a => a.id === newActivity.parent_id)?.level || 0
        : 0;

      await createTask({
        name: newActivity.name,
        description: newActivity.description || undefined,
        start_date: newActivity.start_date || undefined,
        end_date: newActivity.end_date || undefined,
        budgeted_cost: newActivity.cost_est ? parseFloat(newActivity.cost_est) : undefined,
        parent_id: newActivity.parent_id || undefined,
        level: newActivity.parent_id ? parentLevel + 1 : 0,
        stage: newActivity.stage || '4.0 PRELIMINARY'
      });

      setNewActivity({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        cost_est: '',
        parent_id: '',
        stage: '4.0 PRELIMINARY'
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating activity:', error);
    }
  };

  const toggleActivityExpansion = async (activityId: string) => {
    const activity = tasks.find(a => a.id === activityId);
    if (!activity) return;

    // This will be handled by the centralized system via updateTask
    // For now, we can trigger an update through the useCentralTasks hook
    // The expansion state will be managed locally in the UI
  };

  const handleCreateChild = (parentId: string) => {
    setNewActivity({
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      cost_est: '',
      parent_id: parentId,
      stage: '4.0 PRELIMINARY'
    });
    setIsCreateDialogOpen(true);
  };

  const deleteActivity = async (activityId: string) => {
    try {
      await deleteTask(activityId);
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "running":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      case "pending":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "running":
        return "In Progress";
      case "pending":
        return "Pending";
      default:
        return "Active";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex backdrop-blur-xl bg-black/20 border border-white/10">
      {/* Project Sidebar */}
      <ProjectSidebar 
        project={project} 
        onNavigate={onNavigate} 
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
        activeSection="activities"
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto ml-48 backdrop-blur-xl bg-white/95 border-l border-white/10 animate-fade-in">
        <div className="max-w-6xl mx-auto p-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Project Activities
                </h1>
                <p className="text-muted-foreground">
                  Manage activities for {project.name}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <SkaiActivityAssistant
                  projectId={project.id}
                  companyId={project.company_id}
                  onActivityCreated={reloadActivities}
                />
                
                <BulkActivityImport
                  projectId={project.id}
                  companyId={project.company_id}
                  onActivitiesCreated={reloadActivities}
                />
                
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Activity
                    </Button>
                  </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Activity</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Activity Name</Label>
                      <Input
                        id="name"
                        value={newActivity.name}
                        onChange={(e) => setNewActivity({...newActivity, name: e.target.value})}
                        placeholder="Enter activity name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newActivity.description}
                        onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                        placeholder="Enter activity description"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start_date">Start Date</Label>
                        <Input
                          id="start_date"
                          type="date"
                          value={newActivity.start_date}
                          onChange={(e) => setNewActivity({...newActivity, start_date: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="end_date">End Date</Label>
                        <Input
                          id="end_date"
                          type="date"
                          value={newActivity.end_date}
                          onChange={(e) => setNewActivity({...newActivity, end_date: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="parent_id">Parent Activity (Optional)</Label>
                      <Select value={newActivity.parent_id || 'none'} onValueChange={(value) => setNewActivity({...newActivity, parent_id: value === 'none' ? '' : value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select parent activity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None (Root Activity)</SelectItem>
                          {tasks.filter(a => a.level === 0).map((activity) => (
                            <SelectItem key={activity.id} value={activity.id}>
                              {activity.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="stage">Project Stage</Label>
                      <Select value={newActivity.stage} onValueChange={(value) => setNewActivity({...newActivity, stage: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project stage" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="4.0 PRELIMINARY">4.0 PRELIMINARY</SelectItem>
                          <SelectItem value="4.1 PRE-CONSTRUCTION">4.1 PRE-CONSTRUCTION</SelectItem>
                          <SelectItem value="5.1 BASE STAGE">5.1 BASE STAGE</SelectItem>
                          <SelectItem value="5.2 FRAME STAGE">5.2 FRAME STAGE</SelectItem>
                          <SelectItem value="5.3 LOCKUP STAGE">5.3 LOCKUP STAGE</SelectItem>
                          <SelectItem value="5.4 FIXING STAGE">5.4 FIXING STAGE</SelectItem>
                          <SelectItem value="5.5 FINALS">5.5 FINALS</SelectItem>
                          <SelectItem value="5.6 LANDSCAPING">5.6 LANDSCAPING</SelectItem>
                          <SelectItem value="6.0 HANDOVER & CLOSEOUT">6.0 HANDOVER & CLOSEOUT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="cost_est">Estimated Cost</Label>
                      <Input
                        id="cost_est"
                        type="number"
                        value={newActivity.cost_est}
                        onChange={(e) => setNewActivity({...newActivity, cost_est: e.target.value})}
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={createActivity} disabled={!newActivity.name}>
                        Create Activity
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              </div>
            </div>

            {/* Activities Table */}
            <ActivitiesTable
              activities={hierarchicalActivities}
              onDelete={deleteActivity}
              onToggleExpansion={toggleActivityExpansion}
              onCreateChild={handleCreateChild}
              onActivityUpdated={reloadActivities}
            />
          </div>
        </div>
      </div>
    </div>
  );
};