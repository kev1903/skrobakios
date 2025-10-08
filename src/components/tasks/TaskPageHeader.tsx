
import { Project } from '@/hooks/useProjects';
import { ProjectPageHeader } from '@/components/project/ProjectPageHeader';
import { Badge } from '@/components/ui/badge';
import { getStatusColor, getStatusText } from './utils/taskUtils';

interface TaskPageHeaderProps {
  project: Project;
  onNavigate?: (page: string) => void;
}

export const TaskPageHeader = ({ project, onNavigate }: TaskPageHeaderProps) => {
  const handleNavigate = onNavigate || (() => window.history.back());
  
  return (
    <ProjectPageHeader 
      projectName={project.name}
      pageTitle="Project Tasks"
      onNavigate={handleNavigate}
      actions={
        <Badge variant="outline" className={`${getStatusColor(project.status)} text-xs`}>
          {getStatusText(project.status)}
        </Badge>
      }
    />
  );
};
