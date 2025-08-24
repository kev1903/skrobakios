import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { CheckCircle, XCircle, Calendar, Clock, TrendingUp, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

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

interface QuoteMatrixProps {
  projectId: string;
  rfqs: RFQ[];
  onRFQUpdate: () => void;
}

export const QuoteMatrix: React.FC<QuoteMatrixProps> = ({ projectId, rfqs, onRFQUpdate }) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

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

  // Group RFQs by trade category
  const groupedRFQs = rfqs.reduce((acc, rfq) => {
    if (!acc[rfq.trade_category]) {
      acc[rfq.trade_category] = [];
    }
    acc[rfq.trade_category].push(rfq);
    return acc;
  }, {} as Record<string, RFQ[]>);

  // Get vendors that have submitted quotes for any RFQ
  const activeVendors = vendors.filter(vendor => 
    quotes.some(quote => quote.vendor_id === vendor.id)
  );

  const getQuoteForRFQAndVendor = (rfqId: string, vendorId: string) => {
    return quotes.find(quote => quote.rfq_id === rfqId && quote.vendor_id === vendorId);
  };

  const getDaysRemaining = (validityDate: string) => {
    const today = new Date();
    const validity = new Date(validityDate);
    const diffTime = validity.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getRankBadge = (rank?: number) => {
    if (!rank) return null;
    
    const colors = {
      1: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      2: 'bg-gray-100 text-gray-800 border-gray-300',
      3: 'bg-orange-100 text-orange-800 border-orange-300'
    };
    
    return (
      <Badge variant="outline" className={colors[rank as keyof typeof colors] || 'bg-blue-100 text-blue-800'}>
        #{rank}
      </Badge>
    );
  };

  const handleRecommendVendor = async (rfqId: string, quoteId: string) => {
    try {
      const { error } = await supabase
        .from('rfqs')
        .update({ status: 'Recommended' })
        .eq('id', rfqId);

      if (error) {
        console.error('Error recommending vendor:', error);
        toast.error('Failed to recommend vendor');
        return;
      }

      toast.success('Vendor recommended successfully');
      onRFQUpdate();
    } catch (error) {
      console.error('Error recommending vendor:', error);
      toast.error('Failed to recommend vendor');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-48"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (rfqs.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="text-muted-foreground">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No RFQs Created</h3>
            <p>Create your first RFQ to start building the quote matrix.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Quote Matrix</h2>
        <div className="flex gap-2">
          <Badge variant="outline">
            {rfqs.length} RFQs
          </Badge>
          <Badge variant="outline">
            {quotes.length} Quotes
          </Badge>
        </div>
      </div>

      {Object.entries(groupedRFQs).map(([tradeCategory, categoryRFQs]) => (
        <Card key={tradeCategory}>
          <CardHeader>
            <CardTitle className="text-lg">{tradeCategory}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Work Package</TableHead>
                    {activeVendors.map(vendor => (
                      <TableHead key={vendor.id} className="min-w-[180px] text-center">
                        {vendor.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryRFQs.map(rfq => (
                    <TableRow key={rfq.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-medium">{rfq.work_package}</div>
                          <div className="text-sm text-muted-foreground">{rfq.rfq_number}</div>
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {rfq.status}
                          </Badge>
                        </div>
                      </TableCell>
                      {activeVendors.map(vendor => {
                        const quote = getQuoteForRFQAndVendor(rfq.id, vendor.id);
                        
                        if (!quote) {
                          return (
                            <TableCell key={vendor.id} className="text-center text-muted-foreground">
                              <div className="py-4">-</div>
                            </TableCell>
                          );
                        }

                        const validityDays = quote.validity_date ? getDaysRemaining(quote.validity_date) : null;

                        return (
                          <TableCell key={vendor.id} className="text-center">
                            <Sheet>
                              <SheetTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  className="h-auto p-2 flex flex-col items-center space-y-1 hover:bg-muted"
                                  onClick={() => setSelectedQuote(quote)}
                                >
                                  <div className="font-bold text-lg">
                                    {quote.quote_amount_inc_gst ? 
                                      formatCurrency(quote.quote_amount_inc_gst) : 
                                      'N/A'
                                    }
                                  </div>
                                  <div className="text-xs space-y-0.5">
                                    {quote.scope_coverage_percent && (
                                      <div>Coverage: {quote.scope_coverage_percent}%</div>
                                    )}
                                    {quote.lead_time_days && (
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {quote.lead_time_days}d
                                      </div>
                                    )}
                                    <div className="flex items-center justify-center gap-1">
                                      {quote.is_compliant ? 
                                        <CheckCircle className="w-3 h-3 text-green-600" /> :
                                        <XCircle className="w-3 h-3 text-red-600" />
                                      }
                                    </div>
                                    {validityDays !== null && (
                                      <div className={`flex items-center gap-1 text-xs ${
                                        validityDays < 7 ? 'text-red-600' : 
                                        validityDays < 14 ? 'text-yellow-600' : 
                                        'text-green-600'
                                      }`}>
                                        <Calendar className="w-3 h-3" />
                                        {validityDays}d
                                      </div>
                                    )}
                                    {quote.evaluation_score && (
                                      <div className="text-blue-600">
                                        Score: {quote.evaluation_score.toFixed(1)}
                                      </div>
                                    )}
                                    {getRankBadge(quote.rank)}
                                  </div>
                                </Button>
                              </SheetTrigger>
                              <SheetContent className="w-[400px] sm:w-[540px]">
                                <SheetHeader>
                                  <SheetTitle>Quote Details</SheetTitle>
                                </SheetHeader>
                                {selectedQuote && (
                                  <div className="mt-6 space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">Vendor</label>
                                        <p className="font-medium">{selectedQuote.vendor?.name}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">Quote Ref</label>
                                        <p>{selectedQuote.quote_ref || 'N/A'}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">Amount (Inc GST)</label>
                                        <p className="font-bold text-lg">
                                          {selectedQuote.quote_amount_inc_gst ? 
                                            formatCurrency(selectedQuote.quote_amount_inc_gst) : 
                                            'N/A'
                                          }
                                        </p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">Lead Time</label>
                                        <p>{selectedQuote.lead_time_days ? `${selectedQuote.lead_time_days} days` : 'N/A'}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">Scope Coverage</label>
                                        <p>{selectedQuote.scope_coverage_percent ? `${selectedQuote.scope_coverage_percent}%` : 'N/A'}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">Compliance</label>
                                        <div className="flex items-center gap-2">
                                          {selectedQuote.is_compliant ? 
                                            <CheckCircle className="w-4 h-4 text-green-600" /> :
                                            <XCircle className="w-4 h-4 text-red-600" />
                                          }
                                          <span>{selectedQuote.is_compliant ? 'Compliant' : 'Non-compliant'}</span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {selectedQuote.evaluation_score && (
                                      <div className="p-4 bg-muted rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                          <Award className="w-5 h-5 text-yellow-600" />
                                          <span className="font-medium">Evaluation Score</span>
                                        </div>
                                        <div className="text-2xl font-bold text-yellow-600">
                                          {selectedQuote.evaluation_score.toFixed(1)}/10
                                        </div>
                                        {selectedQuote.rank && (
                                          <div className="mt-2">
                                            {getRankBadge(selectedQuote.rank)}
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    <div className="flex gap-2 pt-4">
                                      <Button 
                                        onClick={() => handleRecommendVendor(rfq.id, selectedQuote.id)}
                                        disabled={rfq.status === 'Recommended'}
                                        className="flex-1"
                                      >
                                        {rfq.status === 'Recommended' ? 'Already Recommended' : 'Recommend Vendor'}
                                      </Button>
                                      <Button variant="outline" className="flex-1">
                                        Send for Approval
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </SheetContent>
                            </Sheet>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};