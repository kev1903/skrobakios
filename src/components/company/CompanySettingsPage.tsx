import React, { useState, useEffect } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { useCompanies } from '@/hooks/useCompanies';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  Upload
} from 'lucide-react';
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
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Members</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

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

          <TabsContent value="members" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>
                      Manage your company's team members and their roles.
                    </CardDescription>
                  </div>
                  {(currentCompany.role === 'owner' || currentCompany.role === 'admin') && (
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite Member
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4" />
                  <p>Member management coming soon...</p>
                  <p className="text-sm">This will include inviting users, managing roles, and removing members.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Settings</CardTitle>
                <CardDescription>
                  Configure company-wide preferences and security settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4" />
                  <p>Advanced settings coming soon...</p>
                  <p className="text-sm">This will include security settings, integrations, and billing management.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};