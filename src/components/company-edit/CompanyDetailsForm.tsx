import React, { useState } from 'react';
import { Building2, Globe, MapPin, Save, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Company } from '@/types/company';

interface CompanyDetailsFormProps {
  company: Company;
  onSave: (data: Partial<Company>) => Promise<void>;
  saving: boolean;
}

export const CompanyDetailsForm = ({ company, onSave, saving }: CompanyDetailsFormProps) => {
  const [formData, setFormData] = useState({
    name: company.name || '',
    abn: company.abn || '',
    website: company.website || '',
    address: company.address || '',
    phone: company.phone || '',
    slogan: company.slogan || '',
    logo_url: company.logo_url || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="backdrop-blur-xl bg-white/60 border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          <Building2 className="w-5 h-5 text-blue-600" />
          <span>Company Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo Section */}
          <div className="space-y-4">
            <Label className="text-slate-700 font-medium">Company Logo</Label>
            <div className="flex items-center space-x-4">
              {formData.logo_url && (
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/20 border-2 border-white/30">
                  <img 
                    src={formData.logo_url} 
                    alt="Company logo"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <Input
                  value={formData.logo_url}
                  onChange={(e) => handleChange('logo_url', e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="backdrop-blur-sm bg-white/60 border-white/30"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700 font-medium">Company Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Company name"
                required
                className="backdrop-blur-sm bg-white/60 border-white/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="abn" className="text-slate-700 font-medium">ABN</Label>
              <Input
                id="abn"
                value={formData.abn}
                onChange={(e) => handleChange('abn', e.target.value)}
                placeholder="12 345 678 901"
                className="backdrop-blur-sm bg-white/60 border-white/30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slogan" className="text-slate-700 font-medium">Company Slogan</Label>
            <Input
              id="slogan"
              value={formData.slogan}
              onChange={(e) => handleChange('slogan', e.target.value)}
              placeholder="Your company's motto or tagline"
              className="backdrop-blur-sm bg-white/60 border-white/30"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="website" className="flex items-center space-x-2 text-slate-700 font-medium">
                <Globe className="w-4 h-4 text-blue-500" />
                <span>Website</span>
              </Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://company-website.com"
                className="backdrop-blur-sm bg-white/60 border-white/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-700 font-medium">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="backdrop-blur-sm bg-white/60 border-white/30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center space-x-2 text-slate-700 font-medium">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span>Address</span>
            </Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              rows={3}
              placeholder="Enter complete company address..."
              className="backdrop-blur-sm bg-white/60 border-white/30 resize-none"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};