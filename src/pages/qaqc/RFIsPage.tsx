import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'react-router-dom';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { useProjects, Project } from '@/hooks/useProjects';
import { QAQCTable } from '@/components/qaqc/QAQCTable';
import { useRFIs } from '@/hooks/useQAQCData';
import { Plus, ArrowLeft, HelpCircle } from 'lucide-react';

interface RFIsPageProps {
  onNavigate: (page: string) => void;
}

export const RFIsPage = ({ onNavigate }: RFIsPageProps) => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const { getProject } = useProjects();
  const [project, setProject] = useState<Project | null>(null);
  
  const { data: rfis, isLoading } = useRFIs(projectId || '');

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

  const handleBackToQAQC = () => {
    onNavigate(`project-qaqc&projectId=${projectId}`);
  };

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
      <ProjectSidebar
        project={project}
        onNavigate={onNavigate}
        getStatusColor={() => "bg-blue-100 text-blue-800"}
        getStatusText={() => "Active"}
        activeSection="qaqc"
      />

      <div className="flex-1 ml-48 h-screen overflow-y-auto bg-background">
        {/* Header Section */}
        <div className="flex-shrink-0 border-b border-border px-6 py-4 bg-white backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground font-inter">QA/QC - Requests for Information</h1>
              <p className="text-muted-foreground mt-1 text-sm font-inter">{project.name}</p>
              {project.location && (
                <p className="text-muted-foreground text-xs font-inter">{project.location}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={handleBackToQAQC}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to QA/QC
              </Button>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New RFI
              </Button>
            </div>
          </div>
        </div>
        
        <div className="p-6 min-h-full">
          <div className="w-full">
            <div className="bg-white rounded-lg shadow">
              <QAQCTable data={rfis || []} type="rfis" isLoading={isLoading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};