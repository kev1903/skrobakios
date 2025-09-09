import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { useWBS } from '@/hooks/useWBS';

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
  
  // Load WBS items from database
  const { wbsItems, loading: wbsLoading } = useWBS(projectId);
  
  // Debug: ensure we're using the updated code
  console.log('QuoteMatrix: Using WBS items:', wbsItems.length);

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

  // Build WBS matrix data
  const buildWBSMatrix = (): WBSRow[] => {
    return wbsItems.map(wbsItem => {
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
        contractors
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Quote Matrix</h1>
      </div>

      <div className="bg-background border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground min-w-[200px]">
                  WBS
                </th>
                {[1, 2, 3, 4, 5].map((num) => (
                  <React.Fragment key={num}>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground min-w-[120px]">
                      Contractor {num}
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground min-w-[130px]">
                      Quote/ Estimate {num}
                    </th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {wbsMatrix.map((row, index) => (
                <tr 
                  key={row.wbsId} 
                  className={`border-b hover:bg-muted/20 transition-colors ${
                    index % 2 === 0 ? 'bg-background' : 'bg-muted/5'
                  }`}
                >
                  <td className="py-4 px-4 font-medium text-foreground">
                    <div>
                      <div className="font-medium">{row.wbsId}</div>
                      <div className="text-sm text-muted-foreground">{row.title}</div>
                    </div>
                  </td>
                  {[0, 1, 2, 3, 4].map((contractorIndex) => {
                    const contractor = row.contractors[contractorIndex];
                    return (
                      <React.Fragment key={contractorIndex}>
                        <td className="py-4 px-4 text-center text-sm text-foreground">
                          {contractor?.contractorName || ''}
                        </td>
                        <td className="py-4 px-4 text-center text-sm font-medium text-foreground">
                          {contractor?.quote ? formatCurrency(contractor.quote) : ''}
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};