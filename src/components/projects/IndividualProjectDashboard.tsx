import { useState, useEffect } from 'react';
import { useProjects, Project } from '@/hooks/useProjects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

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
      <div className="h-full animate-fade-in bg-background">
        <div className="max-w-4xl mx-auto p-8">
          <div className="space-y-6">
            {/* Project Header */}
            <div className="border-b border-border pb-6">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {project.name}
              </h1>
              {project.description && (
                <p className="text-muted-foreground text-lg">
                  {project.description}
                </p>
              )}
            </div>

            {/* Project Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Status Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className={getStatusColor(project.status || 'active')}>
                    {project.status || 'Active'}
                  </Badge>
                </CardContent>
              </Card>

              {/* Location Card */}
              {project.location && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{project.location}</p>
                  </CardContent>
                </Card>
              )}


              {/* Timeline Card */}
              {(project.start_date || project.deadline) && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {project.start_date && (
                      <div>
                        <p className="text-sm text-muted-foreground">Start Date</p>
                        <p className="font-medium">{new Date(project.start_date).toLocaleDateString()}</p>
                      </div>
                    )}
                    {project.deadline && (
                      <div>
                        <p className="text-sm text-muted-foreground">Deadline</p>
                        <p className="font-medium">{new Date(project.deadline).toLocaleDateString()}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Contract Price Card */}
              {project.contract_price && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Contract Value
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold">{project.contract_price}</p>
                  </CardContent>
                </Card>
              )}

              {/* Priority Card */}
              {project.priority && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Priority
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline">{project.priority}</Badge>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Activity className="h-6 w-6" />
                  View Tasks
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <DollarSign className="h-6 w-6" />
                  Financials
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Building2 className="h-6 w-6" />
                  Team
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Settings className="h-6 w-6" />
                  Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
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
    <div className="h-screen bg-background">
      {/* Close Project Button */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="secondary"
          onClick={() => onNavigate('projects')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Close Project
        </Button>
      </div>
      
      {/* Main Content - Full Screen */}
      <main className="h-full">
        {renderProjectContent()}
      </main>
    </div>
  );
};