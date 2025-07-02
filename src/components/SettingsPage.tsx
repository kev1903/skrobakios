import React, { useState } from 'react';
import { ArrowLeft, Settings, Shield, User, Bell, Palette, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { AdminPanel } from './admin/AdminPanel';
import { useTheme } from '@/hooks/useTheme';
import { AppearanceSettings } from './appearance/AppearanceSettings';

interface SettingsPageProps {
  onNavigate: (page: string) => void;
}

export const SettingsPage = ({ onNavigate }: SettingsPageProps) => {
  const { user, userRole, isSuperAdmin, isAdmin } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="relative backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border-b border-white/20 dark:border-slate-700/20 shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('dashboard')}
                className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 hover:bg-white/40 backdrop-blur-sm transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium">Back</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
                  Settings
                </h1>
                <p className="text-sm text-slate-500 mt-1">Manage your account and application preferences</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 backdrop-blur-sm bg-white/60">
              <TabsTrigger value="general" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">General</span>
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Account</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center space-x-2">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center space-x-2">
                <Palette className="w-4 h-4" />
                <span className="hidden sm:inline">Appearance</span>
              </TabsTrigger>
              {isSuperAdmin && (
                <TabsTrigger value="admin" className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <Card className="backdrop-blur-sm bg-white/60 border-white/30">
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Configure your general application preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Language</h4>
                      <p className="text-sm text-slate-500">Choose your preferred language</p>
                    </div>
                    <Button variant="outline" size="sm">English</Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Time Zone</h4>
                      <p className="text-sm text-slate-500">Set your local time zone</p>
                    </div>
                    <Button variant="outline" size="sm">UTC+0</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="space-y-6">
              <Card className="backdrop-blur-sm bg-white/60 border-white/30">
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    View and manage your account details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Email</h4>
                      <p className="text-sm text-slate-500">{user?.email}</p>
                    </div>
                    <Button variant="outline" size="sm">Change</Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Role</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={isSuperAdmin ? "destructive" : isAdmin ? "default" : "secondary"}>
                          {userRole}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Profile</h4>
                      <p className="text-sm text-slate-500">Update your personal information</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => onNavigate('user-edit')}>
                      Edit Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card className="backdrop-blur-sm bg-white/60 border-white/30">
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Configure how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Email Notifications</h4>
                      <p className="text-sm text-slate-500">Receive updates via email</p>
                    </div>
                    <Button variant="outline" size="sm">Enabled</Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Push Notifications</h4>
                      <p className="text-sm text-slate-500">Receive browser notifications</p>
                    </div>
                    <Button variant="outline" size="sm">Disabled</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6">
              <AppearanceSettings onNavigate={onNavigate} />
            </TabsContent>

            {isSuperAdmin && (
              <TabsContent value="admin" className="space-y-6">
                <AdminPanel onNavigate={onNavigate} />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
};
