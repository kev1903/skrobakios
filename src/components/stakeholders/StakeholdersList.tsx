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
import { useScreenSize } from '@/hooks/use-mobile';
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
  FileText,
  Download,
  Upload
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';
import { toast } from 'sonner';
import { AddStakeholderDialog } from '@/components/stakeholders/AddStakeholderDialog';

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
  tags?: string[] | null;
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
  const screenSize = useScreenSize();
  const isMobile = screenSize === 'mobile';
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryFilter || '');
  const [statusFilter, setStatusFilter] = useState<string[]>(['active']);
  const [complianceFilter, setComplianceFilter] = useState<string[]>([]);
  const [selectedStakeholders, setSelectedStakeholders] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showImportDialog, setShowImportDialog] = useState(false);

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
    // Search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = (
        stakeholder.display_name?.toLowerCase().includes(searchLower) ||
        stakeholder.primary_email?.toLowerCase().includes(searchLower) ||
        (stakeholder.tags && Array.isArray(stakeholder.tags) && 
         stakeholder.tags.some(tag => tag && typeof tag === 'string' && tag.toLowerCase().includes(searchLower)))
      );
      if (!matchesSearch) return false;
    }

    // Tag filter
    if (selectedTags.length > 0) {
      const hasMatchingTag = selectedTags.some(selectedTag => 
        stakeholder.tags && Array.isArray(stakeholder.tags) && 
        stakeholder.tags.some(tag => tag && typeof tag === 'string' && tag.toLowerCase() === selectedTag.toLowerCase())
      );
      if (!hasMatchingTag) return false;
    }

    return true;
  });

  // Get unique tags from all stakeholders for tag filtering - with null safety
  const allTags = [...new Set(
    stakeholders
      .flatMap(s => s.tags && Array.isArray(s.tags) ? s.tags.filter(tag => tag && typeof tag === 'string') : [])
  )].sort();
  const popularTags = allTags.slice(0, 8); // Show first 8 most common tags

  const clearTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleExport = () => {
    try {
      // Filter to only include clients
      const clientStakeholders = stakeholders.filter(stakeholder => stakeholder.category === 'client');
      
      if (clientStakeholders.length === 0) {
        toast.error('No clients found to export');
        return;
      }

      // Prepare data for export - excluding sensitive contact details
      const exportData = clientStakeholders.map(stakeholder => ({
        display_name: stakeholder.display_name,
        category: stakeholder.category,
        trade_industry: stakeholder.trade_industry || '',
        status: stakeholder.status,
        compliance_status: stakeholder.compliance_status,
        tags: stakeholder.tags ? stakeholder.tags.join(', ') : '',
      }));

      // Create CSV content - no sensitive contact information
      const headers = [
        'Display Name',
        'Category', 
        'Trade/Industry',
        'Status',
        'Compliance Status',
        'Tags'
      ];
      
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          Object.values(row).map(value => 
            typeof value === 'string' && value.includes(',') 
              ? `"${value.replace(/"/g, '""')}"` 
              : value || ''
          ).join(',')
        )
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `clients_${currentCompany?.name || 'export'}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`${clientStakeholders.length} clients exported successfully (contact details excluded)`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export clients');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentCompany?.id) return;

    try {
      const text = await file.text();
      const lines = text.split('\n');
      
      if (lines.length < 2) {
        toast.error('Invalid CSV file format');
        return;
      }

      // Skip header row and parse data
      const stakeholdersToImport = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(',').map(value => 
          value.replace(/^"(.*)"$/, '$1').replace(/""/g, '"').trim()
        );

        if (values.length >= 6) {
          stakeholdersToImport.push({
            company_id: currentCompany.id,
            display_name: values[0] || `Imported Stakeholder ${i}`,
            category: values[1] || 'client',
            trade_industry: values[2] || null,
            primary_contact_name: values[3] || null,
            primary_email: values[4] || null,
            primary_phone: values[5] || null,
            status: values[6] || 'active',
            compliance_status: values[7] || 'valid',
            tags: values[8] ? values[8].split(', ').filter(tag => tag.trim()) : null,
          });
        }
      }

      if (stakeholdersToImport.length === 0) {
        toast.error('No valid stakeholder data found in file');
        return;
      }

      // Import stakeholders
      const { error } = await supabase
        .from('stakeholders')
        .insert(stakeholdersToImport);

      if (error) {
        console.error('Import error:', error);
        toast.error('Failed to import stakeholders');
        return;
      }

      toast.success(`Successfully imported ${stakeholdersToImport.length} stakeholders`);
      fetchStakeholders();
      
    } catch (error) {
      console.error('File processing error:', error);
      toast.error('Error processing import file');
    }

    // Reset input
    event.target.value = '';
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
    <div className={`space-y-4 ${isMobile ? 'p-4' : 'p-6'}`}>
      {/* Compact Header */}
      <div className={`${isMobile ? 'block space-y-3' : 'flex items-center justify-between'}`}>
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-slate-600" />
          <div>
            <h1 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-slate-900`}>
              Stakeholders
              {selectedCategory && <span className="text-slate-500 font-normal"> • {selectedCategory}</span>}
            </h1>
            <div className={`flex items-center ${isMobile ? 'gap-2 flex-wrap' : 'gap-4'} mt-1 text-sm text-slate-600`}>
              <span>{stakeholders.filter(s => s.compliance_status === 'valid').length} Compliant</span>
              <span>•</span>
              <span>{stakeholders.filter(s => s.status === 'active').length} Active</span>
              <span>•</span>  
              <span>{stakeholders.filter(s => s.compliance_status === 'expiring').length} Expiring</span>
            </div>
          </div>
        </div>
        
        <div className={`flex items-center gap-2 ${isMobile ? 'justify-end' : ''}`}>
          {!isMobile && (
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".csv"
                onChange={handleImport}
                className="hidden"
                id="import-csv"
              />
              <label htmlFor="import-csv">
                <Button variant="outline" size="sm" className="gap-1.5" asChild>
                  <span className="cursor-pointer">
                    <Upload className="h-4 w-4" />
                    Import
                  </span>
                </Button>
              </label>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport}>
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          )}
          <AddStakeholderDialog onStakeholderAdded={fetchStakeholders} />
        </div>
      </div>

      {/* Compact Search and Filters */}
      <div className={`${isMobile ? 'space-y-3' : 'flex gap-3'}`}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder={isMobile ? "Search stakeholders..." : "Search stakeholders by name, email, or tags..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9"
          />
        </div>

        <div className={`${isMobile ? 'flex gap-2 overflow-x-auto' : 'flex gap-3'}`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={`gap-2 ${isMobile ? 'min-w-[100px] text-xs' : 'min-w-[120px]'}`}>
                <Filter className="h-4 w-4" />
                {isMobile ? 'Category' : (selectedCategory ? selectedCategory : 'All Categories')}
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={`gap-2 ${isMobile ? 'min-w-[80px] text-xs' : 'min-w-[100px]'}`}>
                <Filter className="h-4 w-4" />
                {isMobile ? 'Tags' : `Tags ${selectedTags.length > 0 ? `(${selectedTags.length})` : ''}`}
              </Button>
            </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 max-h-64 overflow-y-auto">
            <DropdownMenuCheckboxItem
              checked={selectedTags.length === 0}
              onCheckedChange={(checked) => checked && setSelectedTags([])}
            >
              All Tags
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            {allTags.map((tag) => (
              <DropdownMenuCheckboxItem
                key={tag}
                checked={selectedTags.includes(tag)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedTags([...selectedTags, tag]);
                  } else {
                    setSelectedTags(selectedTags.filter(t => t !== tag));
                  }
                }}
              >
                {tag}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

          {selectedStakeholders.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={isMobile ? 'text-xs' : ''}>
                  {isMobile ? `(${selectedStakeholders.length})` : `Actions (${selectedStakeholders.length})`}
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
      </div>

      {/* Quick Tag Filters */}
      {!isMobile && popularTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-slate-500">Quick filters:</span>
          {popularTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "secondary"}
              className="cursor-pointer text-xs hover:bg-primary/80 transition-colors"
              onClick={() => {
                if (selectedTags.includes(tag)) {
                  clearTag(tag);
                } else {
                  setSelectedTags([...selectedTags, tag]);
                }
              }}
            >
              {tag}
            </Badge>
          ))}
          {selectedTags.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-slate-500 hover:text-slate-700"
              onClick={() => setSelectedTags([])}
            >
              Clear all
            </Button>
          )}
        </div>
      )}

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-slate-600">Filtered by:</span>
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="default"
              className="text-xs gap-1"
            >
              {tag}
              <button
                className="ml-1 hover:bg-primary-foreground rounded-full p-0.5"
                onClick={() => clearTag(tag)}
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Mobile/Desktop Layout */}
      {isMobile ? (
        /* Mobile Card Layout */
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-sm font-medium">
              {filteredStakeholders.length} Stakeholders
            </span>
            {selectedStakeholders.length > 0 && (
              <span className="text-xs text-slate-500">
                {selectedStakeholders.length} selected
              </span>
            )}
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-slate-500">Loading...</span>
              </div>
            </div>
          ) : filteredStakeholders.length === 0 ? (
            <div className="text-center py-8 px-4 border rounded-lg bg-slate-50">
              <Users className="mx-auto h-8 w-8 text-slate-400 mb-2" />
              <p className="text-sm text-slate-500">No stakeholders found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            filteredStakeholders.map((stakeholder) => (
              <div
                key={stakeholder.id}
                className="border rounded-lg bg-white p-4 space-y-3 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => onStakeholderSelect(stakeholder.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300"
                      checked={selectedStakeholders.includes(stakeholder.id)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStakeholders([...selectedStakeholders, stakeholder.id]);
                        } else {
                          setSelectedStakeholders(selectedStakeholders.filter(id => id !== stakeholder.id));
                        }
                      }}
                    />
                    {renderAvatar(stakeholder.display_name, stakeholder.category)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 truncate">{stakeholder.display_name}</div>
                      <div className="text-xs text-slate-500 capitalize">{stakeholder.category}</div>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onStakeholderSelect(stakeholder.id)}>
                        View Details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Contact</div>
                    <div className="space-y-1">
                      {stakeholder.primary_email && (
                        <div className="flex items-center gap-1 text-xs">
                          <Mail className="h-3 w-3 text-slate-400" />
                          <span className="truncate">{stakeholder.primary_email}</span>
                        </div>
                      )}
                      {stakeholder.primary_phone && (
                        <div className="flex items-center gap-1 text-xs">
                          <Phone className="h-3 w-3 text-slate-400" />
                          <span>{stakeholder.primary_phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Status</div>
                    <div className="space-y-2">
                      {getStatusBadge(stakeholder.status)}
                      {getComplianceBadge(stakeholder.compliance_status)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-slate-500">
                    {stakeholder.active_projects_count || 0} active projects
                  </span>
                  
                  {stakeholder.tags && stakeholder.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {stakeholder.tags.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                          {typeof tag === 'string' ? tag : ''}
                        </Badge>
                      ))}
                      {stakeholder.tags.length > 2 && (
                        <Badge variant="secondary" className="text-xs px-2 py-0.5">
                          +{stakeholder.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Desktop Table Layout */
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
                      <Users className="h-8 w-8 text-slate-400" />
                      <span className="text-sm text-slate-500">No stakeholders found</span>
                      <span className="text-xs text-slate-400">Try adjusting your filters or search terms</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStakeholders.map((stakeholder) => (
                  <TableRow
                    key={stakeholder.id}
                    className="cursor-pointer hover:bg-slate-50 transition-colors group"
                    onClick={() => onStakeholderSelect(stakeholder.id)}
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        className="rounded border-slate-300"
                        checked={selectedStakeholders.includes(stakeholder.id)}
                        onClick={(e) => e.stopPropagation()}
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
                      <div className="flex items-center gap-2">
                        {renderAvatar(stakeholder.display_name, stakeholder.category)}
                        <span className="font-medium text-slate-900 text-sm">{stakeholder.display_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs capitalize bg-slate-50 text-slate-700 border-slate-200">
                        {stakeholder.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {stakeholder.primary_email && (
                          <div className="flex items-center gap-1 text-xs text-slate-600">
                            <Mail className="h-3 w-3 text-slate-400" />
                            <span className="truncate max-w-[200px]">{stakeholder.primary_email}</span>
                          </div>
                        )}
                        {stakeholder.primary_phone && (
                          <div className="flex items-center gap-1 text-xs text-slate-600">
                            <Phone className="h-3 w-3 text-slate-400" />
                            <span>{stakeholder.primary_phone}</span>
                          </div>
                        )}
                        {!stakeholder.primary_email && !stakeholder.primary_phone && (
                          <span className="text-xs text-slate-400">No contact info</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        {stakeholder.active_projects_count || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>{getComplianceBadge(stakeholder.compliance_status)}</TableCell>
                    <TableCell>{getStatusBadge(stakeholder.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onStakeholderSelect(stakeholder.id)}>
                            View Details
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
      )}
    </div>
  );
};