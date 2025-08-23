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
  Clock
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

const COMPLIANCE_COLORS = {
  valid: 'bg-green-500',
  expired: 'bg-red-500',
  expiring: 'bg-amber-500',
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
      let query = supabase
        .from('stakeholders')
        .select(`
          *,
          stakeholder_project_roles!inner(count)
        `)
        .eq('company_id', currentCompany?.id);

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

      if (error) throw error;

      // Process the data to include active projects count
      const processedData = data?.map(stakeholder => ({
        ...stakeholder,
        active_projects_count: stakeholder.stakeholder_project_roles?.length || 0,
      })) || [];

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

  const getComplianceBadge = (status: string) => {
    switch (status) {
      case 'expired':
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Expired
          </Badge>
        );
      case 'expiring':
        return (
          <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-800">
            <Clock className="h-3 w-3" />
            Expiring
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1 bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3" />
            Valid
          </Badge>
        );
    }
  };

  const getCategoryDisplay = (category: string) => {
    const IconComponent = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS];
    return (
      <div className="flex items-center gap-2">
        <IconComponent className="h-4 w-4 text-muted-foreground" />
        <span className="capitalize">{category}</span>
      </div>
    );
  };

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
        // Add more bulk actions as needed
      }
      
      setSelectedStakeholders([]);
      fetchStakeholders();
    } catch (error) {
      console.error('Bulk action error:', error);
      toast.error('Failed to perform bulk action');
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Stakeholders
            {selectedCategory && (
              <span className="text-muted-foreground ml-2">
                - {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}s
              </span>
            )}
          </h1>
          <p className="text-muted-foreground">
            Manage your project stakeholders, contacts, and compliance
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Stakeholder
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="p-2">
              <div className="text-sm font-medium mb-2">Category</div>
              {['client', 'trade', 'subcontractor', 'supplier', 'consultant'].map((category) => (
                <DropdownMenuCheckboxItem
                  key={category}
                  checked={selectedCategory === category}
                  onCheckedChange={(checked) => 
                    setSelectedCategory(checked ? category : '')
                  }
                  className="capitalize"
                >
                  {category}
                </DropdownMenuCheckboxItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Bulk Actions */}
        {selectedStakeholders.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Bulk Actions ({selectedStakeholders.length})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleBulkAction('activate')}>
                Mark Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction('deactivate')}>
                Mark Inactive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Stakeholders Table */}
      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={selectedStakeholders.length === filteredStakeholders.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedStakeholders(filteredStakeholders.map(s => s.id));
                    } else {
                      setSelectedStakeholders([]);
                    }
                  }}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Trade/Industry</TableHead>
              <TableHead>Primary Contact</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Active Projects</TableHead>
              <TableHead>Compliance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                  Loading stakeholders...
                </TableCell>
              </TableRow>
            ) : filteredStakeholders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                  No stakeholders found
                </TableCell>
              </TableRow>
            ) : (
              filteredStakeholders.map((stakeholder) => (
                <TableRow
                  key={stakeholder.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onStakeholderSelect(stakeholder.id)}
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
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
                  <TableCell className="font-medium">
                    <div>
                      <div>{stakeholder.display_name}</div>
                      {stakeholder.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {stakeholder.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {stakeholder.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{stakeholder.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getCategoryDisplay(stakeholder.category)}</TableCell>
                  <TableCell>{stakeholder.trade_industry || '-'}</TableCell>
                  <TableCell>{stakeholder.primary_contact_name || '-'}</TableCell>
                  <TableCell>{stakeholder.primary_email || '-'}</TableCell>
                  <TableCell>{stakeholder.primary_phone || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {stakeholder.active_projects_count || 0}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getComplianceBadge(stakeholder.compliance_status)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={stakeholder.status === 'active' ? 'default' : 'secondary'}
                    >
                      {stakeholder.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Add to Project</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Delete
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
    </div>
  );
};