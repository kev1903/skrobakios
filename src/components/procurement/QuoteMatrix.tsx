import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, ChevronRight, GripVertical, MoreVertical, Plus, FileText, GitCompare, Calendar, Users, Mail, Eye, CheckCircle, Paperclip } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { useWBS } from '@/hooks/useWBS';
import { WBSItem } from '@/types/wbs';
import { QuotePopup } from './QuotePopup';

interface RFQ {
  id: string;
  rfq_number: string;
  work_package: string;
  trade_category: string;
  scope_summary?: string;
  status: string;
  due_date?: string;
}

interface Vendor {
  id: string;
  name: string;
  trade_category: string;
  compliance_rating?: string;
}

interface Quote {
  id: string;
  rfq_id: string;
  vendor_id: string;
  quote_ref?: string;
  quote_amount_inc_gst?: number;
  scope_coverage_percent?: number;
  lead_time_days?: number;
  is_compliant?: boolean;
  validity_date?: string;
  evaluation_score?: number;
  rank?: number;
  status: string;
  vendor?: Vendor;
}

interface SupplierInvitation {
  supplierId: string;
  supplierName: string;
  status: 'invited' | 'viewed' | 'received';
  invitedDate?: string;
  viewedDate?: string;
  receivedDate?: string;
  files?: Array<{ name: string; url: string }>;
}

interface WBSRow {
  wbsId: string;
  title: string;
  level: number;
  hasChildren: boolean;
  isExpanded: boolean;
  itemId: string;
  rfqNumber?: string;
  dueDate?: string;
  suppliersInvited: number;
  responsesReceived: number;
  status: string;
  supplierInvitations: SupplierInvitation[];
}

interface QuoteMatrixProps {
  projectId: string;
  rfqs: RFQ[];
  onRFQUpdate: () => void;
  onNavigate?: (page: string, params?: any) => void;
}

