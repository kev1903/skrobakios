import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, CreditCard, Settings, Users, Bell, FileText, Plug, CheckCircle, XCircle, ExternalLink, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { EnhancedCompanyUserManagement } from '@/components/company/EnhancedCompanyUserManagement';
import { useCompany } from '@/contexts/CompanyContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BusinessSettingsPageProps {
  onNavigate: (page: string) => void;
}

export const BusinessSettingsPage = ({ onNavigate }: BusinessSettingsPageProps) => {
  const [activeSection, setActiveSection] = useState('my-info');
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasXeroConnection, setHasXeroConnection] = useState(false);
  const [xeroConnection, setXeroConnection] = useState<any>(null);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const { currentCompany } = useCompany();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (activeSection === 'connected-services') {
      checkXeroConnectionStatus();
    }
  }, [activeSection]);

  const checkXeroConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('xero_connections')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .maybeSingle();

      if (error || !data) {
        return false;
      }

      // Check if token is expired
      const now = new Date();
      const expiresAt = new Date(data.expires_at);
      
      if (now >= expiresAt) {
        console.log('Xero token has expired');
        return false; // Treat expired token as no connection
      }

      return data;
    } catch (error) {
      return false;
    }
  };

  const checkXeroConnectionStatus = async () => {
    const connection = await checkXeroConnection();
    setHasXeroConnection(!!connection);
    setXeroConnection(connection);
  };

  const handleXeroConnect = async () => {
    setIsConnecting(true);
    try {
      console.log('Starting Xero connection...');
      const { data, error } = await supabase.functions.invoke('xero-oauth', {
        body: { action: 'initiate' }
      });
      
      console.log('Xero function response:', { data, error });
      
      if (error) {
        console.error('Connect error:', error);
        toast.error('Failed to connect to Xero');
        setIsConnecting(false);
        return;
      }

      if (data?.auth_url) {
        console.log('Opening Xero auth window:', data.auth_url);
        
        // Try to open popup first
        const authWindow = window.open(
          data.auth_url, 
          'xero-auth', 
          'width=600,height=700,scrollbars=yes,resizable=yes'
        );

        // Check if popup was blocked
        if (!authWindow || authWindow.closed || typeof authWindow.closed === 'undefined') {
          console.log('Popup blocked, redirecting in same window');
          toast.error('Popup blocked! Redirecting to Xero authorization...');
          
          // Store current page info to return to after auth
          localStorage.setItem('xero_return_page', window.location.href);
          
          // Redirect in same window
          window.location.href = data.auth_url;
          return;
        }

        console.log('Popup opened successfully');

        // Listen for auth completion
        const messageListener = (event: MessageEvent) => {
          console.log('Received message:', event.data);
          if (event.data === 'xero-auth-success') {
            authWindow?.close();
            window.removeEventListener('message', messageListener);
            toast.success('Successfully connected to Xero!');
            checkXeroConnectionStatus();
            setIsConnecting(false);
          } else if (event.data === 'xero-auth-error') {
            authWindow?.close();
            window.removeEventListener('message', messageListener);
            toast.error('Failed to connect to Xero');
            setIsConnecting(false);
          }
        };

        window.addEventListener('message', messageListener);
        
        // Check if window was closed manually
        const checkClosed = setInterval(() => {
          if (authWindow?.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageListener);
            setIsConnecting(false);
            console.log('Auth window was closed manually');
          }
        }, 1000);
      } else {
        console.error('No auth_url in response:', data);
        toast.error('Failed to get authorization URL');
        setIsConnecting(false);
      }
    } catch (error) {
      console.error('Connect error:', error);
      toast.error('Failed to connect to Xero');
      setIsConnecting(false);
    }
  };

  const handleXeroDisconnect = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('xero-oauth', {
        body: { action: 'disconnect' }
      });
      
      if (error) {
        console.error('Disconnect error:', error);
        toast.error('Failed to disconnect from Xero');
        return;
      }

      if (data.success) {
        toast.success('Successfully disconnected from Xero');
        checkXeroConnectionStatus();
      } else {
        toast.error('Failed to disconnect from Xero');
      }
    } catch (error) {
      console.error('Disconnect error:', error);
      toast.error('Failed to disconnect from Xero');
    }
  };

  const navigationItems = [
    { id: 'my-info', label: 'My info', icon: User },
    { id: 'billing-payments', label: 'Billing & Payments', icon: CreditCard },
    { id: 'membership-settings', label: 'Membership Settings', icon: Settings },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'notification-settings', label: 'Notification Settings', icon: Bell },
    { id: 'tax-information', label: 'Tax Information', icon: FileText },
    { id: 'connected-services', label: 'Connected Services', icon: Plug },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'my-info':
        return (
          <Card className="backdrop-blur-sm bg-card/60 border-border/30">
            <CardHeader>
              <CardTitle>My Info</CardTitle>
              <CardDescription>Manage your personal information and profile settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">First Name</label>
                  <input className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-background text-foreground" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Last Name</label>
                  <input className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-background text-foreground" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Email</label>
                <input className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-background text-foreground" />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        );

      case 'billing-payments':
        return (
          <Card className="backdrop-blur-sm bg-card/60 border-border/30">
            <CardHeader>
              <CardTitle>Billing & Payments</CardTitle>
              <CardDescription>Manage your billing information and payment methods</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Billing and payment settings will be displayed here.</p>
            </CardContent>
          </Card>
        );

      case 'membership-settings':
        return (
          <Card className="backdrop-blur-sm bg-card/60 border-border/30">
            <CardHeader>
              <CardTitle>Membership Settings</CardTitle>
              <CardDescription>Manage your membership and subscription settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Membership settings will be displayed here.</p>
            </CardContent>
          </Card>
        );

      case 'teams':
        if (!currentCompany) {
          return (
            <Card className="backdrop-blur-sm bg-card/60 border-border/30">
              <CardHeader>
                <CardTitle>Teams</CardTitle>
                <CardDescription>No company selected</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Please select a company to manage team members.</p>
              </CardContent>
            </Card>
          );
        }
        
        return (
          <div className="space-y-6">
            <EnhancedCompanyUserManagement
              companyId={currentCompany.id}
              companyName={currentCompany.name}
            />
          </div>
        );

      case 'connected-services':
        return (
          <Card className="backdrop-blur-sm bg-card/60 border-border/30">
            <CardHeader>
              <CardTitle>Connected Services</CardTitle>
              <CardDescription>Manage your third-party integrations and connected services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Xero Integration */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border border-border rounded-lg bg-card/40 backdrop-blur-sm space-y-4 md:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-foreground">Xero</h3>
                    <p className="text-sm text-muted-foreground">
                      {hasXeroConnection ? (
                        <>
                          <span className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                            Connected to {xeroConnection?.tenant_name || 'Xero'}
                          </span>
                          <span className="text-xs text-muted-foreground/70 mt-1 block">
                            Last synced: {xeroConnection?.last_sync ? new Date(xeroConnection.last_sync).toLocaleDateString() : 'Never'}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="flex items-center">
                            <XCircle className="w-4 h-4 text-muted-foreground/60 mr-1" />
                            Not connected
                          </span>
                          <span className="text-xs text-muted-foreground/70 mt-1 block">
                            Connect to sync invoices and financial data
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full md:w-auto">
                  {hasXeroConnection ? (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onNavigate('finance')}
                        className="text-primary border-primary/20 hover:bg-primary/10 w-full sm:w-auto"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View Invoices
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleXeroDisconnect}
                        className="text-destructive border-destructive/20 hover:bg-destructive/10 w-full sm:w-auto"
                      >
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button 
                      onClick={handleXeroConnect}
                      disabled={isConnecting}
                      className="bg-orange-500 hover:bg-orange-600 text-white w-full sm:w-auto"
                    >
                      {isConnecting ? 'Connecting...' : 'Connect to Xero'}
                    </Button>
                  )}
                </div>
              </div>

              <Separator />

              {/* Placeholder for other integrations */}
              <div className="text-center py-8">
                <Plug className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">More integrations coming soon</h3>
                <p className="text-sm text-muted-foreground">
                  We're working on adding more service integrations to help streamline your business operations.
                </p>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card className="backdrop-blur-sm bg-card/60 border-border/30">
            <CardHeader>
              <CardTitle>{navigationItems.find(item => item.id === activeSection)?.label}</CardTitle>
              <CardDescription>Settings for {navigationItems.find(item => item.id === activeSection)?.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Content for {navigationItems.find(item => item.id === activeSection)?.label} will be displayed here.</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="relative backdrop-blur-xl bg-card/60 border-b border-border/20 shadow-sm">
        <div className="px-4 md:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 md:space-x-6">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onNavigate('home')} 
                className="flex items-center space-x-1 md:space-x-2 text-muted-foreground hover:text-primary hover:bg-muted/40 backdrop-blur-sm transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium text-sm md:text-base">Back</span>
              </Button>
              <div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Settings
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">Manage your business settings and preferences</p>
              </div>
            </div>
            
            {/* Mobile Menu Toggle */}
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileNav(!showMobileNav)}
                className="text-muted-foreground hover:text-primary"
              >
                {showMobileNav ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col md:flex-row">
          {/* Mobile Navigation Overlay */}
          {isMobile && showMobileNav && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileNav(false)}>
              <div className="absolute top-0 left-0 w-80 h-full bg-card/95 backdrop-blur-sm border-r border-border shadow-xl">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-foreground">Settings Menu</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowMobileNav(false)}
                      className="text-muted-foreground hover:text-primary"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <nav className="space-y-1">
                    {navigationItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveSection(item.id);
                            setShowMobileNav(false);
                          }}
                          className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 touch-manipulation ${
                            isActive
                              ? 'bg-primary/10 text-primary border-l-4 border-primary'
                              : 'text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground/60'}`} />
                          {item.label}
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Navigation Sidebar */}
          {!isMobile && (
            <div className="w-64 bg-card/50 backdrop-blur-sm border-r border-border/20 h-full overflow-y-auto">
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
                            ? 'bg-primary/10 text-primary border-l-4 border-primary'
                            : 'text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        <Icon className={`mr-3 h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground/60'}`} />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 h-full overflow-y-auto">
            <div className="p-4 md:p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};