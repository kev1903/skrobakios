import React, { useState } from 'react';
import { ArrowLeft, User, CreditCard, Shield, Settings, Users, Bell, FileText, Plug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PermissionManager } from '@/components/permissions/PermissionManager';

interface BusinessSettingsPageProps {
  onNavigate: (page: string) => void;
}

export const BusinessSettingsPage = ({ onNavigate }: BusinessSettingsPageProps) => {
  const [activeSection, setActiveSection] = useState('my-info');

  const navigationItems = [
    { id: 'my-info', label: 'My info', icon: User },
    { id: 'billing-payments', label: 'Billing & Payments', icon: CreditCard },
    { id: 'password-security', label: 'Password & Security', icon: Shield },
    { id: 'membership-settings', label: 'Membership Settings', icon: Settings },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'notification-settings', label: 'Notification Settings', icon: Bell },
    { id: 'members-permissions', label: 'Members & Permissions', icon: Users },
    { id: 'tax-information', label: 'Tax Information', icon: FileText },
    { id: 'connected-services', label: 'Connected Services', icon: Plug },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'my-info':
        return (
          <Card className="backdrop-blur-sm bg-white/60 border-white/30">
            <CardHeader>
              <CardTitle>My Info</CardTitle>
              <CardDescription>Manage your personal information and profile settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">First Name</label>
                  <input className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Last Name</label>
                  <input className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        );

      case 'billing-payments':
        return (
          <Card className="backdrop-blur-sm bg-white/60 border-white/30">
            <CardHeader>
              <CardTitle>Billing & Payments</CardTitle>
              <CardDescription>Manage your billing information and payment methods</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Billing and payment settings will be displayed here.</p>
            </CardContent>
          </Card>
        );

      case 'password-security':
        return (
          <Card className="backdrop-blur-sm bg-white/60 border-white/30">
            <CardHeader>
              <CardTitle>Password & Security</CardTitle>
              <CardDescription>Manage your password and security settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Password and security settings will be displayed here.</p>
            </CardContent>
          </Card>
        );

      case 'membership-settings':
        return (
          <Card className="backdrop-blur-sm bg-white/60 border-white/30">
            <CardHeader>
              <CardTitle>Membership Settings</CardTitle>
              <CardDescription>Manage your membership and subscription settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Membership settings will be displayed here.</p>
            </CardContent>
          </Card>
        );

      case 'members-permissions':
        return <PermissionManager onNavigate={onNavigate} />;

      default:
        return (
          <Card className="backdrop-blur-sm bg-white/60 border-white/30">
            <CardHeader>
              <CardTitle>{navigationItems.find(item => item.id === activeSection)?.label}</CardTitle>
              <CardDescription>Settings for {navigationItems.find(item => item.id === activeSection)?.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Content for {navigationItems.find(item => item.id === activeSection)?.label} will be displayed here.</p>
            </CardContent>
          </Card>
        );
    }
  };

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
                onClick={() => onNavigate('home')} 
                className="flex items-center space-x-1 md:space-x-2 text-slate-600 hover:text-blue-600 hover:bg-white/40 backdrop-blur-sm transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium text-sm md:text-base">Back</span>
              </Button>
              <div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
                  Settings
                </h1>
                <p className="text-xs md:text-sm text-slate-500 mt-1">Manage your business settings and preferences</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex">
          {/* Navigation Sidebar */}
          <div className="w-64 bg-white/50 backdrop-blur-sm border-r border-white/20 overflow-y-auto">
            <div className="p-4">
              <nav className="space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className={`mr-3 h-4 w-4 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};