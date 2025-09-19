import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Search, MoreHorizontal, Plus, Users, UserPlus, Trash2, Edit } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Company } from '@/types/company';
import { EnhancedCompanyUserManagement } from '@/components/company/EnhancedCompanyUserManagement';

export const CompanyManagementPanel: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showTeamManagement, setShowTeamManagement] = useState(false);
  const [showBusinessAdminDialog, setShowBusinessAdminDialog] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slogan: '',
    phone: '',
    address: '',
    website: '',
  });
  const { toast } = useToast();

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .select(`
          *,
          company_members!inner(count),
          projects(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process the data to add counts
      const processedCompanies = data?.map(company => ({
        ...company,
        member_count: company.company_members?.[0]?.count || 0,
        project_count: company.projects?.[0]?.count || 0
      })) || [];

      setCompanies(processedCompanies);
    } catch (error: any) {
      console.error('Error fetching companies:', error);
      toast({
        title: "Error",
        description: "Failed to fetch companies",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Business name is required",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      // Get current user first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to create a company');
      }

      // Generate slug from name
      const slug = formData.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') + 
        '-' + Date.now();

      const { data: company, error } = await supabase
        .from('companies')
        .insert({
          name: formData.name.trim(),
          slug,
          slogan: formData.slogan.trim() || null,
          phone: formData.phone.trim() || null,
          address: formData.address.trim() || null,
          website: formData.website.trim() || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Add current user as owner of the new company
      const { error: memberError } = await supabase
        .from('company_members')
        .insert({
          company_id: company.id,
          user_id: user.id,
          role: 'owner',
          status: 'active',
        });

      if (memberError) throw memberError;

      // Get all superadmins and add them to the company with owner access
      const { data: superAdmins, error: superAdminError } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          profiles!inner(
            user_id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('role', 'superadmin');

      if (superAdminError) {
        console.error('Error fetching superadmins:', superAdminError);
      } else if (superAdmins && superAdmins.length > 0) {
        // Add all superadmins as owners to the company (excluding current user to avoid duplicates)
        const superAdminMembers = superAdmins
          .filter(admin => admin.user_id !== user.id)
          .map(admin => ({
            company_id: company.id,
            user_id: admin.user_id,
            role: 'owner', // Superadmins get owner role for full business control
            status: 'active',
          }));

        if (superAdminMembers.length > 0) {
          const { error: superAdminMemberError } = await supabase
            .from('company_members')
            .insert(superAdminMembers);

          if (superAdminMemberError) {
            console.error('Error adding superadmins to company:', superAdminMemberError);
            // Don't throw error here as the main company creation was successful
          }
        }
      }

      toast({
        title: "Success",
        description: "Business created successfully!",
      });

      // Reset form and close dialog
      setFormData({
        name: '',
        slogan: '',
        phone: '',
        address: '',
        website: '',
      });
      setIsCreateDialogOpen(false);
      
      // Refresh companies list
      fetchCompanies();

    } catch (error: any) {
      console.error('Error creating company:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create business",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDeleteBusiness = async (company: Company) => {
    setIsDeleting(true);
    
    try {
      const { data, error } = await supabase.rpc('delete_company_completely', {
        target_company_id: company.id
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; message?: string };
      
      if (result && !result.success) {
        throw new Error(result.error || 'Failed to delete company');
      }

      toast({
        title: "Success",
        description: `Business "${company.name}" has been deleted successfully`,
      });

      // Refresh companies list
      fetchCompanies();
      setCompanyToDelete(null);

    } catch (error: any) {
      console.error('Error deleting company:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete business",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };


  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading companies...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Business Management
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{companies.length} Businesses</Badge>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Business
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search businesses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="space-y-4">
          {filteredCompanies.map((company) => (
            <div key={company.id} className="border border-border/40 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={company.logo_url || ''} alt={company.name} />
                    <AvatarFallback>
                      {company.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                   <div>
                     <h3 
                       className="font-semibold cursor-pointer hover:text-primary transition-colors"
                       onClick={() => {
                         setSelectedCompany(company);
                         setShowBusinessAdminDialog(true);
                       }}
                     >
                       {company.name}
                     </h3>
                   </div>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-sm font-medium">{company.member_count || 0}</p>
                    <p className="text-xs text-muted-foreground">Members</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{company.project_count || 0}</p>
                    <p className="text-xs text-muted-foreground">Projects</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setSelectedCompany(company);
                        setShowTeamManagement(true);
                      }}
                      title="Manage Team"
                    >
                      <Users className="h-4 w-4 mr-1" />
                      Team
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" title="More Options">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedCompany(company);
                            setShowBusinessAdminDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Business
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setCompanyToDelete(company)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Business
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredCompanies.length === 0 && (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Businesses Found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'No businesses match your search criteria.' : 'No businesses have been created yet.'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    {/* Create Business Dialog */}
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Business</DialogTitle>
          <DialogDescription>
            Create a new business and automatically add all superadmins as owners.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleCreateBusiness} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Business Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter business name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slogan">Slogan</Label>
            <Input
              id="slogan"
              value={formData.slogan}
              onChange={(e) => handleInputChange('slogan', e.target.value)}
              placeholder="Your business slogan"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+61 4 1234 5678"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Business address"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Business'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    {/* Business Admin Creation Dialog */}
    {selectedCompany && (
      <Dialog open={showBusinessAdminDialog} onOpenChange={setShowBusinessAdminDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              {selectedCompany.name} - Create Business Admins
            </DialogTitle>
            <DialogDescription>
              Create and assign business administrators for this company.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            <EnhancedCompanyUserManagement 
              companyId={selectedCompany.id}
              companyName={selectedCompany.name}
            />
          </div>
        </DialogContent>
      </Dialog>
    )}

    {/* Team Management Dialog */}
    {selectedCompany && (
      <Dialog open={showTeamManagement} onOpenChange={setShowTeamManagement}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {selectedCompany.name} - Team Management
            </DialogTitle>
            <DialogDescription>
              Manage team members, assign business admins, and control access for this business.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            <EnhancedCompanyUserManagement 
              companyId={selectedCompany.id}
              companyName={selectedCompany.name}
            />
          </div>
        </DialogContent>
      </Dialog>
    )}

    {/* Delete Confirmation Dialog */}
    <AlertDialog open={!!companyToDelete} onOpenChange={() => setCompanyToDelete(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Business</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{companyToDelete?.name}</strong>? This action cannot be undone and will:
            <br /><br />
            • Delete all company data including projects, members, and related records
            <br />
            • Remove all associated user permissions and roles
            <br />
            • Permanently destroy all business information
            <br /><br />
            <strong>This is a destructive operation that cannot be reversed.</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => companyToDelete && handleDeleteBusiness(companyToDelete)}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting...' : 'Delete Business'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
};