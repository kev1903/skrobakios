import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Search, Plus, Filter, ArrowLeft, LayoutDashboard, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCompanies } from '@/hooks/useCompanies';
import { useUserRole } from '@/hooks/useUserRole';
import { Company } from '@/types/company';
import { BusinessesTable } from '@/components/companies/BusinessesTable';
import { BusinessEditDialog } from '@/components/companies/BusinessEditDialog';
import { BusinessesDashboard } from '@/components/business/BusinessesDashboard';
import { useToast } from '@/hooks/use-toast';
import { useCompany } from '@/contexts/CompanyContext';

interface BusinessManagementPageProps {
  onNavigate?: (page: string) => void;
  onNavigateBack?: () => void;
}

export const BusinessManagementPage = ({ onNavigate, onNavigateBack }: BusinessManagementPageProps) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const { updateCompany } = useCompanies();
  const { isSuperAdmin, isPlatformAdmin } = useUserRole();
  const { toast } = useToast();
  const navigate = useNavigate();

  const canManageCompanies = isSuperAdmin() || isPlatformAdmin();

  const { companies: userCompaniesCtx, loading: companyLoading } = useCompany();

  useEffect(() => {
    setLoading(companyLoading);
    try {
      // Filter out auto-generated personal companies (email@domain.com's Company pattern)
      const businessCompanies = userCompaniesCtx.filter(uc => {
        const isPersonalCompany = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'s Company$/i.test(uc.name);
        return !isPersonalCompany;
      });

      // Convert UserCompany to Company format for the table
      const companyData: Company[] = businessCompanies.map(uc => ({
        id: uc.id,
        name: uc.name,
        slug: uc.slug,
        logo_url: uc.logo_url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        website: '',
        address: '',
        phone: '',
        abn: '',
        slogan: '',
        created_by: ''
      }));

      setCompanies(companyData);
      setFilteredCompanies(companyData);
    } catch (error) {
      console.error('Error processing companies:', error);
      toast({
        title: 'Error',
        description: 'Failed to load companies',
        variant: 'destructive'
      });
    }
  }, [userCompaniesCtx, companyLoading, toast]);

  // Filter companies based on search term
  useEffect(() => {
    const filtered = companies.filter(company =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.website?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCompanies(filtered);
  }, [searchTerm, companies]);

  const handleEditCompany = (company: Company) => {
    navigate(`/company/${company.id}/edit`);
  };

  const handleSaveCompany = async (updatedCompany: Partial<Company>) => {
    if (!selectedCompany) return;

    try {
      const result = await updateCompany(selectedCompany.id, updatedCompany);
      if (result) {
        // Update local state
        setCompanies(prev => prev.map(company => 
          company.id === selectedCompany.id ? { ...company, ...result } : company
        ));
        toast({
          title: "Success",
          description: "Company updated successfully"
        });
        setIsEditDialogOpen(false);
        setSelectedCompany(null);
      }
    } catch (error) {
      console.error('Error updating company:', error);
      toast({
        title: "Error",
        description: "Failed to update company",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCompany = async (companyId: string) => {
    // Remove the deleted company from local state
    setCompanies(prev => prev.filter(company => company.id !== companyId));
    setSelectedCompany(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card/60 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate?.('platform-dashboard')}
                className="flex items-center space-x-2 text-muted-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-accent rounded-lg">
                  <Building2 className="w-6 h-6 text-accent-foreground" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Business Dashboard</h1>
              </div>
            </div>
            {canManageCompanies && (
              <Button 
                className="bg-primary text-primary-foreground"
                onClick={() => onNavigate?.('create-business')}
              >
                <Plus className="w-4 h-4 mr-2" />
                CREATE BUSINESS
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-card border border-border">
              <TabsTrigger value="dashboard" className="flex items-center space-x-2">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="table" className="flex items-center space-x-2">
                <List className="w-4 h-4" />
                <span>Table View</span>
              </TabsTrigger>
            </TabsList>
            <span className="text-sm text-muted-foreground">{filteredCompanies.length} businesses</span>
          </div>

          <TabsContent value="dashboard" className="space-y-6 mt-0">
            <BusinessesDashboard onNavigate={onNavigate} />
          </TabsContent>

          <TabsContent value="table" className="space-y-6 mt-0">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search businesses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80 bg-input border-border"
                  />
                </div>
                <Button variant="outline" size="sm" className="bg-card border-border">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
            
            <BusinessesTable
              companies={filteredCompanies}
              onEditCompany={handleEditCompany}
              loading={loading}
              canManageCompanies={canManageCompanies}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Dialog */}
      <BusinessEditDialog
        company={selectedCompany}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveCompany}
        onDelete={handleDeleteCompany}
      />
    </div>
  );
};