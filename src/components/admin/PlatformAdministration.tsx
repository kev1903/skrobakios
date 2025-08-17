import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Flag, Server, Building2, Shield, Activity, AlertTriangle } from "lucide-react";
import { PlatformSettingsPanel } from './PlatformSettingsPanel';
import { FeatureFlagsPanel } from './FeatureFlagsPanel';
import { SystemMonitoringPanel } from './SystemMonitoringPanel';
import { CompanyManagementPanel } from './CompanyManagementPanel';
import { SecurityOverviewPanel } from './SecurityOverviewPanel';
import { AuditLogsPanel } from './AuditLogsPanel';
import { useUserRole } from '@/hooks/useUserRole';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PlatformAdministrationProps {
  onNavigate: (page: string) => void;
}

export const PlatformAdministration: React.FC<PlatformAdministrationProps> = ({ onNavigate }) => {
  const { isSuperAdmin } = useUserRole();

  if (!isSuperAdmin()) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Access denied. Only superadmins can access platform administration.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Platform Administration</h1>
            <p className="text-muted-foreground">Comprehensive platform management and control center</p>
          </div>
        </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 glass-panel">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Flag className="h-4 w-4" />
            Features
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            Monitoring
          </TabsTrigger>
          <TabsTrigger value="companies" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Companies
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Audit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <PlatformSettingsPanel />
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <FeatureFlagsPanel />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <SystemMonitoringPanel />
        </TabsContent>

        <TabsContent value="companies" className="space-y-6">
          <CompanyManagementPanel />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <SecurityOverviewPanel />
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <AuditLogsPanel />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};