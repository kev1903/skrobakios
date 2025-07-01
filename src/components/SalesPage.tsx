
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutDashboard,
  Users,
  UserCheck,
  FolderOpen,
  FileText,
  Send,
  Settings,
  Globe
} from 'lucide-react';
import { SalesDashboard } from './sales/SalesDashboard';
import { LeadsPage } from './sales/LeadsPage';
import { ClientProfilePage } from './sales/ClientProfilePage';
import { ProjectsDashboard } from './sales/ProjectsDashboard';
import { ProjectDetailPage } from './sales/ProjectDetailPage';
import { EstimationPage } from './sales/EstimationPage';
import { SubmittalsPage } from './sales/SubmittalsPage';
import { ClientPortal } from './sales/ClientPortal';
import { SalesSettingsPage } from './sales/SalesSettingsPage';

interface SalesPageProps {
  onNavigate?: (page: string) => void;
}

export const SalesPage = ({ onNavigate }: SalesPageProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales CRM</h1>
          <p className="text-gray-600 mt-1">Manage your sales pipeline and customer relationships</p>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="leads" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Leads
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Clients
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="estimates" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Estimates
          </TabsTrigger>
          <TabsTrigger value="submittals" className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            Submittals
          </TabsTrigger>
          <TabsTrigger value="portal" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Portal
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <SalesDashboard />
        </TabsContent>

        <TabsContent value="leads">
          <LeadsPage />
        </TabsContent>

        <TabsContent value="clients">
          <ClientProfilePage />
        </TabsContent>

        <TabsContent value="projects">
          <ProjectsDashboard />
        </TabsContent>

        <TabsContent value="project-detail">
          <ProjectDetailPage />
        </TabsContent>

        <TabsContent value="estimates">
          <EstimationPage />
        </TabsContent>

        <TabsContent value="submittals">
          <SubmittalsPage />
        </TabsContent>

        <TabsContent value="portal">
          <ClientPortal />
        </TabsContent>

        <TabsContent value="settings">
          <SalesSettingsPage />
        </TabsContent>
      </Tabs>
    </div>
  );
};
