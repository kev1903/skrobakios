import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal,
  Users,
  Building2,
  Wrench,
  Truck,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Mail,
  Phone,
  FileText
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';
import { toast } from 'sonner';

interface Stakeholder {
  id: string;
  display_name: string;
  category: 'client' | 'trade' | 'subcontractor' | 'supplier' | 'consultant';
  trade_industry?: string;
  primary_contact_name?: string;
  primary_email?: string;
  primary_phone?: string;
  status: 'active' | 'inactive' | 'pending';
  compliance_status: 'valid' | 'expired' | 'expiring';
  tags: string[];
  active_projects_count?: number;
}

interface StakeholdersListProps {
  categoryFilter?: string;
  onStakeholderSelect: (stakeholderId: string) => void;
}

const CATEGORY_ICONS = {
  client: Users,
  trade: Wrench,
  subcontractor: Building2,
  supplier: Truck,
  consultant: Lightbulb,
};

export const StakeholdersList: React.FC<StakeholdersListProps> = ({
  categoryFilter,
  onStakeholderSelect,
}) => {
  const { currentCompany } = useCompany();
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryFilter || '');
  const [statusFilter, setStatusFilter] = useState<string[]>(['active']);
  const [complianceFilter, setComplianceFilter] = useState<string[]>([]);
  const [selectedStakeholders, setSelectedStakeholders] = useState<string[]>([]);

  useEffect(() => {
    if (currentCompany) {
      fetchStakeholders();
    }
  }, [currentCompany, selectedCategory, statusFilter, complianceFilter]);

  const fetchStakeholders = async () => {
    try {
      setLoading(true);
      
      if (!currentCompany?.id) {
        console.error('No current company found');
        setStakeholders([]);
        return;
      }

      console.log('🔍 Fetching stakeholders for company:', currentCompany.id);

      // Get stakeholders with optional project roles count
      let query = supabase
        .from('stakeholders')
        .select(`
          *,
          stakeholder_project_roles(count)
        `)
        .eq('company_id', currentCompany.id);

      if (selectedCategory) {
        query = query.eq('category', selectedCategory as 'client' | 'trade' | 'subcontractor' | 'supplier' | 'consultant');
      }

      if (statusFilter.length > 0) {
        query = query.in('status', statusFilter as ('active' | 'inactive' | 'pending')[]);
      }

      if (complianceFilter.length > 0) {
        query = query.in('compliance_status', complianceFilter as ('valid' | 'expired' | 'expiring')[]);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Stakeholders query error:', error);
        throw error;
      }

      console.log('📊 Raw stakeholders fetched:', data?.length || 0);
      console.log('📝 Stakeholders data:', data);

      // Process the data to include active projects count
      const processedData = data?.map(stakeholder => ({
        ...stakeholder,
        active_projects_count: stakeholder.stakeholder_project_roles?.[0]?.count || 0,
      })) || [];

      console.log('✅ Processed stakeholders:', processedData);
      setStakeholders(processedData);
    } catch (error) {
      console.error('Error fetching stakeholders:', error);
      toast.error('Failed to load stakeholders');
    } finally {
      setLoading(false);
    }
  };

  const filteredStakeholders = stakeholders.filter(stakeholder => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      stakeholder.display_name.toLowerCase().includes(searchLower) ||
      stakeholder.primary_email?.toLowerCase().includes(searchLower) ||
      stakeholder.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });

  const handleBulkAction = async (action: string) => {
    if (selectedStakeholders.length === 0) {
      toast.error('Please select stakeholders first');
      return;
    }

    try {
      switch (action) {
        case 'activate':
          await supabase
            .from('stakeholders')
            .update({ status: 'active' })
            .in('id', selectedStakeholders);
          toast.success('Stakeholders activated');
          break;
        case 'deactivate':
          await supabase
            .from('stakeholders')
            .update({ status: 'inactive' })
            .in('id', selectedStakeholders);
          toast.success('Stakeholders deactivated');
          break;
      }
      
      setSelectedStakeholders([]);
      fetchStakeholders();
    } catch (error) {
      console.error('Bulk action error:', error);
      toast.error('Failed to perform bulk action');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.15)_1px,transparent_0)] bg-[length:24px_24px] pointer-events-none" />
      
      <div className="relative z-10 space-y-8 p-8">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Stakeholders
                  {selectedCategory && (
                    <span className="text-slate-500 ml-2 text-2xl">
                      — {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}s
                    </span>
                  )}
                </h1>
                <p className="text-slate-600 font-medium">
                  Manage your project stakeholders, contacts, and compliance tracking
                </p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-sm font-medium text-slate-600">
                  {stakeholders.filter(s => s.compliance_status === 'valid').length} Compliant
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-sm font-medium text-slate-600">
                  {stakeholders.filter(s => s.status === 'active').length} Active
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <span className="text-sm font-medium text-slate-600">
                  {stakeholders.filter(s => s.compliance_status === 'expiring').length} Expiring Soon
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2 bg-white/60 backdrop-blur-sm border-slate-200 hover:bg-white/80">
              <FileText className="h-4 w-4" />
              Export
            </Button>
            <Button className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
              <Plus className="h-4 w-4" />
              Add Stakeholder
            </Button>
          </div>
        </div>

        {/* Enhanced Search and Filters */}
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search stakeholders by name, email, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 h-12 bg-white/80 border-slate-200 focus:border-blue-300 focus:ring-blue-100"
                />
              </div>

              {/* Category Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-12 px-4 bg-white/80 border-slate-200 hover:bg-white/90 min-w-[140px] justify-between">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      {selectedCategory ? (
                        <span className="capitalize">{selectedCategory}</span>
                      ) : (
                        'All Categories'
                      )}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white border-slate-200 shadow-xl z-50">
                  <DropdownMenuLabel className="px-3 py-2 text-xs font-medium text-slate-500">
                    Filter by Category
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={selectedCategory === ''}
                    onCheckedChange={(checked) => checked && setSelectedCategory('')}
                    className="px-3 py-2"
                  >
                    All Categories
                  </DropdownMenuCheckboxItem>
                  {['client', 'trade', 'subcontractor', 'supplier', 'consultant'].map((category) => (
                    <DropdownMenuCheckboxItem
                      key={category}
                      checked={selectedCategory === category}
                      onCheckedChange={(checked) => 
                        setSelectedCategory(checked ? category : '')
                      }
                      className="capitalize px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        {(() => {
                          const IconComponent = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS];
                          return <IconComponent className="w-4 h-4 text-slate-500" />;
                        })()}
                        {category}
                      </div>
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Bulk Actions */}
              {selectedStakeholders.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-12 px-4 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
                      Actions ({selectedStakeholders.length})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-white border-slate-200 shadow-xl z-50">
                    <DropdownMenuLabel className="px-3 py-2 text-xs font-medium text-slate-500">
                      Bulk Actions
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleBulkAction('activate')} className="px-3 py-2">
                      Mark as Active
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('deactivate')} className="px-3 py-2">
                      Mark as Inactive
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="px-3 py-2 text-red-600 hover:bg-red-50">
                      Remove Selected
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Professional Stakeholders Table */}
        <Card className="shadow-sm border-0 bg-white/60 backdrop-blur-sm">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100/50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium text-slate-700">
                    {filteredStakeholders.length} {filteredStakeholders.length === 1 ? 'Stakeholder' : 'Stakeholders'}
                  </span>
                </div>
                {selectedStakeholders.length > 0 && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {selectedStakeholders.length} selected
                  </Badge>
                )}
              </div>
              <div className="text-xs text-slate-500">
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b-0 bg-slate-50/50">
                    <TableHead className="w-12 pl-6">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedStakeholders.length === filteredStakeholders.length && filteredStakeholders.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStakeholders(filteredStakeholders.map(s => s.id));
                          } else {
                            setSelectedStakeholders([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">Company</TableHead>
                    <TableHead className="font-semibold text-slate-700">Category</TableHead>
                    <TableHead className="font-semibold text-slate-700">Specialization</TableHead>
                    <TableHead className="font-semibold text-slate-700">Contact</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-center">Projects</TableHead>
                    <TableHead className="font-semibold text-slate-700">Compliance</TableHead>
                    <TableHead className="font-semibold text-slate-700">Status</TableHead>
                    <TableHead className="w-12 pr-6"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-slate-500 font-medium">Loading stakeholders...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredStakeholders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-16">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                            <Users className="w-8 h-8 text-slate-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-800 mb-1">No stakeholders found</h3>
                            <p className="text-slate-500 text-sm">
                              {searchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first stakeholder'}
                            </p>
                          </div>
                          <Button className="gap-2 mt-2">
                            <Plus className="w-4 h-4" />
                            Add Stakeholder
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStakeholders.map((stakeholder) => (
                      <TableRow
                        key={stakeholder.id}
                        className="group cursor-pointer hover:bg-blue-50/50 transition-all duration-200 border-b border-slate-100"
                        onClick={() => onStakeholderSelect(stakeholder.id)}
                      >
                        <TableCell className="pl-6">
                          <input
                            type="checkbox"
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            checked={selectedStakeholders.includes(stakeholder.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              if (e.target.checked) {
                                setSelectedStakeholders([...selectedStakeholders, stakeholder.id]);
                              } else {
                                setSelectedStakeholders(selectedStakeholders.filter(id => id !== stakeholder.id));
                              }
                            }}
                          />
                        </TableCell>
                        
                        {/* Company Name & Tags */}
                        <TableCell className="py-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0">
                              <span className="text-blue-700 font-semibold text-sm">
                                {stakeholder.display_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-slate-800 mb-1 group-hover:text-blue-700 transition-colors">
                                {stakeholder.display_name}
                              </div>
                              {stakeholder.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {stakeholder.tags.slice(0, 3).map(tag => (
                                    <Badge 
                                      key={tag} 
                                      variant="outline" 
                                      className="text-xs px-2 py-0.5 bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                  {stakeholder.tags.length > 3 && (
                                    <Badge variant="outline" className="text-xs px-2 py-0.5 bg-slate-50 text-slate-600">
                                      +{stakeholder.tags.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Category */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {(() => {
                              const IconComponent = CATEGORY_ICONS[stakeholder.category as keyof typeof CATEGORY_ICONS];
                              return (
                                <>
                                  <div className="p-1.5 rounded-md bg-slate-100">
                                    <IconComponent className="w-3.5 h-3.5 text-slate-600" />
                                  </div>
                                  <span className="text-sm font-medium text-slate-700 capitalize">
                                    {stakeholder.category}
                                  </span>
                                </>
                              );
                            })()}
                          </div>
                        </TableCell>

                        {/* Trade/Industry */}
                        <TableCell>
                          <span className="text-sm text-slate-600 font-medium">
                            {stakeholder.trade_industry || '-'}
                          </span>
                        </TableCell>

                        {/* Contact Information - Compact */}
                        <TableCell>
                          <div className="space-y-1">
                            {stakeholder.primary_contact_name && (
                              <div className="flex items-center gap-2 text-sm">
                                <Users className="w-3.5 h-3.5 text-slate-400" />
                                <span className="font-medium text-slate-700">{stakeholder.primary_contact_name}</span>
                              </div>
                            )}
                            {stakeholder.primary_email && (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-slate-600 truncate">{stakeholder.primary_email}</span>
                              </div>
                            )}
                            {stakeholder.primary_phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-slate-600">{stakeholder.primary_phone}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* Active Projects */}
                        <TableCell className="text-center">
                          <Badge 
                            variant="secondary" 
                            className="bg-slate-100 text-slate-700 hover:bg-slate-200 min-w-[2rem] justify-center"
                          >
                            {stakeholder.active_projects_count || 0}
                          </Badge>
                        </TableCell>

                        {/* Enhanced Compliance */}
                        <TableCell>
                          {(() => {
                            switch (stakeholder.compliance_status) {
                              case 'expired':
                                return (
                                  <Badge className="gap-1.5 bg-red-100 text-red-700 border-red-200 hover:bg-red-200">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                    Expired
                                  </Badge>
                                );
                              case 'expiring':
                                return (
                                  <Badge className="gap-1.5 bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                    Expiring
                                  </Badge>
                                );
                              default:
                                return (
                                  <Badge className="gap-1.5 bg-green-100 text-green-700 border-green-200 hover:bg-green-200">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                    Valid
                                  </Badge>
                                );
                            }
                          })()}
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Badge
                            variant={stakeholder.status === 'active' ? 'default' : 'secondary'}
                            className={stakeholder.status === 'active' 
                              ? 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200' 
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                            }
                          >
                            {stakeholder.status}
                          </Badge>
                        </TableCell>

                        {/* Enhanced Actions */}
                        <TableCell className="pr-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 opacity-60 group-hover:opacity-100 hover:bg-slate-100 transition-all duration-200"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-200 shadow-lg z-50">
                              <DropdownMenuLabel className="text-xs font-medium text-slate-500 px-3 py-2">
                                Actions
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="gap-2 px-3 py-2 text-sm hover:bg-slate-50">
                                <Users className="w-4 h-4 text-slate-500" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 px-3 py-2 text-sm hover:bg-slate-50">
                                <MapPin className="w-4 h-4 text-slate-500" />
                                Edit Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 px-3 py-2 text-sm hover:bg-slate-50">
                                <Building2 className="w-4 h-4 text-slate-500" />
                                Add to Project
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                                <AlertTriangle className="w-4 h-4" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};