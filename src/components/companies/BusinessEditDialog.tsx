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
import { Building2, Globe, MapPin, Phone, Hash, MessageSquare, FolderKanban, DollarSign, TrendingUp, Trash2 } from 'lucide-react';
import { Company } from '@/types/company';
import { useUserRole } from '@/hooks/useUserRole';
import { useCompanies } from '@/hooks/useCompanies';
import { useToast } from '@/hooks/use-toast';

interface BusinessEditDialogProps {
  company: Company | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedCompany: Partial<Company>) => void;
  onDelete?: (companyId: string) => void;
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
  onSave,
  onDelete
}: BusinessEditDialogProps) => {
  const [formData, setFormData] = useState<Partial<Company>>({});
  const [modules, setModules] = useState<CompanyModules>({
    projects: true,
    finance: false,
    sales: false,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { isSuperAdmin } = useUserRole();
  const { deleteCompany } = useCompanies();
  const { toast } = useToast();

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

  const handleDelete = async () => {
    if (!company?.id) return;
    
    setDeleting(true);
    try {
      await deleteCompany(company.id);
      toast({
        title: "Business deleted",
        description: "The business has been successfully deleted from the database.",
      });
      onDelete?.(company.id);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete business",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
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

        <DialogFooter className="flex justify-between">
          <div>
            {isSuperAdmin() && (
              <Button 
                variant="destructive" 
                onClick={handleDelete} 
                disabled={saving || deleting}
                className="flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>{deleting ? 'Deleting...' : 'Delete Business'}</span>
              </Button>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving || deleting}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || deleting}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};