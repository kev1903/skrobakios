
import React from 'react';
import Home from '@/pages/Home';
import ProjectsPage from '@/pages/ProjectsPage';
import TasksPage from '@/pages/TasksPage';
import SchedulePage from '@/pages/SchedulePage';
import TimeSheetPage from '@/pages/TimeSheetPage';
import LeadsPage from '@/pages/LeadsPage';
import ProfilePage from '@/pages/ProfilePage';
import CompanySettingsPage from '@/pages/CompanySettingsPage';
import { Project } from '@/hooks/useProjects';

interface ContentRendererProps {
  currentPage: string;
  onNavigate?: (page: string) => void;
  onSelectProject?: (projectId: string) => void;
  selectedProject?: string | null;
  currentProject?: Project | null;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({ 
  currentPage,
  onNavigate,
  onSelectProject,
  selectedProject,
  currentProject
}) => {
  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return <Home />;
      case 'projects':
        return <ProjectsPage />;
      case 'tasks':
        return <TasksPage />;
      case 'schedule':
        return <SchedulePage />;
      case 'timesheet':
        return <TimeSheetPage />;
      case 'leads':
        return <LeadsPage />;
      case 'profile':
        return <ProfilePage />;
      case 'company-settings':
        return <CompanySettingsPage />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      {renderContent()}
    </div>
  );
};

export default ContentRenderer;
export { ContentRenderer };
