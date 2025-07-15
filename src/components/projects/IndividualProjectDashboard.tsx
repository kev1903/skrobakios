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
      <div className="animate-fade-in">
        {/* Project Schedule */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <ModernProjectSchedulePage 
            project={project} 
            onNavigate={onNavigate} 
          />
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