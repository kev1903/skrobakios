import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Server, Activity, Clock, AlertCircle, CheckCircle, Plus } from "lucide-react";
import { usePlatformSettings } from '@/hooks/usePlatformSettings';

export const SystemMonitoringPanel: React.FC = () => {
  const { maintenanceWindows, loading } = usePlatformSettings();

  // Mock system metrics for demonstration
  const systemMetrics = {
    uptime: '99.9%',
    responseTime: '245ms',
    activeUsers: 1247,
    totalRequests: 45892,
    errorRate: '0.12%',
    serverLoad: 45
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'secondary';
      case 'in_progress': return 'destructive';
      case 'completed': return 'default';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            System Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading system data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            System Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Uptime</p>
              <p className="text-2xl font-bold text-primary">{systemMetrics.uptime}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Response Time</p>
              <p className="text-2xl font-bold">{systemMetrics.responseTime}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Active Users</p>
              <p className="text-2xl font-bold">{systemMetrics.activeUsers.toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
              <p className="text-2xl font-bold">{systemMetrics.totalRequests.toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Error Rate</p>
              <p className="text-2xl font-bold text-destructive">{systemMetrics.errorRate}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Server Load</p>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{systemMetrics.serverLoad}%</p>
                <Progress value={systemMetrics.serverLoad} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Windows */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Maintenance Windows
            </CardTitle>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Maintenance
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {maintenanceWindows.map((window) => (
              <div key={window.id} className="border border-border/40 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{window.title}</h3>
                    <Badge variant={getStatusColor(window.status)}>
                      {window.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {window.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : window.status === 'in_progress' ? (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
                
                {window.description && (
                  <p className="text-sm text-muted-foreground mb-3">{window.description}</p>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Scheduled Start</p>
                    <p className="text-muted-foreground">
                      {new Date(window.scheduled_start).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Scheduled End</p>
                    <p className="text-muted-foreground">
                      {new Date(window.scheduled_end).toLocaleString()}
                    </p>
                  </div>
                </div>

                {Array.isArray(window.affected_services) && window.affected_services.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-2">Affected Services</p>
                    <div className="flex flex-wrap gap-1">
                      {window.affected_services.map((service, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {maintenanceWindows.length === 0 && (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Maintenance Scheduled</h3>
                <p className="text-muted-foreground">System is running normally with no scheduled maintenance.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};