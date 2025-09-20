import React, { useState, useEffect } from 'react';
import { ArrowLeft, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { useCompanies } from '@/hooks/useCompanies';
import { useToast } from '@/hooks/use-toast';
import { Company } from '@/types/company';

interface SettingsPageProps {
  onNavigate: (page: string) => void;
}

export const SettingsPage = ({ onNavigate }: SettingsPageProps) => {
  const { user } = useAuth();
  const { currentCompany } = useCompany();
  const { getCompany, updateCompany, loading } = useCompanies();
  const { toast } = useToast();
  
  const [companyData, setCompanyData] = useState<Partial<Company>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadCompanyData = async () => {
      if (!currentCompany?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const company = await getCompany(currentCompany.id);
        if (company) {
          setCompanyData(company);
        }
      } catch (error) {
        console.error('Failed to load company data:', error);
        toast({
          title: "Error",
          description: "Failed to load company information",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCompanyData();
  }, [currentCompany?.id, getCompany]);

  const handleInputChange = (field: keyof Company, value: string | number) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!currentCompany?.id || !companyData) return;

    setIsSaving(true);
    try {
      await updateCompany(currentCompany.id, companyData);
      toast({
        title: "Success",
        description: "Business information updated successfully",
      });
    } catch (error) {
      console.error('Failed to update company:', error);
      toast({
        title: "Error",
        description: "Failed to update business information",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return <div>Please log in to access settings</div>;
  }

  if (!currentCompany) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Business Selected</h2>
          <p className="text-gray-600 mb-4">Please select a business to manage settings</p>
          <Button onClick={() => onNavigate('dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading business information...</p>
        </div>
      </div>
    );
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
                  Business Settings
                </h1>
                <p className="text-xs md:text-sm text-slate-500 mt-1">Manage your business information and preferences</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          
          {/* Business Information */}
          <Card className="backdrop-blur-sm bg-white/60 border-white/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Business Information
              </CardTitle>
              <CardDescription>
                Update your business details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input 
                    id="company-name" 
                    placeholder="Your Company Name"
                    value={companyData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="abn">ABN</Label>
                  <Input 
                    id="abn" 
                    placeholder="Your ABN"
                    value={companyData.abn || ''}
                    onChange={(e) => handleInputChange('abn', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    placeholder="Phone Number"
                    value={companyData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input 
                    id="website" 
                    placeholder="https://yourwebsite.com"
                    value={companyData.website || ''}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Business Address</Label>
                <Textarea 
                  id="address" 
                  placeholder="Your business address"
                  value={companyData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slogan">Business Slogan</Label>
                <Input 
                  id="slogan" 
                  placeholder="Your business slogan"
                  value={companyData.slogan || ''}
                  onChange={(e) => handleInputChange('slogan', e.target.value)}
                />
              </div>

              <Button 
                className="w-full md:w-auto" 
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>

          {/* Business Preferences */}
          <Card className="backdrop-blur-sm bg-white/60 border-white/30">
            <CardHeader>
              <CardTitle>Business Preferences</CardTitle>
              <CardDescription>
                Configure your business operating preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select 
                    value={companyData.industry || ''} 
                    onValueChange={(value) => handleInputChange('industry', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Construction">Construction</SelectItem>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Architecture">Architecture</SelectItem>
                      <SelectItem value="Property Development">Property Development</SelectItem>
                      <SelectItem value="Consulting">Consulting</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-size">Company Size</Label>
                  <Select 
                    value={companyData.company_size || ''} 
                    onValueChange={(value) => handleInputChange('company_size', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-5 employees">1-5 employees</SelectItem>
                      <SelectItem value="6-10 employees">6-10 employees</SelectItem>
                      <SelectItem value="11-25 employees">11-25 employees</SelectItem>
                      <SelectItem value="26-50 employees">26-50 employees</SelectItem>
                      <SelectItem value="51-100 employees">51-100 employees</SelectItem>
                      <SelectItem value="100+ employees">100+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business-type">Business Type</Label>
                  <Select 
                    value={companyData.business_type || ''} 
                    onValueChange={(value) => handleInputChange('business_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sole_trader">Sole Trader</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="company">Company</SelectItem>
                      <SelectItem value="trust">Trust</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year-established">Year Established</Label>
                  <Input 
                    id="year-established" 
                    type="number"
                    placeholder="e.g., 2020"
                    value={companyData.year_established || ''}
                    onChange={(e) => handleInputChange('year_established', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <Button 
                className="w-full md:w-auto" 
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Update Preferences'}
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};