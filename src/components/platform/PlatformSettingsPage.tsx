import React from 'react';
import { Shield, Settings, Database, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const PlatformSettingsPage = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Shield className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Platform Settings</h1>
          <p className="text-muted-foreground">Configure platform-wide settings and policies</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Security & Access
            </CardTitle>
            <CardDescription>Manage authentication and authorization policies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Two-Factor Authentication</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                Enabled
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Password Complexity</span>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                High
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Session Timeout</span>
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">
                24 hours
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-green-600" />
              Database & Storage
            </CardTitle>
            <CardDescription>Monitor and configure data management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Database Size</span>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                2.4 GB
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Backup Status</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                Up to date
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Storage Usage</span>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                72%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600" />
              System Configuration
            </CardTitle>
            <CardDescription>Platform-wide system settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Maintenance Mode</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                Disabled
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">API Rate Limit</span>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                1000/hour
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Debug Mode</span>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                Disabled
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Performance
            </CardTitle>
            <CardDescription>System performance metrics and optimization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Response Time</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                &lt; 200ms
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Uptime</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                99.9%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Active Sessions</span>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                147
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};