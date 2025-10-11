import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Settings, Server, Building2, Shield, Activity, AlertTriangle, Users, Brain } from "lucide-react";
import { PlatformSettingsPanel } from './PlatformSettingsPanel';
import { SkAiPanel } from './SkAiPanel';

import { SystemMonitoringPanel } from './SystemMonitoringPanel';
import { CompanyManagementPanel } from './CompanyManagementPanel';
import { SecurityOverviewPanel } from './SecurityOverviewPanel';
import { UserManagementPanel } from './UserManagementPanel';
import { AuditLogsPanel } from './AuditLogsPanel';
import { useUserRole } from '@/hooks/useUserRole';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from '@/integrations/supabase/client';

interface PlatformAdministrationProps {
  onNavigate: (page: string) => void;
}

export const PlatformAdministration: React.FC<PlatformAdministrationProps> = ({ onNavigate }) => {
  const { isSuperAdmin } = useUserRole();
  const [userCount, setUserCount] = useState<number>(0);

  useEffect(() => {
    if (isSuperAdmin()) {
      fetchUserCount();
    }
  }, [isSuperAdmin]);

  const fetchUserCount = async () => {
    try {
      const { data, error } = await supabase.rpc('get_user_count');
      
      if (error) throw error;
      setUserCount(data || 0);
    } catch (error) {
      console.error('Error fetching user count:', error);
      setUserCount(0);
    }
  };

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
        <TabsList className="grid w-full grid-cols-7 bg-card border border-border rounded-lg">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            Monitoring
          </TabsTrigger>
          <TabsTrigger value="companies" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Businesses
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
            {userCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {userCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Audit
          </TabsTrigger>
          <TabsTrigger value="skai" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            SkAi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <PlatformSettingsPanel />
        </TabsContent>


        <TabsContent value="monitoring" className="space-y-6">
          <SystemMonitoringPanel />
        </TabsContent>

        <TabsContent value="companies" className="space-y-6">
          <CompanyManagementPanel />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserManagementPanel />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <SecurityOverviewPanel />
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <AuditLogsPanel />
        </TabsContent>

        <TabsContent value="skai" className="space-y-6">
          <SkAiPanel />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};