import React, { useState } from 'react';
import { Globe, MapPin, Save } from 'lucide-react';
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
    slug: company.slug || '',
    website: company.website || '',
    address: company.address || '',
    phone: company.phone || '',
    slogan: company.slogan || '',
    logo_url: company.logo_url || '',
    abn: company.abn || ''
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Update company details</h2>
      </div>

      {/* Company Information */}
      <Card className="backdrop-blur-xl bg-white/80 border-white/30 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-slate-800">Company Information</CardTitle>
          <p className="text-slate-600 text-sm">Basic company details and contact information</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700 font-medium">Company Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
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
                value={formData.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                placeholder="ardelle-175229595404037"
                className="bg-white/60 border-slate-200"
              />
            </div>

            {/* Web Address */}
            <div className="space-y-2">
              <Label htmlFor="website" className="flex items-center space-x-2 text-slate-700 font-medium">
                <Globe className="w-4 h-4 text-slate-500" />
                <span>Web Address</span>
              </Label>
              <Input
                id="website"
                type="text"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
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
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
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
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                rows={3}
                placeholder="Enter company address"
                className="bg-white/60 border-slate-200 resize-none"
              />
            </div>

            {/* ABN */}
            <div className="space-y-2">
              <Label htmlFor="abn" className="flex items-center space-x-2 text-slate-700 font-medium">
                <span>#</span>
                <span>ABN</span>
              </Label>
              <Input
                id="abn"
                value={formData.abn}
                onChange={(e) => handleChange('abn', e.target.value)}
                placeholder="12 345 678 901"
                className="bg-white/60 border-slate-200"
              />
            </div>

            {/* Company Slogan */}
            <div className="space-y-2">
              <Label htmlFor="slogan" className="flex items-center space-x-2 text-slate-700 font-medium">
                <span>💬</span>
                <span>Company Slogan</span>
              </Label>
              <Input
                id="slogan"
                value={formData.slogan}
                onChange={(e) => handleChange('slogan', e.target.value)}
                placeholder="Interiors and more"
                className="bg-white/60 border-slate-200"
              />
            </div>


            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};