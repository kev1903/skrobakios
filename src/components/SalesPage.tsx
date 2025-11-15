
import React, { useState } from 'react';
import { SalesDashboard } from './sales/SalesDashboard';
import { LeadsPage } from './sales/LeadsPage';
import { ClientProfilePage } from './sales/ClientProfilePage';
import { ProjectsDashboard } from './sales/ProjectsDashboard';
import { ProjectDetailPage } from './sales/ProjectDetailPage';
import { EstimatesListPage } from './sales/EstimatesListPage';
import { InputDataPage } from './sales/pages/InputDataPage';
import { SubmittalsPage } from './sales/SubmittalsPage';
import { ClientPortal } from './sales/ClientPortal';
import { SalesSettingsPage } from './sales/SalesSettingsPage';
import { SalesRibbon } from './sales/SalesRibbon';
import { EstimateProvider } from './sales/context/EstimateContext';

interface SalesPageProps {
  onNavigate?: (page: string) => void;
}

export const SalesPage = ({ onNavigate }: SalesPageProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showEstimationWorkspace, setShowEstimationWorkspace] = useState(false);

  const handleBack = () => {
    if (onNavigate) {
      onNavigate('home');
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Reset estimation workspace when switching tabs
    if (tab !== 'estimates') {
      setShowEstimationWorkspace(false);
    }
  };

  const handleCreateEstimate = () => {
    setShowEstimationWorkspace(true);
  };

  const handleBackToEstimatesList = () => {
    setShowEstimationWorkspace(false);
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
        return showEstimationWorkspace 
          ? <EstimateProvider><InputDataPage onBack={handleBackToEstimatesList} /></EstimateProvider>
          : <EstimatesListPage onCreateEstimate={handleCreateEstimate} onNavigate={onNavigate} />;
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

  // Full-screen mode for estimates
  if (activeTab === 'estimates') {
    return (
      <div className="bg-background min-h-screen">
        {renderContent()}
      </div>
    );
  }

  return (
    <div className="flex w-full h-full">
      {/* Sales Ribbon - Fixed sidebar */}
      <div className="w-64 flex-shrink-0 border-r border-border h-full">
        <SalesRibbon activeTab={activeTab} onTabChange={handleTabChange} onBack={handleBack} />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
