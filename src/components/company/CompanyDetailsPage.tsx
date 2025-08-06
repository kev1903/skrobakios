import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CompanyLogoUpload } from '@/components/company-edit/CompanyLogoUpload';
import { useCompany } from '@/contexts/CompanyContext';
import { useCompanies } from '@/hooks/useCompanies';
import { useToast } from '@/hooks/use-toast';
import { Company } from '@/types/company';
import { Building2, MapPin, Phone, Globe, Hash, Calendar, Users, Briefcase, Award, CheckCircle } from 'lucide-react';

interface CompanyDetailsPageProps {
  onNavigate?: (page: string) => void;
}

export const CompanyDetailsPage: React.FC<CompanyDetailsPageProps> = ({ onNavigate }) => {
  const { currentCompany } = useCompany();
  const { getCompany, updateCompany } = useCompanies();
  const { toast } = useToast();
  
  const [company, setCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logo_url: '',
    website: '',
    address: '',
    phone: '',
    abn: '',
    slogan: '',
    business_type: '',
    industry: '',
    company_size: '',
    year_established: '',
    service_areas: [] as string[],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newServiceArea, setNewServiceArea] = useState('');

  useEffect(() => {
    const loadCompanyDetails = async () => {
      if (!currentCompany?.id) {
        setLoading(false);
        return;
      }

      try {
        const companyData = await getCompany(currentCompany.id);
        if (companyData) {
          setCompany(companyData);
          setFormData({
            name: companyData.name || '',
            slug: companyData.slug || '',
            logo_url: companyData.logo_url || '',
            website: companyData.website || '',
            address: companyData.address || '',
            phone: companyData.phone || '',
            abn: companyData.abn || '',
            slogan: companyData.slogan || '',
            business_type: companyData.business_type || '',
            industry: companyData.industry || '',
            company_size: companyData.company_size || '',
            year_established: companyData.year_established?.toString() || '',
            service_areas: companyData.service_areas || [],
          });
        }
      } catch (error) {
        console.error('Error loading company details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load company details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadCompanyDetails();
  }, [currentCompany?.id, getCompany, toast]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddServiceArea = () => {
    if (newServiceArea.trim() && !formData.service_areas.includes(newServiceArea.trim())) {
      setFormData(prev => ({
        ...prev,
        service_areas: [...prev.service_areas, newServiceArea.trim()]
      }));
      setNewServiceArea('');
    }
  };

  const handleRemoveServiceArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      service_areas: prev.service_areas.filter(item => item !== area)
    }));
  };

  const handleLogoUpdate = (newLogoUrl: string) => {
    setFormData(prev => ({
      ...prev,
      logo_url: newLogoUrl
    }));
  };

  const handleSave = async () => {
    if (!currentCompany?.id) return;

    setSaving(true);
    try {
      const updateData = {
        ...formData,
        year_established: formData.year_established ? parseInt(formData.year_established) : undefined,
        business_type: formData.business_type as 'sole_trader' | 'partnership' | 'company' | 'trust' | undefined,
      };

      const updatedCompany = await updateCompany(currentCompany.id, updateData);
      if (updatedCompany) {
        setCompany(updatedCompany);
        toast({
          title: 'Success',
          description: 'Company details updated successfully',
        });
      }
    } catch (error) {
      console.error('Error updating company:', error);
      toast({
        title: 'Error',
        description: 'Failed to update company details',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading company details...</p>
        </div>
      </div>
    );
  }

  if (!currentCompany) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>No Company Selected</CardTitle>
            <CardDescription>
              Please select a company to view and edit details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => onNavigate?.('dashboard')} 
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={formData.logo_url} alt={formData.name} />
              <AvatarFallback className="text-lg font-semibold">
                {formData.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{formData.name || 'Company Details'}</h1>
              <p className="text-muted-foreground">{formData.slogan || 'Manage your company information'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Core company details and identification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Company Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="company-name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slogan">Company Slogan</Label>
                  <Input
                    id="slogan"
                    value={formData.slogan}
                    onChange={(e) => handleInputChange('slogan', e.target.value)}
                    placeholder="Your company motto or tagline"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="business_type">Business Type</Label>
                    <Select value={formData.business_type} onValueChange={(value) => handleInputChange('business_type', value)}>
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
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      value={formData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      placeholder="e.g., Construction, Technology"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
                <CardDescription>
                  How customers can reach your company
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Business Address
                  </Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter your complete business address"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+61 xxx xxx xxx"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Website
                    </Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://yourcompany.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Business Details
                </CardTitle>
                <CardDescription>
                  Additional business information and credentials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="abn" className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      ABN (Australian Business Number)
                    </Label>
                    <Input
                      id="abn"
                      value={formData.abn}
                      onChange={(e) => handleInputChange('abn', e.target.value)}
                      placeholder="XX XXX XXX XXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year_established" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Year Established
                    </Label>
                    <Input
                      id="year_established"
                      type="number"
                      value={formData.year_established}
                      onChange={(e) => handleInputChange('year_established', e.target.value)}
                      placeholder="2020"
                      min="1800"
                      max={new Date().getFullYear()}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_size" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Company Size
                  </Label>
                  <Select value={formData.company_size} onValueChange={(value) => handleInputChange('company_size', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-500">201-500 employees</SelectItem>
                      <SelectItem value="500+">500+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Service Areas */}
                <div className="space-y-2">
                  <Label>Service Areas</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newServiceArea}
                      onChange={(e) => setNewServiceArea(e.target.value)}
                      placeholder="Add service area"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddServiceArea()}
                    />
                    <Button type="button" onClick={handleAddServiceArea} variant="outline">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.service_areas.map((area, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveServiceArea(area)}>
                        {area} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company Logo */}
            <Card>
              <CardHeader>
                <CardTitle>Company Logo</CardTitle>
                <CardDescription>
                  Upload your company logo for branding
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CompanyLogoUpload
                  currentLogoUrl={formData.logo_url}
                  onLogoUpdate={handleLogoUpdate}
                  companyName={formData.name}
                />
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Profile Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Company Name</span>
                  {formData.name ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Logo</span>
                  {formData.logo_url ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Address</span>
                  {formData.address ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">ABN</span>
                  {formData.abn ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Card>
              <CardContent className="pt-6">
                <Button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="w-full"
                  size="lg"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};