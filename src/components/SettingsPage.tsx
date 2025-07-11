import React, { useState } from 'react';
import { ArrowLeft, Settings, User, Bell, Palette, Plug, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { useUserRole } from '@/hooks/useUserRole';
import { IntegrationsTab } from './integrations/IntegrationsTab';
import { UserManagement } from './admin/UserManagement';

interface SettingsPageProps {
  onNavigate: (page: string) => void;
}

export const SettingsPage = ({ onNavigate }: SettingsPageProps) => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { isSuperAdmin } = useUserRole();
  const [activeTab, setActiveTab] = useState('general');

  if (!user) {
    return <div>Please log in to access settings</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="relative backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border-b border-white/20 dark:border-slate-700/20 shadow-sm">
        <div className="px-4 md:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 md:space-x-6">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onNavigate('dashboard')} 
                className="flex items-center space-x-1 md:space-x-2 text-slate-600 hover:text-blue-600 hover:bg-white/40 backdrop-blur-sm transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium text-sm md:text-base">Back</span>
              </Button>
              <div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
                  Settings
                </h1>
                <p className="text-xs md:text-sm text-slate-500 mt-1">Manage your account and application preferences</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
            {/* Tab List */}
            <div className="w-full overflow-x-auto">
              <TabsList className={`flex w-full min-w-fit ${isSuperAdmin() ? 'grid-cols-6' : 'grid-cols-5'} md:grid backdrop-blur-sm bg-white/60 p-1`}>
                <TabsTrigger value="general" className="flex items-center justify-center space-x-1 md:space-x-2 px-2 md:px-3 py-2 whitespace-nowrap">
                  <Settings className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs md:text-sm">General</span>
                </TabsTrigger>
                <TabsTrigger value="account" className="flex items-center justify-center space-x-1 md:space-x-2 px-2 md:px-3 py-2 whitespace-nowrap">
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs md:text-sm">Account</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center justify-center space-x-1 md:space-x-2 px-2 md:px-3 py-2 whitespace-nowrap">
                  <Bell className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs md:text-sm">Notifications</span>
                </TabsTrigger>
                <TabsTrigger value="appearance" className="flex items-center justify-center space-x-1 md:space-x-2 px-2 md:px-3 py-2 whitespace-nowrap">
                  <Palette className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs md:text-sm">Appearance</span>
                </TabsTrigger>
                <TabsTrigger value="integrations" className="flex items-center justify-center space-x-1 md:space-x-2 px-2 md:px-3 py-2 whitespace-nowrap">
                  <Plug className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs md:text-sm">Integrations</span>
                </TabsTrigger>
                {isSuperAdmin() && (
                  <TabsTrigger value="admin" className="flex items-center justify-center space-x-1 md:space-x-2 px-2 md:px-3 py-2 whitespace-nowrap">
                    <Shield className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs md:text-sm">Admin</span>
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            <TabsContent value="general" className="space-y-4 md:space-y-6">
              <Card className="backdrop-blur-sm bg-white/60 border-white/30">
                <CardHeader className="pb-4 md:pb-6">
                  <CardTitle className="text-lg md:text-xl">General Settings</CardTitle>
                  <CardDescription className="text-sm md:text-base">
                    Configure your general application preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 md:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div>
                      <h4 className="text-sm font-medium">Language</h4>
                      <p className="text-xs md:text-sm text-slate-500">Choose your preferred language</p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">English</Button>
                  </div>
                  <Separator />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div>
                      <h4 className="text-sm font-medium">Time Zone</h4>
                      <p className="text-xs md:text-sm text-slate-500">Set your local time zone</p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">UTC+0</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="space-y-4 md:space-y-6">
              <Card className="backdrop-blur-sm bg-white/60 border-white/30">
                <CardHeader className="pb-4 md:pb-6">
                  <CardTitle className="text-lg md:text-xl">Account Information</CardTitle>
                  <CardDescription className="text-sm md:text-base">
                    View and manage your account details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 md:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div>
                      <h4 className="text-sm font-medium">User Profile</h4>
                      <p className="text-xs md:text-sm text-slate-500">Manage your personal information and security</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full sm:w-auto"
                      onClick={() => onNavigate('user-profile')}
                    >
                      Manage Profile
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div>
                      <h4 className="text-sm font-medium">Email</h4>
                      <p className="text-xs md:text-sm text-slate-500 break-all">{user?.email}</p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">Change</Button>
                  </div>
                  <Separator />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div>
                      <h4 className="text-sm font-medium">Profile</h4>
                      <p className="text-xs md:text-sm text-slate-500">Update your personal information</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => onNavigate('user-edit')} className="w-full sm:w-auto">
                      Edit Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-4 md:space-y-6">
              <IntegrationsTab />
            </TabsContent>

            {isSuperAdmin() && (
              <TabsContent value="admin" className="space-y-4 md:space-y-6">
                <Card className="backdrop-blur-sm bg-white/60 border-white/30">
                  <CardHeader className="pb-4 md:pb-6">
                    <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Admin Panel
                      <Badge variant="destructive" className="text-xs">Super Admin</Badge>
                    </CardTitle>
                    <CardDescription className="text-sm md:text-base">
                      Manage platform users, roles, and system administration
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <UserManagement />
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
};