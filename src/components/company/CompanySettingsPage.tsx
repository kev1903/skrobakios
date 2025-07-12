import React, { useState, useEffect } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { useCompanies } from '@/hooks/useCompanies';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/useTheme';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  Building2, 
  Users, 
  Settings, 
  Crown,
  Shield,
  UserPlus,
  Pencil,
  Trash2,
  Save,
  Upload,
  Bell,
  Palette,
  Plug,
  Globe,
  FolderKanban,
  BarChart3,
  Calendar,
  FileText,
  Map,
  Target
} from 'lucide-react';
import { CompanyRolesTab } from './settings/CompanyRolesTab';
import { CompanyIntegrationsTab } from './settings/CompanyIntegrationsTab';
import { CompanyUserManagement } from './settings/CompanyUserManagement';
import { Company } from '@/types/company';

interface CompanySettingsPageProps {
  onNavigate: (page: string) => void;
}

export const CompanySettingsPage = ({ onNavigate }: CompanySettingsPageProps) => {
  const { currentCompany, refreshCompanies } = useCompany();
  const { getCompany, updateCompany, inviteUserToCompany } = useCompanies();
  const { toast } = useToast();
  
  const [fullCompany, setFullCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const { theme, setTheme } = useTheme();
  const { isSuperAdmin, isOwner } = useUserRole();
  
  const [companyForm, setCompanyForm] = useState({
    name: '',
    slug: '',
    website: '',
    phone: '',
    address: '',
    abn: '',
    slogan: '',
    logo_url: ''
  });

  // Load full company details - only on initial load
  useEffect(() => {
    const loadCompanyDetails = async () => {
      if (!currentCompany?.id) return;
      
      setLoading(true);
      try {
        const company = await getCompany(currentCompany.id);
        if (company) {
          setFullCompany(company);
          // Only update form if it's empty/default (initial load)
          if (!companyForm.name) {
            setCompanyForm({
              name: company.name || '',
              slug: company.slug || '',
              website: company.website || '',
              phone: company.phone || '',
              address: company.address || '',
              abn: company.abn || '',
              slogan: company.slogan || '',
              logo_url: company.logo_url || ''
            });
          }
        }
      } catch (error) {
        console.error('Error loading company details:', error);
        toast({
          title: "Error",
          description: "Failed to load company details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadCompanyDetails();
  }, [currentCompany?.id]); // Only depend on company ID, not the full object

  const handleSaveCompany = async () => {
    if (!currentCompany?.id) return;
    
    setSaving(true);
    try {
      console.log('Saving company form:', companyForm);
      
      const updatedCompany = await updateCompany(currentCompany.id, companyForm);
      if (updatedCompany) {
        console.log('Company updated successfully:', updatedCompany);
        
        // Update the form state immediately with the returned data
        setCompanyForm({
          name: updatedCompany.name || '',
          slug: updatedCompany.slug || '',
          website: updatedCompany.website || '',
          phone: updatedCompany.phone || '',
          address: updatedCompany.address || '',
          abn: updatedCompany.abn || '',
          slogan: updatedCompany.slogan || '',
          logo_url: updatedCompany.logo_url || ''
        });
        
        // Update the full company state
        setFullCompany(updatedCompany);
        
        // Refresh the companies context to update everywhere
        await refreshCompanies();
        
        toast({
          title: "Success",
          description: "Company details updated successfully"
        });
      }
    } catch (error) {
      console.error('Error updating company:', error);
      toast({
        title: "Error",
        description: "Failed to update company details",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setCompanyForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center">
        <div className="text-slate-600">Loading company details...</div>
      </div>
    );
  }

  if (!currentCompany) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-600 mb-2">No Company Selected</h2>
          <p className="text-muted-foreground mb-4">Please select a company to manage its settings.</p>
          <Button onClick={() => onNavigate('home')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Header */}
      <div className="border-b bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => onNavigate('home')}
                className="text-muted-foreground hover:text-foreground"
              >
                ← Back to Dashboard
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={fullCompany?.logo_url} />
                  <AvatarFallback>
                    {currentCompany.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-xl font-semibold">{currentCompany.name}</h1>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {currentCompany.role === 'owner' && <Crown className="h-3 w-3 mr-1" />}
                      {currentCompany.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                      {currentCompany.role}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            {(isSuperAdmin() || isOwner()) && (
              <Button 
                variant="outline"
                onClick={() => onNavigate('company-management')}
                className="hover:bg-blue-50 hover:border-blue-200"
              >
                <Building2 className="w-4 h-4 mr-2" />
                Manage All Companies
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Module Sections */}
        <div className="space-y-8">
          {/* Company Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 pb-4 border-b">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-slate-800">Company</h2>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="w-full overflow-x-auto">
                <TabsList className="flex w-full min-w-fit backdrop-blur-sm bg-white/60 p-1">
                  <TabsTrigger value="profile" className="flex items-center justify-center space-x-1 md:space-x-2 px-2 md:px-3 py-2 whitespace-nowrap">
                    <Building2 className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs md:text-sm">Profile</span>
                  </TabsTrigger>
                  <TabsTrigger value="general" className="flex items-center justify-center space-x-1 md:space-x-2 px-2 md:px-3 py-2 whitespace-nowrap">
                    <Settings className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs md:text-sm">General</span>
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="flex items-center justify-center space-x-1 md:space-x-2 px-2 md:px-3 py-2 whitespace-nowrap">
                    <Bell className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs md:text-sm">Notifications</span>
                  </TabsTrigger>
                  <TabsTrigger value="appearance" className="flex items-center justify-center space-x-1 md:space-x-2 px-2 md:px-3 py-2 whitespace-nowrap">
                    <Palette className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs md:text-sm">Appearance</span>
                  </TabsTrigger>
                  <TabsTrigger value="roles" className="flex items-center justify-center space-x-1 md:space-x-2 px-2 md:px-3 py-2 whitespace-nowrap">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs md:text-sm">Roles</span>
                  </TabsTrigger>
                  <TabsTrigger value="integrations" className="flex items-center justify-center space-x-1 md:space-x-2 px-2 md:px-3 py-2 whitespace-nowrap">
                    <Plug className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs md:text-sm">Integrations</span>
                  </TabsTrigger>
                  <TabsTrigger value="members" className="flex items-center justify-center space-x-1 md:space-x-2 px-2 md:px-3 py-2 whitespace-nowrap">
                    <UserPlus className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs md:text-sm">Members</span>
                  </TabsTrigger>
                  {isSuperAdmin() && (
                    <TabsTrigger value="admin" className="flex items-center justify-center space-x-1 md:space-x-2 px-2 md:px-3 py-2 whitespace-nowrap">
                      <Shield className="w-4 h-4 flex-shrink-0" />
                      <span className="text-xs md:text-sm">Admin</span>
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Profile</CardTitle>
                <CardDescription>
                  Manage your company's basic information and branding.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Company Logo */}
                <div className="space-y-2">
                  <Label>Company Logo</Label>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={companyForm.logo_url} />
                      <AvatarFallback className="text-lg">
                        {companyForm.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Input
                        placeholder="Logo URL"
                        value={companyForm.logo_url}
                        onChange={(e) => handleInputChange('logo_url', e.target.value)}
                      />
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Logo
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name *</Label>
                    <Input
                      id="company-name"
                      value={companyForm.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter company name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-slug">Company Slug *</Label>
                    <Input
                      id="company-slug"
                      value={companyForm.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="company-slug"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={companyForm.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://yourcompany.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={companyForm.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+61 4 1234 5678"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="abn">ABN</Label>
                    <Input
                      id="abn"
                      value={companyForm.abn}
                      onChange={(e) => handleInputChange('abn', e.target.value)}
                      placeholder="12 345 678 901"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={companyForm.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter company address"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slogan">Company Slogan</Label>
                  <Input
                    id="slogan"
                    value={companyForm.slogan}
                    onChange={(e) => handleInputChange('slogan', e.target.value)}
                    placeholder="Your company's mission or slogan"
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveCompany} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="general" className="space-y-4 md:space-y-6">
            <Card className="backdrop-blur-sm bg-white/60 border-white/30">
              <CardHeader className="pb-4 md:pb-6">
                <CardTitle className="text-lg md:text-xl">General Settings</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Configure general preferences for {currentCompany?.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div>
                    <h4 className="text-sm font-medium">Company Language</h4>
                    <p className="text-xs md:text-sm text-slate-500">Choose the primary language for this company</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">English</Button>
                </div>
                <Separator />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div>
                    <h4 className="text-sm font-medium">Time Zone</h4>
                    <p className="text-xs md:text-sm text-slate-500">Set the company's primary time zone</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">UTC+0</Button>
                </div>
                <Separator />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div>
                    <h4 className="text-sm font-medium">Currency</h4>
                    <p className="text-xs md:text-sm text-slate-500">Default currency for this company</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">USD</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4 md:space-y-6">
            <Card className="backdrop-blur-sm bg-white/60 border-white/30">
              <CardHeader className="pb-4 md:pb-6">
                <CardTitle className="text-lg md:text-xl">Company Notification Settings</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Configure notification preferences for {currentCompany?.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div>
                    <h4 className="text-sm font-medium">Project Updates</h4>
                    <p className="text-xs md:text-sm text-slate-500">Notify team when projects are updated</p>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div>
                    <h4 className="text-sm font-medium">Member Activity</h4>
                    <p className="text-xs md:text-sm text-slate-500">Notify when members join or leave</p>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div>
                    <h4 className="text-sm font-medium">Daily Digest</h4>
                    <p className="text-xs md:text-sm text-slate-500">Send daily summary of company activity</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4 md:space-y-6">
            <Card className="backdrop-blur-sm bg-white/60 border-white/30">
              <CardHeader className="pb-4 md:pb-6">
                <CardTitle className="text-lg md:text-xl">Company Appearance Settings</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Customize the look and feel for {currentCompany?.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div>
                    <h4 className="text-sm font-medium">Company Theme</h4>
                    <p className="text-xs md:text-sm text-slate-500">Theme preference for company workspace</p>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div>
                    <h4 className="text-sm font-medium">Brand Colors</h4>
                    <p className="text-xs md:text-sm text-slate-500">Use company brand colors in interface</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="space-y-4 md:space-y-6">
            <CompanyRolesTab />
          </TabsContent>

          <TabsContent value="integrations" className="space-y-4 md:space-y-6">
            <CompanyIntegrationsTab />
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <CompanyUserManagement />
          </TabsContent>

          {isSuperAdmin() && (
            <TabsContent value="admin" className="space-y-4 md:space-y-6">
              <Card className="backdrop-blur-sm bg-white/60 border-white/30">
                <CardHeader className="pb-4 md:pb-6">
                  <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Company Admin Panel
                    <Badge variant="destructive" className="text-xs">Super Admin</Badge>
                  </CardTitle>
                  <CardDescription className="text-sm md:text-base">
                    Super admin controls for {currentCompany?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <div>
                        <h4 className="text-sm font-medium">Company Status</h4>
                        <p className="text-xs md:text-sm text-slate-500">Enable or disable this company</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <div>
                        <h4 className="text-sm font-medium">Billing Override</h4>
                        <p className="text-xs md:text-sm text-slate-500">Override billing settings for this company</p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
            </Tabs>
          </div>

          {/* Project Modules Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 pb-4 border-b">
              <FolderKanban className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-semibold text-slate-800">Project Modules</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Project Management Module */}
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-green-200 hover:border-green-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-3">
                    <FolderKanban className="w-6 h-6 text-green-600" />
                    <span>Project Management</span>
                  </CardTitle>
                  <CardDescription>
                    Manage project timelines, tasks, and deliverables
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-slate-600">
                    <p>• Task management and assignment</p>
                    <p>• Project timeline tracking</p>
                    <p>• Milestone management</p>
                    <p>• Team collaboration</p>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    Configure Module
                  </Button>
                </CardContent>
              </Card>

              {/* Analytics & Reporting Module */}
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-blue-200 hover:border-blue-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-3">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                    <span>Analytics & Reporting</span>
                  </CardTitle>
                  <CardDescription>
                    Project insights and performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-slate-600">
                    <p>• Performance dashboards</p>
                    <p>• Progress tracking</p>
                    <p>• Resource utilization</p>
                    <p>• Custom reports</p>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    Configure Module
                  </Button>
                </CardContent>
              </Card>

              {/* Time Tracking Module */}
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-purple-200 hover:border-purple-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-3">
                    <Calendar className="w-6 h-6 text-purple-600" />
                    <span>Time Tracking</span>
                  </CardTitle>
                  <CardDescription>
                    Track time spent on projects and tasks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-slate-600">
                    <p>• Automatic time tracking</p>
                    <p>• Manual time entries</p>
                    <p>• Timesheet management</p>
                    <p>• Billing integration</p>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    Configure Module
                  </Button>
                </CardContent>
              </Card>

              {/* Document Management Module */}
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-orange-200 hover:border-orange-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-3">
                    <FileText className="w-6 h-6 text-orange-600" />
                    <span>Document Management</span>
                  </CardTitle>
                  <CardDescription>
                    Organize and share project documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-slate-600">
                    <p>• File storage and sharing</p>
                    <p>• Version control</p>
                    <p>• Document templates</p>
                    <p>• Access permissions</p>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    Configure Module
                  </Button>
                </CardContent>
              </Card>

              {/* Geographic Mapping Module */}
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-teal-200 hover:border-teal-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-3">
                    <Map className="w-6 h-6 text-teal-600" />
                    <span>Geographic Mapping</span>
                  </CardTitle>
                  <CardDescription>
                    Location-based project management
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-slate-600">
                    <p>• Project location mapping</p>
                    <p>• Route optimization</p>
                    <p>• Geographic analytics</p>
                    <p>• Asset tracking</p>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    Configure Module
                  </Button>
                </CardContent>
              </Card>

              {/* Goal Management Module */}
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-red-200 hover:border-red-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-3">
                    <Target className="w-6 h-6 text-red-600" />
                    <span>Goal Management</span>
                  </CardTitle>
                  <CardDescription>
                    Set and track project objectives
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-slate-600">
                    <p>• Goal setting and tracking</p>
                    <p>• KPI monitoring</p>
                    <p>• Progress visualization</p>
                    <p>• Achievement rewards</p>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    Configure Module
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};