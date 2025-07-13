
import React, { useState } from 'react';
import { SalesDashboard } from './sales/SalesDashboard';
import { LeadsPage } from './sales/LeadsPage';
import { ClientProfilePage } from './sales/ClientProfilePage';
import { ProjectsDashboard } from './sales/ProjectsDashboard';
import { ProjectDetailPage } from './sales/ProjectDetailPage';
import { EstimatesListPage } from './sales/EstimatesListPage';
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
          ? <EstimationPage onBack={handleBackToEstimatesList} />
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
      <div className="min-h-screen bg-background">
        {renderContent()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.15)_1px,transparent_0)] bg-[length:24px_24px] pointer-events-none" />
      
      <div className="relative z-10 flex min-h-screen">
        {/* Sales Ribbon - Fixed sidebar */}
        <div className="fixed left-0 top-0 h-screen z-50">
          <SalesRibbon activeTab={activeTab} onTabChange={handleTabChange} onBack={handleBack} />
        </div>
        
        {/* Main Content Area - Offset by sidebar width */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden ml-64">
          {/* Header */}
          <div className="glass-light border-b border-white/30 px-6 py-6 flex-shrink-0 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground font-poppins">Sales CRM</h1>
                <p className="text-muted-foreground mt-1 font-inter">Manage your sales pipeline and customer relationships</p>
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
    </div>
  );
};
