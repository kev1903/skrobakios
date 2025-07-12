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
  Target,
  DollarSign,
  TrendingUp,
  Boxes,
  Calculator,
  FolderOpen,
  UsersRound,
  LayoutDashboard,
  Clock,
  MapPin,
  Hash,
  MessageSquare,
  Code
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

  const [modules, setModules] = useState({
    projectManagement: true,
    timeTracking: true,
    estimating: true,
    invoicing: true,
    fileManagement: true,
    reporting: true,
    integrations: false,
    apiAccess: false
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

  const handleModuleToggle = (module: string, enabled: boolean) => {
    setModules(prev => ({
      ...prev,
      [module]: enabled
    }));
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
        <div className="space-y-6">
          {/* Page Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Update company details and configure available modules</h2>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Company Information */}
            <Card className="backdrop-blur-xl bg-white/80 border-white/30 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-slate-800">Company Information</CardTitle>
                <p className="text-slate-600 text-sm">Basic company details and contact information</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-700 font-medium">Company Name</Label>
                  <Input
                    id="name"
                    value={companyForm.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ardelle"
                    required
                    className="bg-white/60 border-slate-200"
                  />
                </div>

                {/* Company Slug */}
                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-slate-700 font-medium">Company Slug</Label>
                  <Input
                    id="slug"
                    value={companyForm.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="ardelle-175229595404037"
                    className="bg-white/60 border-slate-200"
                  />
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="website" className="flex items-center space-x-2 text-slate-700 font-medium">
                    <Globe className="w-4 h-4 text-slate-500" />
                    <span>Website</span>
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    value={companyForm.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="www.ardelle.com.au"
                    className="bg-white/60 border-slate-200"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center space-x-2 text-slate-700 font-medium">
                    <span>📞</span>
                    <span>Phone</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={companyForm.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="bg-white/60 border-slate-200"
                  />
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center space-x-2 text-slate-700 font-medium">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span>Address</span>
                  </Label>
                  <Textarea
                    id="address"
                    value={companyForm.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={3}
                    placeholder="Enter company address"
                    className="bg-white/60 border-slate-200 resize-none"
                  />
                </div>

                {/* ABN */}
                <div className="space-y-2">
                  <Label htmlFor="abn" className="flex items-center space-x-2 text-slate-700 font-medium">
                    <Hash className="w-4 h-4 text-slate-500" />
                    <span>ABN</span>
                  </Label>
                  <Input
                    id="abn"
                    value={companyForm.abn}
                    onChange={(e) => handleInputChange('abn', e.target.value)}
                    placeholder="12 345 678 901"
                    className="bg-white/60 border-slate-200"
                  />
                </div>

                {/* Company Slogan */}
                <div className="space-y-2">
                  <Label htmlFor="slogan" className="flex items-center space-x-2 text-slate-700 font-medium">
                    <MessageSquare className="w-4 h-4 text-slate-500" />
                    <span>Company Slogan</span>
                  </Label>
                  <Input
                    id="slogan"
                    value={companyForm.slogan}
                    onChange={(e) => handleInputChange('slogan', e.target.value)}
                    placeholder="Interiors and more"
                    className="bg-white/60 border-slate-200"
                  />
                </div>

                {/* Logo URL */}
                <div className="space-y-2">
                  <Label htmlFor="logo_url" className="text-slate-700 font-medium">Logo URL</Label>
                  <Input
                    id="logo_url"
                    value={companyForm.logo_url}
                    onChange={(e) => handleInputChange('logo_url', e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="bg-white/60 border-slate-200"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSaveCompany} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Right Column - Company Modules */}
            <Card className="backdrop-blur-xl bg-white/80 border-white/30 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-slate-800">Company Modules</CardTitle>
                <p className="text-slate-600 text-sm">Enable or disable features for this company</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Project Management */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <FolderKanban className="w-5 h-5 text-blue-600" />
                      <h4 className="font-medium text-slate-800">Project Management</h4>
                    </div>
                    <p className="text-sm text-slate-600">Create and manage projects</p>
                  </div>
                  <Switch 
                    checked={modules.projectManagement}
                    onCheckedChange={(checked) => handleModuleToggle('projectManagement', checked)}
                  />
                </div>

                {/* Time Tracking */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-green-600" />
                      <h4 className="font-medium text-slate-800">Time Tracking</h4>
                    </div>
                    <p className="text-sm text-slate-600">Track time on tasks and projects</p>
                  </div>
                  <Switch 
                    checked={modules.timeTracking}
                    onCheckedChange={(checked) => handleModuleToggle('timeTracking', checked)}
                  />
                </div>

                {/* Estimating */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Calculator className="w-5 h-5 text-purple-600" />
                      <h4 className="font-medium text-slate-800">Estimating</h4>
                    </div>
                    <p className="text-sm text-slate-600">Create and manage estimates</p>
                  </div>
                  <Switch 
                    checked={modules.estimating}
                    onCheckedChange={(checked) => handleModuleToggle('estimating', checked)}
                  />
                </div>

                {/* Invoicing */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-orange-600" />
                      <h4 className="font-medium text-slate-800">Invoicing</h4>
                    </div>
                    <p className="text-sm text-slate-600">Generate and manage invoices</p>
                  </div>
                  <Switch 
                    checked={modules.invoicing}
                    onCheckedChange={(checked) => handleModuleToggle('invoicing', checked)}
                  />
                </div>

                {/* File Management */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <FolderOpen className="w-5 h-5 text-teal-600" />
                      <h4 className="font-medium text-slate-800">File Management</h4>
                    </div>
                    <p className="text-sm text-slate-600">Upload and organize files</p>
                  </div>
                  <Switch 
                    checked={modules.fileManagement}
                    onCheckedChange={(checked) => handleModuleToggle('fileManagement', checked)}
                  />
                </div>

                {/* Reporting */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-red-600" />
                      <h4 className="font-medium text-slate-800">Reporting</h4>
                    </div>
                    <p className="text-sm text-slate-600">Generate reports and analytics</p>
                  </div>
                  <Switch 
                    checked={modules.reporting}
                    onCheckedChange={(checked) => handleModuleToggle('reporting', checked)}
                  />
                </div>

                {/* Integrations */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Plug className="w-5 h-5 text-indigo-600" />
                      <h4 className="font-medium text-slate-800">Integrations</h4>
                    </div>
                    <p className="text-sm text-slate-600">Connect with third-party services</p>
                  </div>
                  <Switch 
                    checked={modules.integrations}
                    onCheckedChange={(checked) => handleModuleToggle('integrations', checked)}
                  />
                </div>

                {/* API Access */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Code className="w-5 h-5 text-slate-600" />
                      <h4 className="font-medium text-slate-800">API Access</h4>
                    </div>
                    <p className="text-sm text-slate-600">Enable API access for developers</p>
                  </div>
                  <Switch 
                    checked={modules.apiAccess}
                    onCheckedChange={(checked) => handleModuleToggle('apiAccess', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};