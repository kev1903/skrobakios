import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  CalendarDays,
  Clock,
  DollarSign,
  Users,
  Building2,
  MapPin,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Play,
  Pause,
  MoreHorizontal,
  Settings,
  Upload,
  Eye,
  Box
} from 'lucide-react';
import { useCompany } from '@/contexts/CompanyContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProjectDashboardProps {
  onNavigate: (page: string) => void;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  start_date: string;
  deadline: string;
  contract_price: string;
  location: string;
  project_type: string;
  company_id: string;
  is_public: boolean;
  bim_model_url?: string;
  iot_status: any;
  digital_twin_events: any;
  created_at: string;
  updated_at: string;
}

interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: number;
  averageProgress: number;
}

export const ProjectDashboard = ({ onNavigate }: ProjectDashboardProps) => {
  const { currentCompany } = useCompany();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<ProjectStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalBudget: 0,
    averageProgress: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentCompany) {
      loadProjectData();
    }
  }, [currentCompany]);

  const loadProjectData = async () => {
    if (!currentCompany?.id) return;
    
    setLoading(true);
    try {
      const { data: projectsData, error } = await supabase
        .from('projects')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const projects = projectsData || [];
      setProjects(projects);

      // Calculate stats
      const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'pending').length;
      const completedProjects = projects.filter(p => p.status === 'completed').length;
      const totalBudget = projects.reduce((sum, p) => sum + (parseFloat(p.contract_price) || 0), 0);

      setStats({
        totalProjects: projects.length,
        activeProjects,
        completedProjects,
        totalBudget,
        averageProgress: projects.length > 0 ? Math.round((completedProjects / projects.length) * 100) : 0
      });

    } catch (error) {
      console.error('Error loading project data:', error);
      toast({
        title: "Error",
        description: "Failed to load project data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'on-hold': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

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
          <h1 className="text-3xl font-bold">Project Management</h1>
          <p className="text-muted-foreground">
            Manage your construction projects with digital twin integration
          </p>
        </div>
        <Button onClick={() => onNavigate('create-project')} className="flex items-center space-x-2">
          <Building2 className="h-4 w-4" />
          <span>New Project</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                <p className="text-3xl font-bold">{stats.totalProjects}</p>
              </div>
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                <p className="text-3xl font-bold text-green-600">{stats.activeProjects}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
                <p className="text-3xl font-bold">{formatCurrency(stats.totalBudget)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-3xl font-bold">{stats.averageProgress}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="digital-twin">Digital Twin</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Projects */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>Recent Projects</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {projects.slice(0, 5).map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(project.status)}`} />
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-muted-foreground">{project.location}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={getPriorityColor(project.priority)}>
                      {project.priority}
                    </Badge>
                  </div>
                ))}
                {projects.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No projects found. Create your first project to get started.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Project Status Overview */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Project Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Active</span>
                    <span className="text-sm text-muted-foreground">{stats.activeProjects}</span>
                  </div>
                  <Progress value={(stats.activeProjects / Math.max(stats.totalProjects, 1)) * 100} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Completed</span>
                    <span className="text-sm text-muted-foreground">{stats.completedProjects}</span>
                  </div>
                  <Progress value={(stats.completedProjects / Math.max(stats.totalProjects, 1)) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          <div className="grid gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="glass-card">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold">{project.name}</h3>
                        <Badge variant="outline" className={getStatusColor(project.status) + ' text-white'}>
                          {project.status}
                        </Badge>
                        {project.bim_model_url && (
                          <Badge variant="secondary" className="flex items-center space-x-1">
                            <Box className="h-3 w-3" />
                            <span>BIM Model</span>
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-4">{project.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{project.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{project.contract_price}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{new Date(project.deadline).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{project.project_type}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Digital Twin Tab */}
        <TabsContent value="digital-twin" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Box className="h-5 w-5" />
                <span>Digital Twin Integration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-12">
              <Box className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Digital Twin Coming Soon</h3>
              <p className="text-muted-foreground mb-6">
                Real-time 3D visualization and IoT monitoring for your construction projects
              </p>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Upload BIM Model
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Project Analytics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-12">
              <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Analytics Dashboard</h3>
              <p className="text-muted-foreground mb-6">
                Comprehensive insights and reporting for your projects
              </p>
              <Button variant="outline">View Detailed Analytics</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};