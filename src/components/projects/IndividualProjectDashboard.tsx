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
      <div className="h-full animate-fade-in">
        <ModernProjectSchedulePage 
          project={project} 
          onNavigate={onNavigate} 
        />
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