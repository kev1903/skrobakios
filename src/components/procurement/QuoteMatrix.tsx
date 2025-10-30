import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
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
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    // Initially expand all top-level items (stages)
    return new Set<string>();
  });
  
  // Quote popup state
  const [isQuotePopupOpen, setIsQuotePopupOpen] = useState(false);
  const [selectedQuoteData, setSelectedQuoteData] = useState<{
    wbsItem?: WBSRow;
    contractor?: any;
  }>({});
  
  // Load WBS items from database
  const { wbsItems, loading: wbsLoading } = useWBS(projectId);

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
      const contractors = activeVendors.map(vendor => {
        // Find RFQ for this WBS item (matching by title or category)
        const rfq = rfqs.find(r => 
          r.trade_category.toLowerCase() === wbsItem.title.toLowerCase() ||
          r.work_package.toLowerCase() === wbsItem.title.toLowerCase()
        );
        // Find quote for this RFQ and vendor
        const quote = rfq ? quotes.find(q => q.rfq_id === rfq.id && q.vendor_id === vendor.id) : null;
        
        return {
          contractorId: vendor.id,
          contractorName: vendor.name,
          quote: quote?.quote_amount_inc_gst || null
        };
      });

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
          {/* Table Header */}
          <div className="bg-muted/30 border-b border-border/30">
            <div className="grid grid-cols-[60px_1fr_repeat(6,minmax(120px,1fr))] py-3">
              <div className="px-2 text-left font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">WBS</div>
              <div className="px-4 border-l border-border/30 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">ACTIVITY</div>
              <div className="text-center px-2 border-l border-border/30 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">Quote 1</div>
              <div className="text-center px-2 border-l border-border/30 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">Quote 2</div>
              <div className="text-center px-2 border-l border-border/30 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">Quote 3</div>
              <div className="text-center px-2 border-l border-border/30 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">Quote 4</div>
              <div className="text-center px-2 border-l border-border/30 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">Quote 5</div>
              <div className="text-center px-2 border-l border-border/30 bg-emerald-50/30 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">Committed</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="bg-white/50 divide-y divide-border/30">
            {wbsMatrix.map((row, index) => (
              <div 
                key={row.wbsId} 
                className={`grid grid-cols-[60px_1fr_repeat(6,minmax(120px,1fr))] hover:bg-accent/30 transition-all duration-200 ${
                  row.level > 0 ? 'bg-accent/20' : 'bg-white/50'
                }`}
              >
                <div className="flex items-center py-2 px-2">
                  <div 
                    className="flex items-center gap-2" 
                    style={{ paddingLeft: `${row.level * 16}px` }}
                  >
                    {row.hasChildren ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(row.itemId)}
                        className="h-5 w-5 p-0 hover:bg-gray-200 flex-shrink-0"
                      >
                        {row.isExpanded ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                      </Button>
                    ) : (
                      <div className="w-5" />
                    )}
                    <span className="text-xs text-muted-foreground font-medium">{row.wbsId}</span>
                  </div>
                </div>
                <div className="flex items-center py-4 px-4 border-l border-border/30">
                  <span className="text-sm text-foreground font-medium truncate">{row.title}</span>
                </div>
                {[0, 1, 2, 3, 4].map((contractorIndex) => {
                  const contractor = row.contractors[contractorIndex];
                  const isAccentColumn = contractorIndex % 2 === 0;
                  const isElementRow = !row.hasChildren;
                  return (
                    <div key={contractorIndex} className={`text-center text-sm font-medium text-foreground px-2 py-4 h-full border-l border-border/30 ${isAccentColumn ? 'bg-accent/10 hover:bg-accent/20' : 'hover:bg-muted/50'} relative flex items-center justify-center transition-all duration-200`}>
                      <div className="flex items-center justify-center space-x-2">
                        <span>{contractor?.quote ? formatCurrency(contractor.quote) : ''}</span>
                        {isElementRow && (
                          <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            aria-label="Create quote"
                            className="h-8 w-8 p-0 rounded-full text-luxury-gold hover:text-white hover:bg-luxury-gold hover:scale-[1.02] flex items-center justify-center transition-all duration-200"
                            onClick={() => handleCreateQuote(row, contractor)}
                          >
                            <span className="text-base font-bold">+</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div className="px-2 py-4 h-full border-l border-border/30 bg-emerald-50/20">
                  <Select>
                    <SelectTrigger className="w-full h-8 text-sm bg-white/80 backdrop-blur-md border-emerald-200 rounded-lg hover:scale-[1.02] transition-all duration-200">
                      <SelectValue placeholder="Select quote..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-xl border border-border/30 shadow-glass z-50 rounded-xl">
                      {row.contractors.map((contractor, idx) => (
                        <SelectItem 
                          key={contractor.contractorId} 
                          value={contractor.contractorId}
                          className="text-xs"
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="truncate">{contractor.contractorName}</span>
                            <span className="ml-2 text-muted-foreground">
                              {contractor.quote ? 'Submitted' : 'Pending'}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
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