import React, { useState, useEffect } from 'react';
import { ArrowLeft, Building2, Users, Shield, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCompanies } from '@/hooks/useCompanies';
import { useToast } from '@/hooks/use-toast';
import { Company } from '@/types/company';
import { CompanyDetailsForm } from '@/components/company-edit/CompanyDetailsForm';
import { CompanyRolesSection } from '@/components/company-edit/CompanyRolesSection';
import { CompanyPermissionsSection } from '@/components/company-edit/CompanyPermissionsSection';

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
          <TabsList className="grid w-full grid-cols-3 bg-white/60 backdrop-blur-xl border border-white/20">
            <TabsTrigger value="details" className="flex items-center space-x-2">
              <Building2 className="w-4 h-4" />
              <span>Company Details</span>
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Roles & Members</span>
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Permissions</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <CompanyDetailsForm
              company={company}
              onSave={handleSaveCompany}
              saving={saving}
            />
          </TabsContent>

          <TabsContent value="roles" className="space-y-6">
            <CompanyRolesSection
              companyId={company.id}
            />
          </TabsContent>

          <TabsContent value="permissions" className="space-y-6">
            <CompanyPermissionsSection
              companyId={company.id}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};