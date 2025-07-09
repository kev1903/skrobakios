import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft,
  DollarSign,
  ExternalLink,
  RefreshCw,
  Check,
  AlertCircle,
  Settings,
  Download,
  Upload,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface XeroIntegrationProps {
  onBack: () => void;
}

export const XeroIntegration = ({ onBack }: XeroIntegrationProps) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [autoSync, setAutoSync] = useState(true);
  const [connectionInfo, setConnectionInfo] = useState<{
    tenant_name?: string;
    connected_at?: string;
  } | null>(null);

  // Check connection status on component mount and periodically
  useEffect(() => {
    checkConnectionStatus();
    
    // Set up periodic status checks (every 5 minutes)
    const statusInterval = setInterval(() => {
      if (isConnected) {
        checkConnectionStatus();
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Listen for OAuth completion messages
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'xero-auth-success') {
        toast({
          title: 'Connected to Xero',
          description: 'Successfully connected to your Xero account.',
        });
        checkConnectionStatus();
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(statusInterval);
    };
  }, [isConnected]);

  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      // Call our Supabase edge function to initiate OAuth
      const { data, error } = await supabase.functions.invoke('xero-oauth', {
        body: { action: 'initiate' }
      });
      
      if (error) throw error;
      
      if (data.authUrl) {
        // Open OAuth window
        const popup = window.open(
          data.authUrl,
          'xero-oauth',
          'width=600,height=700,scrollbars=yes,resizable=yes'
        );

        // Listen for OAuth completion
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            // Check if connection was successful
            checkConnectionStatus();
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Xero connection error:', error);
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect to Xero. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const checkConnectionStatus = async () => {
    try {
      console.log('🔍 Checking Xero connection status...');
      const { data, error } = await supabase.functions.invoke('xero-oauth', {
        body: { action: 'status' }
      });
      
      console.log('🔍 Status response:', { data, error });
      
      if (error) {
        console.error('Status check error:', error);
        // If there's an error, assume disconnected but don't throw
        setIsConnected(false);
        setConnectionInfo(null);
        setLastSync(null);
        return;
      }
      
      if (data?.connected && data?.connection) {
        console.log('✅ Connection active:', data.connection);
        setIsConnected(true);
        setConnectionInfo(data.connection);
        if (data.connection.connected_at) {
          setLastSync(new Date(data.connection.connected_at));
        }
      } else {
        console.log('❌ No active connection:', data);
        setIsConnected(false);
        setConnectionInfo(null);
        setLastSync(null);
        
        // If the response indicates token refresh failed, show appropriate message
        if (data?.error?.includes('refresh failed') || data?.error?.includes('expired')) {
          toast({
            title: 'Connection Expired',
            description: 'Your Xero connection has expired. Please reconnect.',
            variant: 'destructive'
          });
        }
      }
    } catch (error) {
      console.error('Status check error:', error);
      setIsConnected(false);
      setConnectionInfo(null);
      setLastSync(null);
    }
  };

  const handleDisconnect = async () => {
    try {
      const { error } = await supabase.functions.invoke('xero-oauth', {
        body: { action: 'disconnect' }
      });
      
      if (error) throw error;
      
      setIsConnected(false);
      setLastSync(null);
      toast({
        title: 'Disconnected',
        description: 'Successfully disconnected from Xero.',
      });
    } catch (error) {
      console.error('Disconnect error:', error);
      toast({
        title: 'Disconnection Failed',
        description: 'Failed to disconnect from Xero. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('xero-sync', {
        body: { action: 'sync' }
      });
      
      if (error) {
        console.error('Sync error:', error);
        throw new Error(error.message || 'Failed to sync data from Xero');
      }
      
      setLastSync(new Date());
      
      // Show detailed sync results if available
      if (data?.results) {
        const { results } = data;
        const successMsg = `Synced ${results.invoices} invoices, ${results.contacts} contacts, ${results.accounts} accounts`;
        
        toast({
          title: 'Sync Complete',
          description: results.errors.length > 0 
            ? `${successMsg}. Some errors occurred.`
            : successMsg,
          variant: results.errors.length > 0 ? 'destructive' : 'default'
        });
        
        // Log any errors for debugging
        if (results.errors.length > 0) {
          console.warn('Sync errors:', results.errors);
        }
      } else {
        toast({
          title: 'Sync Complete',
          description: 'Successfully synced data from Xero.',
        });
      }
    } catch (error) {
      console.error('Sync error:', error);
      
      // Check if it's a connection issue
      if (error.message?.includes('No Xero connection found')) {
        setIsConnected(false);
        setConnectionInfo(null);
        toast({
          title: 'Connection Lost',
          description: 'Your Xero connection has been lost. Please reconnect.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Sync Failed',
          description: error.message || 'Failed to sync data from Xero. Please try again.',
          variant: 'destructive'
        });
      }
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Integrations</span>
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <DollarSign className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground heading-modern">
            Xero Integration
          </h2>
          <p className="text-muted-foreground body-modern">
            Connect with Xero to sync your financial data
          </p>
        </div>
      </div>

      {/* Connection Status */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="heading-modern">Connection Status</CardTitle>
              <CardDescription>Manage your Xero account connection</CardDescription>
            </div>
            {isConnected ? (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <Check className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="outline">
                <AlertCircle className="w-3 h-3 mr-1" />
                Not Connected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground heading-modern mb-2">
                Connect to Xero
              </h3>
              <p className="text-muted-foreground body-modern mb-6 max-w-md mx-auto">
                Connect your Xero account to automatically sync invoices, expenses, and financial data.
              </p>
              <Button 
                onClick={handleConnect} 
                disabled={isConnecting}
                className="flex items-center gap-2"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4" />
                    Connect to Xero
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-foreground heading-modern">Account Status</h4>
                  <p className="text-sm text-muted-foreground body-modern">Connected and ready to sync</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleDisconnect}>
                  Disconnect
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-foreground heading-modern">Last Sync</h4>
                  <p className="text-sm text-muted-foreground body-modern">
                    {lastSync ? lastSync.toLocaleString() : 'Never'}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleSync} disabled={isSyncing}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Sync Now'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Settings */}
      {isConnected && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="heading-modern">Sync Settings</CardTitle>
            <CardDescription>Configure how data is synchronized between platforms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-foreground heading-modern">Automatic Sync</h4>
                <p className="text-sm text-muted-foreground body-modern">Sync data automatically every hour</p>
              </div>
              <Switch checked={autoSync} onCheckedChange={setAutoSync} />
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-foreground heading-modern">Data Types</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Upload className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Invoices</p>
                      <p className="text-xs text-muted-foreground">Sync invoices to Xero</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Download className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Expenses</p>
                      <p className="text-xs text-muted-foreground">Import expenses from Xero</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Financial Reports</p>
                      <p className="text-xs text-muted-foreground">Import financial reports</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help & Documentation */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="heading-modern">Help & Documentation</CardTitle>
          <CardDescription>Learn more about Xero integration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Xero API Documentation
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Integration Guide
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};