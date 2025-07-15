import { useState, useEffect } from 'react';
import { useProjects, Project } from '@/hooks/useProjects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ModernProjectSchedulePage } from '@/components/ModernProjectSchedulePage';
import {
  Clock,
  DollarSign,
  MapPin,
  Building2,
  Activity,
  ArrowLeft,
  Settings,
} from 'lucide-react';

interface IndividualProjectDashboardProps {
  projectId: string;
  onNavigate: (page: string) => void;
}

export const IndividualProjectDashboard = ({ projectId, onNavigate }: IndividualProjectDashboardProps) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const { getProject } = useProjects();

  useEffect(() => {
    const loadProject = async () => {
      if (projectId) {
        setLoading(true);
        try {
          const projectData = await getProject(projectId);
          setProject(projectData);
        } catch (error) {
          console.error('Error loading project:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadProject();
  }, [projectId, getProject]);

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

  const renderProjectContent = () => {
    if (!project) return null;

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Project Header */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{project.name}</h1>
              <p className="text-muted-foreground mb-4">{project.description}</p>
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{project.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>#{project.project_id}</span>
                </div>
              </div>
            </div>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Progress</p>
                  <p className="text-2xl font-bold">75%</p>
                </div>
                <Activity className="h-8 w-8 text-primary" />
              </div>
              <Progress value={75} className="mt-4" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Budget</p>
                  <p className="text-2xl font-bold">{project.contract_price || 'N/A'}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Timeline</p>
                  <p className="text-2xl font-bold">
                    {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Schedule */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <ModernProjectSchedulePage 
            project={project} 
            onNavigate={onNavigate} 
          />
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Project created</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Status updated to {project.status}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(project.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 left-0 right-0 h-12 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="flex items-center space-x-4 px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate("projects")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Projects</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {renderProjectContent()}
      </main>
    </div>
  );
};