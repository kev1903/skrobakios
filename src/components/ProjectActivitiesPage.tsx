import { useState, useEffect } from 'react';
import { Project } from '@/hooks/useProjects';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
  MoreHorizontal 
} from 'lucide-react';
import { format } from 'date-fns';

interface ProjectActivitiesPageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

interface ActivityData {
  id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  cost_est: number | null;
  cost_actual: number | null;
  created_at: string;
  updated_at: string;
}

export const ProjectActivitiesPage = ({ project, onNavigate }: ProjectActivitiesPageProps) => {
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    cost_est: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadActivities();
  }, [project.id]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('project_id', project.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error loading activities:', error);
      toast({
        title: "Error",
        description: "Failed to load activities",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createActivity = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .insert({
          name: newActivity.name,
          description: newActivity.description || null,
          project_id: project.id,
          company_id: project.company_id,
          start_date: newActivity.start_date || null,
          end_date: newActivity.end_date || null,
          cost_est: newActivity.cost_est ? parseFloat(newActivity.cost_est) : null
        })
        .select()
        .single();

      if (error) throw error;

      setActivities(prev => [data, ...prev]);
      setNewActivity({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        cost_est: ''
      });
      setIsCreateDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Activity created successfully"
      });
    } catch (error) {
      console.error('Error creating activity:', error);
      toast({
        title: "Error",
        description: "Failed to create activity",
        variant: "destructive"
      });
    }
  };

  const deleteActivity = async (activityId: string) => {
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', activityId);

      if (error) throw error;

      setActivities(prev => prev.filter(activity => activity.id !== activityId));
      
      toast({
        title: "Success",
        description: "Activity deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast({
        title: "Error",
        description: "Failed to delete activity",
        variant: "destructive"
      });
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

            {/* Activities List */}
            <div className="space-y-4">
              {activities.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Activities Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first activity to get started.
                    </p>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Activity
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                activities.map((activity) => (
                  <Card key={activity.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">{activity.name}</h3>
                          {activity.description && (
                            <p className="text-muted-foreground mb-4">{activity.description}</p>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {activity.start_date && (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  Start: {format(new Date(activity.start_date), 'MMM dd, yyyy')}
                                </span>
                              </div>
                            )}
                            {activity.end_date && (
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  End: {format(new Date(activity.end_date), 'MMM dd, yyyy')}
                                </span>
                              </div>
                            )}
                            {activity.cost_est && (
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  Estimated: ${activity.cost_est.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteActivity(activity.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};