import React from 'react';
import { ProjectList } from '@/components/ProjectList';
import { TaskManagement } from '@/components/TaskManagement';
import { FinancePage } from '@/components/FinancePage';
import { SalesPage } from '@/components/SalesPage';
import { Mapbox3DEnvironment } from '@/components/Mapbox3DEnvironment';
import { SettingsPage } from '@/components/SettingsPage';
import { SupportPage } from '@/components/SupportPage';
import { NotificationsPage } from '@/components/NotificationsPage';

interface SidePageOverlayProps {
  isRibbonOpen: boolean;
  sidePageContent: string | null;
  onNavigate: (page: string) => void;
  onSelectProject?: (projectId: string) => void;
  onCloseSidePage: () => void;
}

export const SidePageOverlay = ({
  isRibbonOpen,
  sidePageContent,
  onNavigate,
  onSelectProject,
  onCloseSidePage
}: SidePageOverlayProps) => {
  const renderSidePageContent = () => {
    switch (sidePageContent) {
      case 'projects':
        return <ProjectList onNavigate={onNavigate} onSelectProject={onSelectProject} />;
      case 'tasks':
        return <TaskManagement onNavigate={onNavigate} />;
      case 'finance':
        return <FinancePage onNavigate={onNavigate} />;
      case 'sales':
        return <SalesPage onNavigate={onNavigate} />;
      case 'bim':
        return <Mapbox3DEnvironment onNavigate={onNavigate} />;
      case 'settings':
        return <SettingsPage onNavigate={onNavigate} />;
      case 'support':
        return <SupportPage />;
      case 'notifications':
        return <NotificationsPage onNavigate={onNavigate} />;
      default:
        return null;
    }
  };

  if (!isRibbonOpen || !sidePageContent) return null;

  return (
    <div className="fixed left-48 top-0 right-0 h-full z-30 bg-white/5 backdrop-blur-sm">
      <div className="h-full overflow-hidden relative">
        {/* Close button for side content */}
        <button
          onClick={onCloseSidePage}
          className="absolute top-4 right-4 z-50 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
        >
          <span className="text-white text-lg">×</span>
        </button>
        {renderSidePageContent()}
      </div>
    </div>
  );
};