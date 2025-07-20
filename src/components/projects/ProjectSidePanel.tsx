import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProjects } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Clock, DollarSign, Plus } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  status: string;
  deadline?: string;
  contract_price?: string;
}

interface ProjectSidePanelProps {
  onNavigate: (page: string) => void;
  onSelectProject: (project: Project) => void;
}

export const ProjectSidePanel = ({ onNavigate, onSelectProject }: ProjectSidePanelProps) => {
  const { getProjects } = useProjects();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const fetchedProjects = await getProjects();
        setProjects(fetchedProjects || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [getProjects]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'in_progress':
        return 'text-emerald-600 bg-emerald-50';
      case 'completed':
        return 'text-blue-600 bg-blue-50';
      case 'on_hold':
        return 'text-amber-600 bg-amber-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  const activeProjects = projects.filter(p => p.status?.toLowerCase() === 'active' || p.status?.toLowerCase() === 'in_progress');
  const completedProjects = projects.filter(p => p.status?.toLowerCase() === 'completed');
  const totalValue = projects.reduce((sum, project) => {
    const price = project.contract_price ? parseFloat(project.contract_price.replace(/[^0-9.]/g, '')) : 0;
    return sum + price;
  }, 0);

  return (
    <div className="w-80 h-full bg-background/95 backdrop-blur-sm border-r border-border/50 flex flex-col">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Projects</h2>
          <Button
            size="sm"
            onClick={() => onNavigate('create-project')}
            className="h-8 px-3"
          >
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Business Insights Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <BarChart3 className="h-4 w-4 text-primary" />
              Business Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 rounded-lg bg-primary/5">
                <div className="text-lg font-semibold text-primary">{projects.length}</div>
                <div className="text-xs text-muted-foreground">Total Projects</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-emerald-50">
                <div className="text-lg font-semibold text-emerald-600">{activeProjects.length}</div>
                <div className="text-xs text-muted-foreground">Active</div>
              </div>
            </div>
            
            <div className="pt-2 border-t border-border/50">
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span className="text-muted-foreground">Completion Rate:</span>
                <span className="font-medium">
                  {projects.length > 0 ? Math.round((completedProjects.length / projects.length) * 100) : 0}%
                </span>
              </div>
              
              {totalValue > 0 && (
                <div className="flex items-center gap-2 text-sm mt-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span className="text-muted-foreground">Total Value:</span>
                  <span className="font-medium">${totalValue.toLocaleString()}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Projects List Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4 text-primary" />
              Recent Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-3">No projects yet</p>
                <Button
                  size="sm"
                  onClick={() => onNavigate('create-project')}
                  variant="outline"
                >
                  Create your first project
                </Button>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {projects.slice(0, 10).map((project) => (
                  <div
                    key={project.id}
                    className="p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => onSelectProject(project)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-foreground truncate">
                          {project.name}
                        </h4>
                        {project.deadline && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Due: {new Date(project.deadline).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(project.status)}`}>
                        {project.status || 'pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};