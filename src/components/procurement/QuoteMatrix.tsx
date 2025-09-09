import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { useWBS } from '@/hooks/useWBS';
import { WBSItem } from '@/types/wbs';

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
}

export const QuoteMatrix: React.FC<QuoteMatrixProps> = ({ projectId, rfqs, onRFQUpdate }) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    // Initially expand all top-level items (stages)
    return new Set<string>();
  });
  
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

  // Flatten visible WBS items based on expansion state
  const flattenVisibleWBS = (items: WBSItem[]): WBSItem[] => {
    const result: WBSItem[] = [];
    
    const traverse = (wbsItems: WBSItem[]) => {
      wbsItems.forEach(item => {
        result.push(item);
        
        if (item.children && item.children.length > 0 && expandedIds.has(item.id)) {
          traverse(item.children);
        }
      });
    };
    
    traverse(items);
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
      <h1 className="text-3xl font-bold text-primary">Quote Matrix</h1>

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          {/* Table Header */}
          <div className="bg-white border-b border-gray-200">
            <div className="grid grid-cols-11 gap-4 px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-2">WBS</div>
              <div className="col-span-1 text-center">Contractor 1</div>
              <div className="col-span-1 text-center">Quote 1</div>
              <div className="col-span-1 text-center">Contractor 2</div>
              <div className="col-span-1 text-center">Quote 2</div>
              <div className="col-span-1 text-center">Contractor 3</div>
              <div className="col-span-1 text-center">Quote 3</div>
              <div className="col-span-1 text-center">Contractor 4</div>
              <div className="col-span-1 text-center">Quote 4</div>
              <div className="col-span-1 text-center">Contractor 5 / Quote 5</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="bg-white divide-y divide-gray-100">
            {wbsMatrix.map((row, index) => (
              <div 
                key={row.wbsId} 
                className={`grid grid-cols-11 gap-4 px-4 py-3 hover:bg-gray-50 transition-colors ${
                  row.level > 0 ? 'bg-blue-50/30' : 'bg-white'
                }`}
              >
                <div className="col-span-2 flex items-center">
                  <div 
                    className="flex items-center space-x-2" 
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
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="text-sm font-medium text-blue-600 flex-shrink-0">{row.wbsId}</span>
                      <span className="text-sm text-gray-900 truncate">{row.title}</span>
                    </div>
                  </div>
                </div>
                {[0, 1, 2, 3, 4].map((contractorIndex) => {
                  const contractor = row.contractors[contractorIndex];
                  if (contractorIndex === 4) {
                    // Last column combines contractor and quote
                    return (
                      <div key={contractorIndex} className="col-span-1 text-center text-sm self-center">
                        <div className="text-gray-600">{contractor?.contractorName || ''}</div>
                        {contractor?.quote && (
                          <div className="font-medium text-gray-900">{formatCurrency(contractor.quote)}</div>
                        )}
                      </div>
                    );
                  }
                  return (
                    <React.Fragment key={contractorIndex}>
                      <div className="col-span-1 text-center text-sm text-gray-600 self-center">
                        {contractor?.contractorName || ''}
                      </div>
                      <div className="col-span-1 text-center text-sm font-medium text-gray-900 self-center">
                        {contractor?.quote ? formatCurrency(contractor.quote) : ''}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};