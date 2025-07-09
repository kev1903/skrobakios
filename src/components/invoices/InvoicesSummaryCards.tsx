
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface InvoiceStats {
  outstandingCount: number;
  outstandingTotal: number;
  overdueCount: number;
  overdueTotal: number;
  pastDueCount: number;
  pastDueTotal: number;
  currency: string;
}

export const InvoicesSummaryCards = () => {
  const [stats, setStats] = useState<InvoiceStats>({
    outstandingCount: 0,
    outstandingTotal: 0,
    overdueCount: 0,
    overdueTotal: 0,
    pastDueCount: 0,
    pastDueTotal: 0,
    currency: 'USD'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoiceStats();
  }, []);

  const fetchInvoiceStats = async () => {
    try {
      const { data: invoices, error } = await supabase
        .from('xero_invoices')
        .select('*');

      if (error) {
        console.error('Error fetching invoice stats:', error);
        return;
      }

      if (!invoices || invoices.length === 0) {
        setLoading(false);
        return;
      }

      const now = new Date();
      const outstanding = invoices.filter(inv => inv.status !== 'PAID' && parseFloat(String(inv.amount_due || 0)) > 0);
      const overdue = invoices.filter(inv => {
        if (inv.status === 'PAID') return false;
        if (!inv.due_date) return false;
        return new Date(inv.due_date) < now;
      });
      
      const currency = invoices[0]?.currency_code || 'USD';

      setStats({
        outstandingCount: outstanding.length,
        outstandingTotal: outstanding.reduce((sum, inv) => sum + parseFloat(String(inv.amount_due || 0)), 0),
        overdueCount: overdue.length,
        overdueTotal: overdue.reduce((sum, inv) => sum + parseFloat(String(inv.amount_due || 0)), 0),
        pastDueCount: overdue.length, // Same as overdue for simplicity
        pastDueTotal: overdue.reduce((sum, inv) => sum + parseFloat(String(inv.amount_due || 0)), 0),
        currency
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Total of {stats.outstandingCount} outstanding invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.outstandingTotal, stats.currency)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Total of {stats.overdueCount} overdue invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.overdueTotal, stats.currency)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center space-x-2">
            <span>Total of {stats.pastDueCount} past expected date invoices</span>
            {stats.pastDueCount > 0 && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.pastDueTotal, stats.currency)}</div>
        </CardContent>
      </Card>
    </div>
  );
};
