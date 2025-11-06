import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Building2, Settings, Users, Plug, CheckCircle, XCircle, ExternalLink, Menu, X, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { EnhancedCompanyUserManagement } from '@/components/company/EnhancedCompanyUserManagement';
import { useCompany } from '@/contexts/CompanyContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLocation, useSearchParams } from 'react-router-dom';

interface BusinessSettingsPageProps {
  onNavigate: (page: string) => void;
}

export const BusinessSettingsPage = ({ onNavigate }: BusinessSettingsPageProps) => {
  const [activeSection, setActiveSection] = useState('business-details');
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasXeroConnection, setHasXeroConnection] = useState(false);
  const [xeroConnection, setXeroConnection] = useState<any>(null);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [businessForm, setBusinessForm] = useState<{
    name: string;
    business_type: 'company' | 'sole_trader' | 'partnership' | 'trust';
    abn: string;
    phone: string;
    address: string;
    website: string;
    slogan: string;
    logo_url: string;
  }>({
    name: '',
    business_type: 'company',
    abn: '',
    phone: '',
    address: '',
    website: '',
    slogan: '',
    logo_url: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentCompany } = useCompany();
  const isMobile = useIsMobile();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Handle section navigation from URL parameters
  useEffect(() => {
    const sectionParam = searchParams.get('section');
    const hash = location.hash.replace('#', '');
    
    if (sectionParam && ['business-details', 'membership-settings', 'teams', 'connected-services'].includes(sectionParam)) {
      setActiveSection(sectionParam);
    } else if (hash && ['business-details', 'membership-settings', 'teams', 'connected-services'].includes(hash)) {
      setActiveSection(hash);
    }
  }, [searchParams, location.hash, location.pathname]);

  useEffect(() => {
    if (activeSection === 'connected-services') {
      checkXeroConnectionStatus();
    }
  }, [activeSection]);

  // Load complete business details from database when company changes
  useEffect(() => {
    if (currentCompany) {
      loadCompleteBusinessDetails();
    }
  }, [currentCompany]);

  const loadCompleteBusinessDetails = async () => {
    if (!currentCompany) return;
    
    setIsLoadingData(true);
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('name, business_type, abn, phone, address, website, slogan, logo_url')
        .eq('id', currentCompany.id)
        .single();

      if (error) throw error;

      if (data) {
        setBusinessForm({
          name: data.name || '',
          business_type: data.business_type || 'company',
          abn: data.abn || '',
          phone: data.phone || '',
          address: data.address || '',
          website: data.website || '',
          slogan: data.slogan || '',
          logo_url: data.logo_url || ''
        });
      }
    } catch (error) {
      console.error('Error loading business details:', error);
      toast.error('Failed to load business details');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleBusinessFormSave = async () => {
    if (!currentCompany) return;

    // Basic validation
    if (!businessForm.name.trim()) {
      toast.error('Business name is required');
      return;
    }

    // Validate ABN format if provided
    if (businessForm.abn && businessForm.abn.replace(/\s/g, '').length !== 11) {
      toast.error('ABN must be 11 digits');
      return;
    }

    // Validate website URL if provided
    if (businessForm.website && businessForm.website.trim() && !businessForm.website.match(/^https?:\/\/.+/)) {
      toast.error('Website must start with http:// or https://');
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          name: businessForm.name.trim(),
          business_type: businessForm.business_type,
          abn: businessForm.abn?.trim() || null,
          phone: businessForm.phone?.trim() || null,
          address: businessForm.address?.trim() || null,
          website: businessForm.website?.trim() || null,
          slogan: businessForm.slogan?.trim() || null,
          logo_url: businessForm.logo_url?.trim() || null
        })
        .eq('id', currentCompany.id);

      if (error) throw error;
      
      toast.success('Business details updated successfully');
      
      // Reload the data to ensure consistency
      await loadCompleteBusinessDetails();
    } catch (error) {
      console.error('Error updating business details:', error);
      toast.error('Failed to update business details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBusinessFormChange = (field: keyof typeof businessForm, value: string | ('company' | 'sole_trader' | 'partnership' | 'trust')) => {
    setBusinessForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoUpload = async (file: File) => {
    if (!currentCompany) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploadingLogo(true);
    try {
      // Create file path with company ID
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentCompany.id}-${Date.now()}.${fileExt}`;
      const filePath = `company-logos/${fileName}`;

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update business form with new logo URL
      handleBusinessFormChange('logo_url', publicUrl);

      toast.success('Logo uploaded successfully');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleLogoRemove = async () => {
    if (!currentCompany || !businessForm.logo_url) return;

    try {
      // Extract file path from URL for deletion
      if (businessForm.logo_url.includes('company-logos/')) {
        const urlParts = businessForm.logo_url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `company-logos/${fileName}`;

        // Delete from storage
        await supabase.storage
          .from('avatars')
          .remove([filePath]);
      }

      // Update business form to remove logo URL
      handleBusinessFormChange('logo_url', '');

      toast.success('Logo removed successfully');
    } catch (error) {
      console.error('Error removing logo:', error);
      toast.error('Failed to remove logo');
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleLogoUpload(file);
    }
    // Reset input value so same file can be selected again
    event.target.value = '';
  };

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
    { id: 'business-details', label: 'Business Details', icon: Building2 },
    { id: 'membership-settings', label: 'Membership Settings', icon: Settings },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'connected-services', label: 'Connected Services', icon: Plug },
  ];

  // Auto-activate teams section when component mounts and hash is present
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'teams') {
        setActiveSection('teams');
      }
    };
    
    handleHashChange(); // Check on mount
    window.addEventListener('hashchange', handleHashChange);
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderContent = () => {
    switch (activeSection) {
      case 'business-details':
        return (
          <Card className="backdrop-blur-sm bg-card/60 border-border/30">
            <CardHeader>
              <CardTitle>Business Details</CardTitle>
              <CardDescription>Manage your company information and business settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              {currentCompany ? (
                isLoadingData ? (
                  <div className="text-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-3"></div>
                    <p className="text-sm text-muted-foreground">Loading business details...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Business Name</label>
                        <input 
                          className="block w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-background text-foreground" 
                          value={businessForm.name}
                          onChange={(e) => handleBusinessFormChange('name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Business Type</label>
                        <select 
                          className="block w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-background text-foreground"
                          value={businessForm.business_type}
                          onChange={(e) => handleBusinessFormChange('business_type', e.target.value as 'company' | 'sole_trader' | 'partnership' | 'trust')}
                        >
                          <option value="company">Company</option>
                          <option value="sole_trader">Sole Trader</option>
                          <option value="partnership">Partnership</option>
                          <option value="trust">Trust</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Company Logo Section */}
                    <div className="space-y-3 p-4 border border-border rounded-lg bg-muted/20">
                      <label className="text-sm font-medium text-foreground">Company Logo</label>
                      
                      <div className="flex items-center gap-4">
                        {businessForm.logo_url ? (
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-lg border-2 border-border overflow-hidden bg-background">
                              <img 
                                src={businessForm.logo_url} 
                                alt="Company logo" 
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder.svg';
                                }}
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground mb-2">Current logo uploaded</p>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => fileInputRef.current?.click()}
                                  disabled={isUploadingLogo}
                                >
                                  <Upload className="w-4 h-4 mr-2" />
                                  {isUploadingLogo ? 'Uploading...' : 'Change Logo'}
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={handleLogoRemove}
                                  disabled={isUploadingLogo}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Remove
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4 w-full">
                            <div className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/50">
                              <Building2 className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground mb-2">No logo uploaded</p>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploadingLogo}
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                {isUploadingLogo ? 'Uploading...' : 'Upload Logo'}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        Recommended: Square image, max 5MB. Supported formats: PNG, JPG, JPEG
                      </p>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={handleFileInputChange}
                        className="hidden"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">ABN</label>
                        <input 
                          className="block w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-background text-foreground" 
                          value={businessForm.abn}
                          onChange={(e) => {
                            const formatted = e.target.value.replace(/\D/g, '').replace(/(\d{2})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');
                            handleBusinessFormChange('abn', formatted);
                          }}
                          placeholder="12 345 678 901"
                          maxLength={13}
                        />
                        <p className="text-xs text-muted-foreground">Australian Business Number (11 digits)</p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Phone</label>
                        <input 
                          className="block w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-background text-foreground" 
                          value={businessForm.phone}
                          onChange={(e) => handleBusinessFormChange('phone', e.target.value)}
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Business Address</label>
                        <textarea 
                          className="block w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-background text-foreground resize-none" 
                          rows={2}
                          value={businessForm.address}
                          onChange={(e) => handleBusinessFormChange('address', e.target.value)}
                          placeholder="Enter business address"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Website</label>
                        <input 
                          className="block w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-background text-foreground" 
                          value={businessForm.website}
                          onChange={(e) => handleBusinessFormChange('website', e.target.value)}
                          placeholder="https://yourcompany.com"
                          type="url"
                        />
                        <p className="text-xs text-muted-foreground">Include http:// or https://</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Business Slogan</label>
                      <input 
                        className="block w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-background text-foreground" 
                        value={businessForm.slogan}
                        onChange={(e) => handleBusinessFormChange('slogan', e.target.value)}
                        placeholder="Enter your business slogan"
                      />
                    </div>
                    
                    <div className="pt-2">
                      <Button 
                        onClick={handleBusinessFormSave}
                        disabled={isLoading || isLoadingData}
                        size="sm"
                      >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </div>
                )
              ) : (
                <div className="text-center py-8">
                  <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No Company Selected</h3>
                  <p className="text-muted-foreground">Please select a company to manage business details.</p>
                </div>
              )}
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
                          data-section={item.id}
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
                        data-section={item.id}
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