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

      <div className="flex-1 ml-48 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleBackToQAQC}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to QA/QC
              </Button>
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-6 h-6 text-orange-600" />
                <h1 className="text-2xl font-bold text-foreground">Requests for Information</h1>
              </div>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New RFI
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow">
            <QAQCTable data={rfis || []} type="rfis" isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
};