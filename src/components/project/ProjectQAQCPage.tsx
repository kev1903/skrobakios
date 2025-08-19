import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSearchParams } from 'react-router-dom';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { useProjects, Project } from '@/hooks/useProjects';
import { useState, useEffect } from 'react';
import { Plus, ClipboardCheck, AlertTriangle, FileText } from 'lucide-react';

interface ProjectQAQCPageProps {
  onNavigate: (page: string) => void;
}

export const ProjectQAQCPage = ({ onNavigate }: ProjectQAQCPageProps) => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const { getProject } = useProjects();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    if (projectId) {
      const fetchProject = async () => {
        try {
          const fetchedProject = await getProject(projectId);
          setProject(fetchedProject);
        } catch (error) {
          console.error('Failed to fetch project:', error);
        }
      };
      fetchProject();
    }
  }, [projectId, getProject]);

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">The requested project could not be found.</p>
          <Button onClick={() => onNavigate('projects')}>Back to Projects</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Project Sidebar */}
      <ProjectSidebar
        project={project}
        onNavigate={onNavigate}
        getStatusColor={() => "bg-blue-100 text-blue-800"}
        getStatusText={() => "Active"}
        activeSection="qaqc"
      />

      {/* Main Content */}
      <div className="flex-1 ml-48 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Quality Assurance & Control</h1>
                <p className="text-muted-foreground">Manage project quality and compliance for {project.name}</p>
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New QA/QC Item
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">RFIs</p>
                    <p className="text-2xl font-bold text-foreground">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-8 h-8 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Issues</p>
                    <p className="text-2xl font-bold text-foreground">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <ClipboardCheck className="w-8 h-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Quality Checks</p>
                    <p className="text-2xl font-bold text-foreground">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Area */}
          <Card>
            <CardHeader>
              <CardTitle>QA/QC Management</CardTitle>
              <CardDescription>
                Track and manage quality assurance items, requests for information, and compliance issues.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <ClipboardCheck className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">QA/QC Module</h3>
                <p className="text-muted-foreground mb-4">
                  Quality assurance and control features will be available here.
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Get Started
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};