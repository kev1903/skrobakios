import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AiSuggestionsPanel } from '@/components/ai/AiSuggestionsPanel';
import { useProjects, Project } from '@/hooks/useProjects';
import { supabase } from '@/integrations/supabase/client';

export const ProjectDashboard: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { getProject } = useProjects();
  const [project, setProject] = useState<Project | null>(null);
  const [userId, setUserId] = useState<string | undefined>();

  useEffect(() => {
    const loadData = async () => {
      if (projectId) {
        const projectData = await getProject(projectId);
        setProject(projectData);
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
    };
    loadData();
  }, [projectId]);

  if (!project || !projectId) {
    return <div>Project not found</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Project Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Existing project overview content */}
          <div className="text-muted-foreground">
            Project overview content will go here
          </div>
        </div>
        
        <div>
          <AiSuggestionsPanel 
            projectId={projectId}
            companyId={project.company_id}
            userId={userId}
            compact
          />
        </div>
      </div>
    </div>
  );
};
