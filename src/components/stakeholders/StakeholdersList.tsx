import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  CheckCircle,
  Clock,
  AlertTriangle,
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

  const renderAvatar = (name: string, category: string) => {
    const IconComponent = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || Building2;
    const initials = name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <div className="w-8 h-8 bg-slate-100 rounded-md flex items-center justify-center text-xs font-medium text-slate-600">
        {initials}
      </div>
    );
  };

  const getComplianceBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Valid</Badge>;
      case 'expiring':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Expiring</Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Expired</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">Inactive</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-4 p-6">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-slate-600" />
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Stakeholders
              {selectedCategory && <span className="text-slate-500 font-normal"> • {selectedCategory}</span>}
            </h1>
            <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
              <span>{stakeholders.filter(s => s.compliance_status === 'valid').length} Compliant</span>
              <span>•</span>
              <span>{stakeholders.filter(s => s.status === 'active').length} Active</span>
              <span>•</span>  
              <span>{stakeholders.filter(s => s.compliance_status === 'expiring').length} Expiring</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <FileText className="h-4 w-4" />
            Export
          </Button>
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add Stakeholder
          </Button>
        </div>
      </div>

      {/* Compact Search and Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search stakeholders by name, email, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 min-w-[120px]">
              <Filter className="h-4 w-4" />
              {selectedCategory ? selectedCategory : 'All Categories'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuCheckboxItem
              checked={selectedCategory === ''}
              onCheckedChange={(checked) => checked && setSelectedCategory('')}
            >
              All Categories
            </DropdownMenuCheckboxItem>
            {['client', 'trade', 'subcontractor', 'supplier', 'consultant'].map((category) => (
              <DropdownMenuCheckboxItem
                key={category}
                checked={selectedCategory === category}
                onCheckedChange={(checked) => setSelectedCategory(checked ? category : '')}
                className="capitalize"
              >
                {category}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {selectedStakeholders.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Actions ({selectedStakeholders.length})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleBulkAction('activate')}>
                Mark as Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction('deactivate')}>
                Mark as Inactive
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                Remove Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Compact Table */}
      <div className="border rounded-lg bg-white">
        <div className="flex items-center justify-between px-4 py-2 border-b bg-slate-50">
          <span className="text-sm font-medium">
            {filteredStakeholders.length} Stakeholders
          </span>
          {selectedStakeholders.length > 0 && (
            <span className="text-xs text-slate-500">
              {selectedStakeholders.length} selected
            </span>
          )}
        </div>
        
        <Table>
          <TableHeader>
            <TableRow className="border-b">
              <TableHead className="w-8">
                <input
                  type="checkbox"
                  className="rounded border-slate-300"
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
              <TableHead className="text-xs font-medium text-slate-600">Company</TableHead>
              <TableHead className="text-xs font-medium text-slate-600">Category</TableHead>
              <TableHead className="text-xs font-medium text-slate-600">Contact</TableHead>
              <TableHead className="text-xs font-medium text-slate-600 text-center w-16">Projects</TableHead>
              <TableHead className="text-xs font-medium text-slate-600">Compliance</TableHead>
              <TableHead className="text-xs font-medium text-slate-600">Status</TableHead>
              <TableHead className="w-8"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-slate-500">Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredStakeholders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="w-8 h-8 text-slate-400" />
                    <p className="text-sm text-slate-500">
                      {searchTerm ? 'No stakeholders found' : 'No stakeholders yet'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredStakeholders.map((stakeholder) => (
                <TableRow
                  key={stakeholder.id}
                  className="hover:bg-slate-50 cursor-pointer"
                  onClick={() => onStakeholderSelect(stakeholder.id)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="rounded border-slate-300"
                      checked={selectedStakeholders.includes(stakeholder.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStakeholders([...selectedStakeholders, stakeholder.id]);
                        } else {
                          setSelectedStakeholders(selectedStakeholders.filter(id => id !== stakeholder.id));
                        }
                      }}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {renderAvatar(stakeholder.display_name, stakeholder.category)}
                      <div>
                        <p className="font-medium text-sm">{stakeholder.display_name}</p>
                        {stakeholder.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {stakeholder.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">
                                {tag}
                              </Badge>
                            ))}
                            {stakeholder.tags.length > 2 && (
                              <span className="text-xs text-slate-500">+{stakeholder.tags.length - 2}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className="capitalize text-xs">
                      {stakeholder.category}
                    </Badge>
                    {stakeholder.trade_industry && (
                      <p className="text-xs text-slate-500 mt-1">{stakeholder.trade_industry}</p>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      {stakeholder.primary_contact_name && (
                        <p className="text-sm font-medium">{stakeholder.primary_contact_name}</p>
                      )}
                      {stakeholder.primary_email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span className="text-xs text-slate-600">{stakeholder.primary_email}</span>
                        </div>
                      )}
                      {stakeholder.primary_phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span className="text-xs text-slate-600">{stakeholder.primary_phone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    <span className="text-sm font-medium">{stakeholder.active_projects_count || 0}</span>
                  </TableCell>

                  <TableCell>
                    {getComplianceBadge(stakeholder.compliance_status)}
                  </TableCell>

                  <TableCell>
                    {getStatusBadge(stakeholder.status)}
                  </TableCell>

                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};