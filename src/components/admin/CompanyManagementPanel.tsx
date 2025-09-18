import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Search, MoreHorizontal, Users, Settings, Ban, Zap } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BusinessCleanupPanel } from './BusinessCleanupPanel';
import { Company } from '@/types/company';

export const CompanyManagementPanel: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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

  const handleToggleVerification = async (companyId: string, verified: boolean) => {
    try {
      const { error } = await supabase
        .from('companies')
        .update({ verified: !verified })
        .eq('id', companyId);

      if (error) throw error;

      await fetchCompanies();
      toast({
        title: "Success",
        description: `Company ${!verified ? 'verified' : 'unverified'} successfully`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update company verification",
        variant: "destructive"
      });
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
    <Card className="glass-panel">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Business Management
          </CardTitle>
          <Badge variant="secondary">{companies.length} Businesses</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Business List</TabsTrigger>
            <TabsTrigger value="cleanup">
              <Zap className="h-4 w-4 mr-2" />
              Data Cleanup
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
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
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{company.name}</h3>
                          {company.verified && (
                            <Badge variant="default" className="text-xs">Verified</Badge>
                          )}
                          {!company.public_page && (
                            <Badge variant="secondary" className="text-xs">Private</Badge>
                          )}
                          {!company.onboarding_completed && (
                            <Badge variant="outline" className="text-xs">Incomplete</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">/{company.slug}</p>
                        {company.website && (
                          <p className="text-xs text-muted-foreground">{company.website}</p>
                        )}
                        {company.abn && (
                          <p className="text-xs text-muted-foreground">ABN: {company.abn}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm font-medium">{company.member_count || 0}</p>
                        <p className="text-xs text-muted-foreground">Members</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">{company.project_count || 0}</p>
                        <p className="text-xs text-muted-foreground">Projects</p>
                      </div>
                      <div className="text-center">
                        <Badge variant="outline" className="text-xs">
                          {company.subscription_tier || 'FREE'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleVerification(company.id, company.verified)}
                        >
                          {company.verified ? <Ban className="h-4 w-4" /> : <Badge className="h-4 w-4" />}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Users className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Created: {new Date(company.created_at).toLocaleDateString()}</span>
                    <div className="flex items-center gap-4">
                      <span>Type: {company.business_type || 'company'}</span>
                      <span>Onboarded: {company.onboarding_completed ? 'Yes' : 'No'}</span>
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
          </TabsContent>

          <TabsContent value="cleanup">
            <BusinessCleanupPanel />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};