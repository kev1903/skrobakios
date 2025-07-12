import React, { useState, useEffect } from 'react';
import { ArrowLeft, Building2, Users, Shield, Settings, Bell, Palette, Plug, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useCompanies } from '@/hooks/useCompanies';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import { Company } from '@/types/company';
import { CompanyDetailsForm } from '@/components/company-edit/CompanyDetailsForm';
import { CompanyRolesSection } from '@/components/company-edit/CompanyRolesSection';
import { CompanyPermissionsSection } from '@/components/company-edit/CompanyPermissionsSection';
import { CompanyRolesTab } from '@/components/company/settings/CompanyRolesTab';
import { CompanyIntegrationsTab } from '@/components/company/settings/CompanyIntegrationsTab';
import { CompanyUserManagement } from '@/components/company/settings/CompanyUserManagement';

interface CompanyEditPageProps {
  companyId: string;
  onNavigateBack: () => void;
}

export const CompanyEditPage = ({ companyId, onNavigateBack }: CompanyEditPageProps) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const { getCompany, updateCompany } = useCompanies();
  const { toast } = useToast();
  const { isSuperAdmin } = useUserRole();

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const companyData = await getCompany(companyId);
        setCompany(companyData);
      } catch (error) {
        console.error('Error fetching company:', error);
        toast({
          title: "Error",
          description: "Failed to load company details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchCompany();
    }
  }, [companyId, getCompany, toast]);

  const handleSaveCompany = async (updatedData: Partial<Company>) => {
    if (!company) return;

    setSaving(true);
    try {
      const result = await updateCompany(company.id, updatedData);
      if (result) {
        setCompany(result);
        toast({
          title: "Success",
          description: "Company updated successfully"
        });
      }
    } catch (error) {
      console.error('Error updating company:', error);
      toast({
        title: "Error",
        description: "Failed to update company",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center">
        <div className="text-slate-600">Loading company details...</div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-slate-600 mb-4">Company not found</div>
          <Button onClick={onNavigateBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-xl border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={onNavigateBack}
                variant="ghost"
                size="sm"
                className="text-slate-600 hover:text-slate-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">{company.name}</h1>
                  <p className="text-slate-600">Company Management</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="w-full overflow-x-auto">
            <TabsList className={`flex w-full min-w-fit ${isSuperAdmin() ? 'grid-cols-8' : 'grid-cols-7'} md:grid backdrop-blur-sm bg-white/60 p-1`}>
              <TabsTrigger value="details" className="flex items-center justify-center space-x-1 md:space-x-2 px-2 md:px-3 py-2 whitespace-nowrap">
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

          <TabsContent value="details" className="space-y-6">
            <CompanyDetailsForm
              company={company}
              onSave={handleSaveCompany}
              saving={saving}
            />
          </TabsContent>

          <TabsContent value="general" className="space-y-4 md:space-y-6">
            <Card className="backdrop-blur-sm bg-white/60 border-white/30">
              <CardHeader className="pb-4 md:pb-6">
                <CardTitle className="text-lg md:text-xl">General Settings</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Configure general preferences for {company?.name}
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
                  Configure notification preferences for {company?.name}
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
                  Customize the look and feel for {company?.name}
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
                  </CardTitle>
                  <CardDescription className="text-sm md:text-base">
                    Super admin controls for {company?.name}
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
    </div>
  );
};