import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Globe, MapPin, Phone, Hash, MessageSquare, FolderKanban, DollarSign, TrendingUp } from 'lucide-react';
import { Company } from '@/types/company';

interface BusinessEditDialogProps {
  company: Company | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedCompany: Partial<Company>) => void;
}

interface CompanyModules {
  projects: boolean;
  finance: boolean;
  sales: boolean;
}

export const BusinessEditDialog = ({
  company,
  open,
  onOpenChange,
  onSave
}: BusinessEditDialogProps) => {
  const [formData, setFormData] = useState<Partial<Company>>({});
  const [modules, setModules] = useState<CompanyModules>({
    projects: true,
    finance: false,
    sales: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        slug: company.slug || '',
        website: company.website || '',
        address: company.address || '',
        phone: company.phone || '',
        abn: company.abn || '',
        slogan: company.slogan || '',
        logo_url: company.logo_url || '',
      });
    }
  }, [company]);

  const handleInputChange = (field: keyof Company, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleModuleToggle = (module: keyof CompanyModules, enabled: boolean) => {
    setModules(prev => ({ ...prev, [module]: enabled }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  if (!company) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Building2 className="w-5 h-5" />
            <span>Edit Company</span>
          </DialogTitle>
          <DialogDescription>
            Update company details and configure available modules
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Company Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Company Information</CardTitle>
              <CardDescription>Basic company details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Company Name</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <Label htmlFor="slug">Company Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug || ''}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="company-slug"
                />
              </div>

              <div>
                <Label htmlFor="website" className="flex items-center space-x-1">
                  <Globe className="w-4 h-4" />
                  <span>Website</span>
                </Label>
                <Input
                  id="website"
                  value={formData.website || ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="flex items-center space-x-1">
                  <Phone className="w-4 h-4" />
                  <span>Phone</span>
                </Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <Label htmlFor="address" className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>Address</span>
                </Label>
                <Textarea
                  id="address"
                  value={formData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter company address"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="abn" className="flex items-center space-x-1">
                  <Hash className="w-4 h-4" />
                  <span>ABN</span>
                </Label>
                <Input
                  id="abn"
                  value={formData.abn || ''}
                  onChange={(e) => handleInputChange('abn', e.target.value)}
                  placeholder="12 345 678 901"
                />
              </div>

              <div>
                <Label htmlFor="slogan" className="flex items-center space-x-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>Company Slogan</span>
                </Label>
                <Input
                  id="slogan"
                  value={formData.slogan || ''}
                  onChange={(e) => handleInputChange('slogan', e.target.value)}
                  placeholder="Enter company slogan"
                />
              </div>

              <div>
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  value={formData.logo_url || ''}
                  onChange={(e) => handleInputChange('logo_url', e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </CardContent>
          </Card>

          {/* Company Modules */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Company Modules</CardTitle>
              <CardDescription>Enable or disable features for this company</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FolderKanban className="w-5 h-5 text-blue-600" />
                    <div>
                      <Label className="text-sm font-medium">Projects</Label>
                      <p className="text-xs text-slate-500">Project management and tracking</p>
                    </div>
                  </div>
                  <Switch
                    checked={modules.projects}
                    onCheckedChange={(checked) => handleModuleToggle('projects', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <div>
                      <Label className="text-sm font-medium">Finance</Label>
                      <p className="text-xs text-slate-500">Financial management and accounting</p>
                    </div>
                  </div>
                  <Switch
                    checked={modules.finance}
                    onCheckedChange={(checked) => handleModuleToggle('finance', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <div>
                      <Label className="text-sm font-medium">Sales</Label>
                      <p className="text-xs text-slate-500">Sales management and CRM</p>
                    </div>
                  </div>
                  <Switch
                    checked={modules.sales}
                    onCheckedChange={(checked) => handleModuleToggle('sales', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};