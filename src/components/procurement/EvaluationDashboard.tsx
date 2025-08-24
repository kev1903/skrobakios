import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, Clock, AlertTriangle, Search, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface RFQ {
  id: string;
  rfq_number: string;
  work_package: string;
  trade_category: string;
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
  vendor?: {
    id: string;
    name: string;
    trade_category: string;
  };
  rfq?: {
    rfq_number: string;
    work_package: string;
    trade_category: string;
  };
}

interface EvaluationDashboardProps {
  projectId: string;
  rfqs: RFQ[];
}

export const EvaluationDashboard: React.FC<EvaluationDashboardProps> = ({ projectId, rfqs }) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tradeFilter, setTradeFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (rfqs.length > 0) {
      fetchQuotes();
    }
  }, [rfqs]);

  useEffect(() => {
    filterQuotes();
  }, [quotes, searchTerm, statusFilter, tradeFilter]);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          vendor:vendors(id, name, trade_category),
          rfq:rfqs(rfq_number, work_package, trade_category)
        `)
        .in('rfq_id', rfqs.map(rfq => rfq.id))
        .neq('status', 'Invited')
        .order('evaluation_score', { ascending: false, nullsFirst: false });

      if (error) {
        console.error('Error fetching quotes:', error);
        toast.error('Failed to load quotes');
        return;
      }

      setQuotes(data || []);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      toast.error('Failed to load quotes');
    } finally {
      setLoading(false);
    }
  };

  const filterQuotes = () => {
    let filtered = quotes;

    if (searchTerm) {
      filtered = filtered.filter(quote =>
        quote.vendor?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.rfq?.work_package.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.quote_ref?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(quote => quote.status === statusFilter);
    }

    if (tradeFilter !== 'all') {
      filtered = filtered.filter(quote => quote.rfq?.trade_category === tradeFilter);
    }

    setFilteredQuotes(filtered);
  };

  const getDaysRemaining = (validityDate: string) => {
    const today = new Date();
    const validity = new Date(validityDate);
    const diffTime = validity.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getValidityStatus = (validityDate?: string) => {
    if (!validityDate) return { status: 'unknown', color: 'bg-gray-100 text-gray-800', days: null };
    
    const daysRemaining = getDaysRemaining(validityDate);
    
    if (daysRemaining < 0) {
      return { status: 'expired', color: 'bg-red-100 text-red-800', days: daysRemaining };
    } else if (daysRemaining <= 7) {
      return { status: 'expiring', color: 'bg-amber-100 text-amber-800', days: daysRemaining };
    } else {
      return { status: 'valid', color: 'bg-green-100 text-green-800', days: daysRemaining };
    }
  };

  const getComplianceColor = (isCompliant?: boolean) => {
    if (isCompliant === undefined) return 'bg-gray-100 text-gray-800';
    return isCompliant ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
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

  const getRowClassName = (quote: Quote) => {
    const validity = getValidityStatus(quote.validity_date);
    
    if (!quote.is_compliant) {
      return 'bg-red-50 hover:bg-red-100';
    }
    if (validity.status === 'expiring') {
      return 'bg-amber-50 hover:bg-amber-100';
    }
    if (quote.rank === 1) {
      return 'bg-green-50 hover:bg-green-100';
    }
    
    return 'hover:bg-muted/50';
  };

  const uniqueTrades = Array.from(new Set(rfqs.map(rfq => rfq.trade_category)));

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Evaluation Dashboard</h2>
        <Badge variant="outline">
          {filteredQuotes.length} of {quotes.length} quotes
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search vendors, work packages, or quote refs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Received">Received</SelectItem>
                <SelectItem value="Evaluated">Evaluated</SelectItem>
                <SelectItem value="Shortlisted">Shortlisted</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tradeFilter} onValueChange={setTradeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by trade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trades</SelectItem>
                {uniqueTrades.map(trade => (
                  <SelectItem key={trade} value={trade}>{trade}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quotes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Received Quotes</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredQuotes.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2 text-muted-foreground">No Quotes Found</h3>
              <p className="text-muted-foreground">
                {quotes.length === 0 
                  ? "No quotes have been received yet." 
                  : "No quotes match the current filters."
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>RFQ / Work Package</TableHead>
                    <TableHead>Trade</TableHead>
                    <TableHead className="text-right">Amount (Inc GST)</TableHead>
                    <TableHead className="text-center">Scope %</TableHead>
                    <TableHead className="text-center">Lead Time</TableHead>
                    <TableHead className="text-center">Compliance</TableHead>
                    <TableHead className="text-center">Validity</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead className="text-center">Rank</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotes.map((quote) => {
                    const validity = getValidityStatus(quote.validity_date);
                    
                    return (
                      <TableRow key={quote.id} className={getRowClassName(quote)}>
                        <TableCell className="font-medium">
                          <div>
                            <div>{quote.vendor?.name}</div>
                            {quote.quote_ref && (
                              <div className="text-sm text-muted-foreground">
                                Ref: {quote.quote_ref}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{quote.rfq?.rfq_number}</div>
                            <div className="text-sm text-muted-foreground">
                              {quote.rfq?.work_package}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {quote.rfq?.trade_category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {quote.quote_amount_inc_gst ? 
                            formatCurrency(quote.quote_amount_inc_gst) : 
                            'N/A'
                          }
                        </TableCell>
                        <TableCell className="text-center">
                          {quote.scope_coverage_percent ? `${quote.scope_coverage_percent}%` : 'N/A'}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Clock className="w-4 h-4" />
                            {quote.lead_time_days ? `${quote.lead_time_days}d` : 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={getComplianceColor(quote.is_compliant)}>
                            {quote.is_compliant === undefined ? 'Unknown' : 
                             quote.is_compliant ? 'Compliant' : 'Non-compliant'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {validity.days !== null ? (
                            <div className="flex items-center justify-center gap-1">
                              {validity.status === 'expired' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                              <Badge variant="outline" className={validity.color}>
                                {Math.abs(validity.days)}d {validity.days < 0 ? 'ago' : 'left'}
                              </Badge>
                            </div>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {quote.evaluation_score ? (
                            <Badge variant="outline" className="bg-blue-100 text-blue-800">
                              {quote.evaluation_score.toFixed(1)}
                            </Badge>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {getRankBadge(quote.rank)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {quote.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};