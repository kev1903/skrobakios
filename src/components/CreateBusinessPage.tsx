import React, { useState } from 'react';
import { ArrowLeft, Building2, Upload, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CreateBusinessPageProps {
  onNavigate: (page: string) => void;
}

export const CreateBusinessPage = ({ onNavigate }: CreateBusinessPageProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    website: '',
    address: '',
    phone: '',
    abn: '',
    slogan: '',
    business_type: 'small_business' as 'individual' | 'small_business' | 'enterprise' | 'agency' | 'freelancer',
    industry: 'Construction',
    company_size: '',
    year_established: '',
    service_areas: [] as string[],
    logo_url: '',
    meta_title: '',
    meta_description: ''
  });

  const handleInputChange = (field: string, value: string | ('individual' | 'small_business' | 'enterprise' | 'agency' | 'freelancer')) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Auto-generate slug from name
      ...(field === 'name' && typeof value === 'string' && { slug: value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').trim() })
    }));
  };

  const handleServiceAreasChange = (value: string) => {
    const areas = value.split(',').map(area => area.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, service_areas: areas }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Business name is required",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('Not authenticated');
      }

      const businessData = {
        name: formData.name,
        slug: formData.slug,
        website: formData.website || null,
        address: formData.address || null,
        phone: formData.phone || null,
        abn: formData.abn || null,
        slogan: formData.slogan || null,
        business_type: formData.business_type,
        industry: formData.industry || null,
        company_size: formData.company_size || null,
        year_established: formData.year_established ? parseInt(formData.year_established) : null,
        service_areas: formData.service_areas.length > 0 ? formData.service_areas : null,
        meta_title: formData.meta_title || null,
        meta_description: formData.meta_description || null,
        created_by: user.user.id,
        onboarding_completed: true
      };

      const { data, error } = await supabase
        .from('companies')
        .insert([businessData])
        .select()
        .single();

      if (error) throw error;

      // Add user as owner of the company
      const { error: memberError } = await supabase
        .from('company_members')
        .insert([{
          company_id: data.id,
          user_id: user.user.id,
          role: 'owner',
          status: 'active'
        }]);

      if (memberError) throw memberError;

      toast({
        title: "Success",
        description: "Business profile created successfully!",
      });

      // Navigate back to business management
      onNavigate('business');
    } catch (error) {
      console.error('Error creating business:', error);
      toast({
        title: "Error",
        description: "Failed to create business profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('business')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Business Management</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Create New Business</h1>
          </div>
          <p className="text-slate-600">Enter your business details to create a comprehensive business profile.</p>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Essential details about your business</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Business Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter business name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Business Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="business-url-slug"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="slogan">Business Slogan</Label>
                <Input
                  id="slogan"
                  value={formData.slogan}
                  onChange={(e) => handleInputChange('slogan', e.target.value)}
                  placeholder="Enter your business slogan"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="business_type">Business Type</Label>
                  <Select value={formData.business_type} onValueChange={(value) => handleInputChange('business_type', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="small_business">Small Business</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                      <SelectItem value="agency">Agency</SelectItem>
                      <SelectItem value="freelancer">Freelancer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    placeholder="e.g., Construction, Technology"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>How customers can reach your business</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://www.yourbusiness.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Business Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter your business address"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Business Details */}
          <Card>
            <CardHeader>
              <CardTitle>Business Details</CardTitle>
              <CardDescription>Additional information about your business</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="abn">ABN/Tax ID</Label>
                  <Input
                    id="abn"
                    value={formData.abn}
                    onChange={(e) => handleInputChange('abn', e.target.value)}
                    placeholder="Enter ABN or Tax ID"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="company_size">Company Size</Label>
                  <Input
                    id="company_size"
                    value={formData.company_size}
                    onChange={(e) => handleInputChange('company_size', e.target.value)}
                    placeholder="e.g., 10-50 employees"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="year_established">Year Established</Label>
                  <Input
                    id="year_established"
                    type="number"
                    value={formData.year_established}
                    onChange={(e) => handleInputChange('year_established', e.target.value)}
                    placeholder="2020"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="service_areas">Service Areas</Label>
                <Input
                  id="service_areas"
                  value={formData.service_areas.join(', ')}
                  onChange={(e) => handleServiceAreasChange(e.target.value)}
                  placeholder="Sydney, Melbourne, Brisbane (comma separated)"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* SEO Information */}
          <Card>
            <CardHeader>
              <CardTitle>SEO & Marketing</CardTitle>
              <CardDescription>Optimize your business for search engines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title}
                  onChange={(e) => handleInputChange('meta_title', e.target.value)}
                  placeholder="SEO title for your business"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => handleInputChange('meta_description', e.target.value)}
                  placeholder="Brief description of your business for search engines"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button
              variant="outline"
              onClick={() => onNavigate('business')}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Business
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};