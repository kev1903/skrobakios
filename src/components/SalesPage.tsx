
import React, { useState } from 'react';
import { SalesDashboard } from './sales/SalesDashboard';
import { LeadsPage } from './sales/LeadsPage';
import { ClientProfilePage } from './sales/ClientProfilePage';
import { ProjectsDashboard } from './sales/ProjectsDashboard';
import { ProjectDetailPage } from './sales/ProjectDetailPage';
import { EstimationPage } from './sales/EstimationPage';
import { SubmittalsPage } from './sales/SubmittalsPage';
import { ClientPortal } from './sales/ClientPortal';
import { SalesSettingsPage } from './sales/SalesSettingsPage';
import { SalesRibbon } from './sales/SalesRibbon';

interface SalesPageProps {
  onNavigate?: (page: string) => void;
}

export const SalesPage = ({ onNavigate }: SalesPageProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleBack = () => {
    if (onNavigate) {
      onNavigate('dashboard');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <SalesDashboard />;
      case 'leads':
        return <LeadsPage />;
      case 'clients':
        return <ClientProfilePage />;
      case 'projects':
        return <ProjectsDashboard />;
      case 'project-detail':
        return <ProjectDetailPage />;
      case 'estimates':
        return <EstimationPage />;
      case 'submittals':
        return <SubmittalsPage />;
      case 'portal':
        return <ClientPortal />;
      case 'settings':
        return <SalesSettingsPage />;
      default:
        return <SalesDashboard />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sales Ribbon - Always visible */}
      <SalesRibbon activeTab={activeTab} onTabChange={setActiveTab} onBack={handleBack} />
      
      {/* Main Content Area - Properly offset to account for wider ribbon */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden ml-64">
        {/* Header */}
        <div className="glass-light border-b border-white/20 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Sales CRM</h1>
              <p className="text-muted-foreground mt-1">Manage your sales pipeline and customer relationships</p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};
