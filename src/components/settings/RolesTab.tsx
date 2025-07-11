import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Shield, User, Eye, Settings } from 'lucide-react';

interface RoleConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  enabled: boolean;
  level: 'low' | 'medium' | 'high';
}

export const RolesTab = () => {
  const [roles, setRoles] = useState<RoleConfig[]>([
    {
      id: 'user',
      name: 'User',
      description: 'Basic user permissions for accessing standard features',
      icon: User,
      enabled: true,
      level: 'low'
    },
    {
      id: 'admin',
      name: 'Admin',
      description: 'Administrative access to manage users and system settings',
      icon: Settings,
      enabled: false,
      level: 'medium'
    },
    {
      id: 'superadmin',
      name: 'Super Admin',
      description: 'Full system access with all administrative privileges',
      icon: Shield,
      enabled: false,
      level: 'high'
    },
    {
      id: 'viewer',
      name: 'Viewer',
      description: 'Read-only access to view content without modification rights',
      icon: Eye,
      enabled: false,
      level: 'low'
    }
  ]);

  const toggleRole = (roleId: string) => {
    setRoles(prev => prev.map(role => 
      role.id === roleId 
        ? { ...role, enabled: !role.enabled }
        : role
    ));
  };

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case 'low': return 'secondary';
      case 'medium': return 'default';
      case 'high': return 'destructive';
      default: return 'secondary';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'low': return 'Basic';
      case 'medium': return 'Elevated';
      case 'high': return 'Critical';
      default: return 'Basic';
    }
  };

  return (
    <Card className="backdrop-blur-sm bg-white/60 border-white/30">
      <CardHeader className="pb-4 md:pb-6">
        <CardTitle className="text-lg md:text-xl flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Role Management
        </CardTitle>
        <CardDescription className="text-sm md:text-base">
          Configure role permissions and access levels for the platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {roles.map((role, index) => (
          <div key={role.id}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 p-4 rounded-lg bg-white/30 backdrop-blur-sm border border-white/20">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 p-2 rounded-md bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <role.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {role.name}
                    </h4>
                    <Badge 
                      variant={getLevelBadgeVariant(role.level)}
                      className="text-xs px-2 py-0.5"
                    >
                      {getLevelText(role.level)}
                    </Badge>
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {role.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {role.enabled ? 'Enabled' : 'Disabled'}
                  </p>
                  <div className={`w-2 h-2 rounded-full ${
                    role.enabled ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                </div>
                <Switch
                  checked={role.enabled}
                  onCheckedChange={() => toggleRole(role.id)}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>
            </div>
            {index < roles.length - 1 && <Separator className="my-4" />}
          </div>
        ))}
        
        <div className="mt-6 p-4 rounded-lg bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-700/50">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                Security Notice
              </h5>
              <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                Changes to role permissions will affect user access across the platform. 
                Only enable roles that are necessary for your organization's security requirements.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};