export const QuoteMatrix: React.FC<QuoteMatrixProps> = ({ projectId, rfqs, onRFQUpdate, onNavigate }) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  
  // Quote popup state
  const [isQuotePopupOpen, setIsQuotePopupOpen] = useState(false);
  const [selectedQuoteData, setSelectedQuoteData] = useState<{
    wbsItem?: WBSRow;
    contractor?: any;
  }>({});
  
  // Load WBS items from database
  const { wbsItems, loading: wbsLoading } = useWBS(projectId);

  // Expand all WBS items by default
  useEffect(() => {
    const allItemIds = new Set<string>();
    const collectIds = (items: WBSItem[]) => {
      items.forEach(item => {
        if (item.rfq_required === true) {
          allItemIds.add(item.id);
        }
        if (item.children && item.children.length > 0) {
          collectIds(item.children);
        }
      });
    };
    collectIds(wbsItems);
    setExpandedIds(allItemIds);
  }, [wbsItems]);

  useEffect(() => {
    fetchQuotesAndVendors();
  }, [rfqs]);

  const fetchQuotesAndVendors = async () => {
    try {
      setLoading(true);
      
      // Fetch quotes with vendor data
      const { data: quotesData, error: quotesError } = await supabase
        .from('quotes')
        .select(`
          *,
          vendor:vendors(id, name, trade_category, compliance_rating)
        `)
        .in('rfq_id', rfqs.map(rfq => rfq.id));

      if (quotesError) {
        console.error('Error fetching quotes:', quotesError);
        toast.error('Failed to load quotes');
        return;
      }

      // Fetch all vendors for the company
      const { data: vendorsData, error: vendorsError } = await supabase
        .from('vendors')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (vendorsError) {
        console.error('Error fetching vendors:', vendorsError);
        toast.error('Failed to load vendors');
        return;
      }

      setQuotes(quotesData || []);
      setVendors(vendorsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Get top 5 vendors that have submitted quotes
  const activeVendors = vendors
    .filter(vendor => quotes.some(quote => quote.vendor_id === vendor.id))
    .slice(0, 5);

  // Flatten visible WBS items based on expansion state and filter by RFQ required
  const flattenVisibleWBS = (items: WBSItem[]): WBSItem[] => {
    const result: WBSItem[] = [];
    
    console.log('🔍 QuoteMatrix: Flattening WBS items, total input items:', items.length);
    
    const traverse = (wbsItems: WBSItem[], depth: number = 0) => {
      wbsItems.forEach(item => {
        console.log(`  ${'  '.repeat(depth)}Item: ${item.wbs_id} - ${item.title}, rfq_required: ${item.rfq_required}, level: ${item.level}`);
        
        // Only include items where rfq_required is true
        if (item.rfq_required === true) {
          console.log(`    ${'  '.repeat(depth)}✅ Added to matrix (RFQ required)`);
          result.push(item);
        }
        
        // Always traverse ALL children to find nested items with RFQ required
        // regardless of expansion state (procurement should show all RFQ items)
        if (item.children && item.children.length > 0) {
          console.log(`    ${'  '.repeat(depth)}📂 Traversing ${item.children.length} children (looking for RFQ items)`);
          traverse(item.children, depth + 1);
        }
      });
    };
    
    traverse(items);
    console.log('📊 QuoteMatrix: Total items with RFQ required:', result.length);
    return result;
  };

  const visibleWBSItems = useMemo(() => flattenVisibleWBS(wbsItems), [wbsItems, expandedIds]);

  // Toggle expansion state
  const toggleExpanded = useCallback((itemId: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  // Build WBS matrix data
  const buildWBSMatrix = (): WBSRow[] => {
    return visibleWBSItems.map(wbsItem => {
      // Find RFQ for this WBS item
      const rfq = rfqs.find(r => 
        r.trade_category.toLowerCase() === wbsItem.title.toLowerCase() ||
        r.work_package.toLowerCase() === wbsItem.title.toLowerCase()
      );

      // Build supplier invitations (using vendors and quotes)
      const supplierInvitations: SupplierInvitation[] = [];
      
      if (activeVendors.length > 0) {
        for (let i = 0; i < Math.min(3, activeVendors.length); i++) {
          const vendor = activeVendors[i];
          const quote = rfq ? quotes.find(q => q.rfq_id === rfq.id && q.vendor_id === vendor.id) : null;
          
          // Determine status based on quote
          let status: 'invited' | 'viewed' | 'received' = 'invited';
          let receivedDate = undefined;
          
          if (quote) {
            status = 'received';
            receivedDate = new Date().toISOString(); // Would come from database
          }
          
          supplierInvitations.push({
            supplierId: vendor.id,
            supplierName: vendor.name,
            status,
            invitedDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Mock data
            viewedDate: status !== 'invited' ? new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString() : undefined,
            receivedDate,
            files: quote ? [{ name: 'quote.pdf', url: '#' }] : []
          });
        }
      } else {
        // Create placeholder invitations
        for (let i = 0; i < 3; i++) {
          supplierInvitations.push({
            supplierId: `placeholder-${i}`,
            supplierName: `Vendor ${i + 1}`,
            status: 'invited',
            invitedDate: new Date().toISOString(),
            files: []
          });
        }
      }

      const responsesReceived = supplierInvitations.filter(s => s.status === 'received').length;

      return {
        wbsId: wbsItem.wbs_id,
        title: wbsItem.title,
        level: wbsItem.level,
        hasChildren: wbsItem.children && wbsItem.children.length > 0,
        isExpanded: expandedIds.has(wbsItem.id),
        itemId: wbsItem.id,
        rfqNumber: rfq?.rfq_number || `RFQ-${wbsItem.wbs_id}`,
        dueDate: rfq?.due_date,
        suppliersInvited: supplierInvitations.length,
        responsesReceived,
        status: responsesReceived === 0 ? 'pending' : responsesReceived === supplierInvitations.length ? 'completed' : 'in_progress',
        supplierInvitations
      };
    });
  };

  const wbsMatrix = buildWBSMatrix();

  // Handle navigation to quote creation page
  const handleCreateQuote = (wbsItem: WBSRow, supplier: SupplierInvitation) => {
    setSelectedQuoteData({ 
      wbsItem, 
      contractor: {
        contractorId: supplier.supplierId,
        contractorName: supplier.supplierName
      }
    });
    setIsQuotePopupOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    };
    const labels = {
      pending: 'Pending',
      in_progress: 'In Progress',
      completed: 'Completed'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || styles.pending}`}>
        {labels[status as keyof typeof labels] || 'Pending'}
      </span>
    );
  };

  const getInvitationStatusIcon = (status: 'invited' | 'viewed' | 'received') => {
    switch (status) {
      case 'invited':
        return <Mail className="w-4 h-4 text-amber-500" />;
      case 'viewed':
        return <Eye className="w-4 h-4 text-blue-500" />;
      case 'received':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const getStatusColor = (status: 'invited' | 'viewed' | 'received') => {
    switch (status) {
      case 'invited':
        return 'text-amber-600 bg-amber-50';
      case 'viewed':
        return 'text-blue-600 bg-blue-50';
      case 'received':
        return 'text-emerald-600 bg-emerald-50';
    }
  };

  if (loading || wbsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-xl border border-border/30 rounded-2xl overflow-hidden shadow-glass hover:shadow-glass-hover transition-all duration-300">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 border-b border-border/30 hover:bg-muted/30 h-11">
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3 w-10"></TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3 w-24">RFQ #</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3 min-w-[200px]">WBS/Activity</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3 text-center w-24">Suppliers</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3 text-center w-28">Due Date</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3 text-center w-24">Responses</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3 text-center w-28">Status</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3 text-center w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wbsMatrix.map((row) => (
                <React.Fragment key={row.itemId}>
                  {/* Main RFQ Row */}
                  <TableRow 
                    className={`h-12 hover:bg-accent/30 transition-all duration-200 border-b border-border/30 ${
                      row.level > 0 ? 'bg-accent/10' : 'bg-white/50'
                    }`}
                  >
                    <TableCell className="px-4 py-2 align-middle">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(row.itemId)}
                        className="h-5 w-5 p-0 rounded-md hover:bg-accent/50 flex-shrink-0 transition-all duration-200"
                      >
                        {row.isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="px-4 py-2 align-middle">
                      <span className="text-xs text-luxury-gold font-mono font-bold">{row.rfqNumber}</span>
                    </TableCell>
                    <TableCell className="px-4 py-2 align-middle">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground font-mono bg-muted/30 px-1.5 py-0.5 rounded">{row.wbsId}</span>
                        <span className="text-sm text-foreground font-medium">{row.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-2 align-middle text-center">
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-accent/30">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm font-semibold text-foreground">{row.suppliersInvited}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-2 align-middle text-center">
                      {row.dueDate ? (
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs font-medium text-foreground">
                              {new Date(row.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-2 align-middle text-center">
                      <span className={`text-sm font-bold ${row.responsesReceived > 0 ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                        {row.responsesReceived}
                      </span>
                      <span className="text-sm text-muted-foreground">/{row.suppliersInvited}</span>
                    </TableCell>
                    <TableCell className="px-4 py-2 align-middle text-center">
                      {getStatusBadge(row.status)}
                    </TableCell>
                    <TableCell className="px-4 py-2 align-middle text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 rounded-md text-muted-foreground hover:text-luxury-gold hover:bg-luxury-gold/10 transition-all duration-200"
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-xl border border-border/30 shadow-glass z-50 rounded-xl w-44">
                          <DropdownMenuItem 
                            className="text-sm cursor-pointer hover:bg-accent/50 transition-colors"
                            onClick={() => handleCreateQuote(row, row.supplierInvitations[0])}
                          >
                            <Plus className="mr-2 h-3.5 w-3.5" />
                            Add Quote
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-sm cursor-pointer hover:bg-accent/50 transition-colors">
                            <FileText className="mr-2 h-3.5 w-3.5" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-sm cursor-pointer hover:bg-accent/50 transition-colors">
                            <GitCompare className="mr-2 h-3.5 w-3.5" />
                            Compare
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>

                  {/* Expanded Supplier Invitation Rows - Compact Layout */}
                  {row.isExpanded && row.supplierInvitations && row.supplierInvitations.length > 0 && (
                    <>
                      {row.supplierInvitations.map((invitation, idx) => (
                        <TableRow 
                          key={`${row.itemId}-supplier-${idx}`}
                          className="h-10 bg-gradient-to-r from-accent/5 to-transparent hover:from-accent/15 hover:to-accent/5 transition-all duration-200 border-b border-border/10"
                        >
                          <TableCell className="px-4 py-2 align-middle">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getStatusColor(invitation.status)}`}>
                              {invitation.status === 'invited' && <Mail className="w-3 h-3" />}
                              {invitation.status === 'viewed' && <Eye className="w-3 h-3" />}
                              {invitation.status === 'received' && <CheckCircle className="w-3 h-3" />}
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-2 align-middle" colSpan={2}>
                            <div className="flex items-center gap-2.5 pl-2">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <span className="text-sm font-medium text-foreground truncate">
                                  {invitation.supplierName}
                                </span>
                                <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${getStatusColor(invitation.status)}`}>
                                  {invitation.status}
                                </span>
                                {invitation.files && invitation.files.length > 0 && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Paperclip className="w-3 h-3" />
                                    <span>{invitation.files.length}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-2 align-middle" colSpan={2}>
                            <div className="flex items-center justify-center gap-4 text-[11px]">
                              <div className="flex items-center gap-1.5">
                                <Mail className="w-3 h-3 text-amber-500" />
                                <span className="text-muted-foreground">Invited:</span>
                                <span className="font-medium text-foreground">{formatDate(invitation.invitedDate)}</span>
                              </div>
                              {invitation.viewedDate && (
                                <div className="flex items-center gap-1.5">
                                  <Eye className="w-3 h-3 text-blue-500" />
                                  <span className="font-medium text-foreground">{formatDate(invitation.viewedDate)}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-2 align-middle text-center">
                            {invitation.receivedDate ? (
                              <div className="flex flex-col items-center">
                                <span className="text-xs font-semibold text-emerald-600">{formatDate(invitation.receivedDate)}</span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-muted-foreground italic">Awaiting</span>
                            )}
                          </TableCell>
                          <TableCell className="px-4 py-2 align-middle text-center" colSpan={2}>
                            {invitation.files && invitation.files.length > 0 ? (
                              <div className="flex items-center justify-center gap-1">
                                {invitation.files.map((file, fileIdx) => (
                                  <Button
                                    key={fileIdx}
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-[10px] text-luxury-gold hover:text-white hover:bg-luxury-gold/90 rounded-md transition-all duration-200 font-medium"
                                  >
                                    <Paperclip className="w-2.5 h-2.5 mr-1" />
                                    {file.name}
                                  </Button>
                                ))}
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-[10px] text-muted-foreground hover:text-luxury-gold hover:bg-accent/50 rounded-md transition-all duration-200"
                                onClick={() => handleCreateQuote(row, invitation)}
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add Quote
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <QuotePopup
        isOpen={isQuotePopupOpen}
        onClose={() => setIsQuotePopupOpen(false)}
        wbsItem={selectedQuoteData.wbsItem ? {
          wbsId: selectedQuoteData.wbsItem.wbsId,
          title: selectedQuoteData.wbsItem.title
        } : undefined}
        contractor={selectedQuoteData.contractor ? {
          contractorId: selectedQuoteData.contractor.contractorId,
          contractorName: selectedQuoteData.contractor.contractorName
        } : undefined}
        projectId={projectId}
      />
    </div>
  );
};