import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, ChevronRight, GripVertical, MoreVertical, Plus, FileText, GitCompare } from 'lucide-react';
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

interface WBSRow {
  wbsId: string;
  title: string;
  level: number;
  hasChildren: boolean;
  isExpanded: boolean;
  itemId: string;
  contractors: Array<{
    contractorId: string;
    contractorName: string;
    quote: number | null;
  }>;
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
      // Ensure we always have at least 3 contractor slots
      const contractors = [];
      
      if (activeVendors.length > 0) {
        // Use actual vendors
        for (let i = 0; i < Math.max(3, activeVendors.length); i++) {
          const vendor = activeVendors[i];
          if (vendor) {
            // Find RFQ for this WBS item (matching by title or category)
            const rfq = rfqs.find(r => 
              r.trade_category.toLowerCase() === wbsItem.title.toLowerCase() ||
              r.work_package.toLowerCase() === wbsItem.title.toLowerCase()
            );
            // Find quote for this RFQ and vendor
            const quote = rfq ? quotes.find(q => q.rfq_id === rfq.id && q.vendor_id === vendor.id) : null;
            
            contractors.push({
              contractorId: vendor.id,
              contractorName: vendor.name,
              quote: quote?.quote_amount_inc_gst || null
            });
          } else {
            // Fill empty slots
            contractors.push({
              contractorId: `placeholder-${i}`,
              contractorName: `Vendor ${i + 1}`,
              quote: null
            });
          }
        }
      } else {
        // No vendors, create 3 placeholder slots
        for (let i = 0; i < 3; i++) {
          contractors.push({
            contractorId: `placeholder-${i}`,
            contractorName: `Vendor ${i + 1}`,
            quote: null
          });
        }
      }

      return {
        wbsId: wbsItem.wbs_id,
        title: wbsItem.title,
        contractors,
        level: wbsItem.level,
        hasChildren: wbsItem.children && wbsItem.children.length > 0,
        isExpanded: expandedIds.has(wbsItem.id),
        itemId: wbsItem.id
      };
    });
  };

  const wbsMatrix = buildWBSMatrix();

  // Handle navigation to quote creation page
  const handleCreateQuote = (wbsItem: WBSRow, contractor: any) => {
    setSelectedQuoteData({ wbsItem, contractor });
    setIsQuotePopupOpen(true);
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
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-6 py-4 w-16"></TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-6 py-4 w-32">WBS</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-6 py-4 min-w-[300px]">Activity</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-6 py-4 text-center w-40">Status</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-6 py-4 text-center w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wbsMatrix.map((row) => (
                <React.Fragment key={row.itemId}>
                  {/* Main WBS Row */}
                  <TableRow 
                    className={`h-14 hover:bg-accent/30 transition-all duration-200 border-b border-border/30 ${
                      row.level > 0 ? 'bg-accent/10' : 'bg-white/50'
                    }`}
                  >
                    <TableCell className="px-6 py-4 align-middle">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(row.itemId)}
                        className="h-6 w-6 p-0 rounded-full hover:bg-accent/50 flex-shrink-0 transition-all duration-200"
                      >
                        {row.isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="px-6 py-4 align-middle">
                      <span className="text-xs text-muted-foreground font-mono font-medium">{row.wbsId}</span>
                    </TableCell>
                    <TableCell className="px-6 py-4 align-middle">
                      <span className="text-sm text-foreground font-medium">{row.title}</span>
                    </TableCell>
                    <TableCell className="px-6 py-4 align-middle text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                        Pending
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 align-middle text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 text-xs text-luxury-gold hover:text-white hover:bg-luxury-gold/90 rounded-lg transition-all duration-200"
                          >
                            Actions
                            <ChevronDown className="ml-1 h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-xl border border-border/30 shadow-glass z-50 rounded-xl w-48">
                          <DropdownMenuItem 
                            className="text-sm cursor-pointer hover:bg-accent/50 transition-colors"
                            onClick={() => handleCreateQuote(row, row.contractors[0])}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Quote
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-sm cursor-pointer hover:bg-accent/50 transition-colors">
                            <FileText className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-sm cursor-pointer hover:bg-accent/50 transition-colors">
                            <GitCompare className="mr-2 h-4 w-4" />
                            Compare Quotes
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>

                  {/* Expanded Detail Rows (3 sub-rows) */}
                  {row.isExpanded && row.contractors && row.contractors.length > 0 && (
                    <>
                      {row.contractors.slice(0, 3).map((contractor, idx) => (
                        <TableRow 
                          key={`${row.itemId}-contractor-${idx}`}
                          className="h-12 bg-accent/5 hover:bg-accent/20 transition-all duration-200 border-b border-border/20"
                        >
                          <TableCell className="px-6 py-3 align-middle">
                            <GripVertical className="w-4 h-4 text-muted-foreground/40" />
                          </TableCell>
                          <TableCell className="px-6 py-3 align-middle">
                            <span className="text-xs text-muted-foreground font-mono">—</span>
                          </TableCell>
                          <TableCell className="px-6 py-3 align-middle">
                            <div className="flex items-center gap-3 pl-8">
                              <div className="w-8 h-8 rounded-full bg-luxury-gold/10 border border-luxury-gold/30 flex items-center justify-center">
                                <span className="text-xs font-semibold text-luxury-gold">
                                  {contractor?.contractorName?.charAt(0) || 'V'}
                                </span>
                              </div>
                              <span className="text-sm text-foreground">
                                {contractor?.contractorName || `Vendor ${idx + 1}`}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-3 align-middle text-center">
                            {contractor?.quote ? (
                              <span className="text-sm font-semibold text-foreground">
                                {formatCurrency(contractor.quote)}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">No quote</span>
                            )}
                          </TableCell>
                          <TableCell className="px-6 py-3 align-middle text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 rounded-full text-luxury-gold hover:text-white hover:bg-luxury-gold/90 hover:scale-[1.02] flex items-center justify-center transition-all duration-200"
                              onClick={() => handleCreateQuote(row, contractor)}
                            >
                              <span className="text-base font-bold leading-none">+</span>
                            </Button>
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