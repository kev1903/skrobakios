import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Search, Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCompanies } from '@/hooks/useCompanies';
import { useUserRole } from '@/hooks/useUserRole';
import { Company } from '@/types/company';
import { CompaniesTable } from '@/components/companies/CompaniesTable';
import { CompanyEditDialog } from '@/components/companies/CompanyEditDialog';
import { useToast } from '@/hooks/use-toast';

interface CompanyManagementPageProps {
  onNavigate?: (page: string) => void;
  onNavigateBack?: () => void;
}

export const CompanyManagementPage = ({ onNavigate, onNavigateBack }: CompanyManagementPageProps) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const { getUserCompanies, updateCompany } = useCompanies();
  const { isSuperAdmin, isPlatformAdmin } = useUserRole();
  const { toast } = useToast();
  const navigate = useNavigate();

  const canManageCompanies = isSuperAdmin() || isPlatformAdmin();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const userCompanies = await getUserCompanies();
        
        // Convert UserCompany to Company format for the table
        const companyData: Company[] = userCompanies.map(uc => ({
          id: uc.id,
          name: uc.name,
          slug: uc.slug,
          logo_url: uc.logo_url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // Add default values for missing fields
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
        console.error('Error fetching companies:', error);
        toast({
          title: "Error",
          description: "Failed to load companies",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [getUserCompanies, toast]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-xl border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800">Company Management</h1>
            </div>
            {canManageCompanies && (
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                CREATE COMPANY
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
          <span className="text-sm text-slate-600">{filteredCompanies.length} companies</span>
        </div>
        
        <CompaniesTable
          companies={filteredCompanies}
          onEditCompany={handleEditCompany}
          loading={loading}
          canManageCompanies={canManageCompanies}
        />
      </div>

      {/* Edit Dialog */}
      <CompanyEditDialog
        company={selectedCompany}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveCompany}
      />
    </div>
  );
};