
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface InvoiceStats {
  authorisedCount: number;
  authorisedTotal: number;
  overdueCount: number;
  overdueTotal: number;
  expectedThisWeekCount: number;
  expectedThisWeekTotal: number;
  currency: string;
}

export const InvoicesSummaryCards = () => {
  const [stats, setStats] = useState<InvoiceStats>({
    authorisedCount: 0,
    authorisedTotal: 0,
    overdueCount: 0,
    overdueTotal: 0,
    expectedThisWeekCount: 0,
    expectedThisWeekTotal: 0,
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
        .select('*')
        .eq('type', 'ACCREC'); // Filter for accounts receivable invoices only

      if (error) {
        console.error('Error fetching invoice stats:', error);
        return;
      }

      if (!invoices || invoices.length === 0) {
        setLoading(false);
        return;
      }

      const now = new Date();
      
      // Calculate next Friday
      const today = new Date();
      const daysUntilFriday = (5 - today.getDay() + 7) % 7; // 5 = Friday
      const nextFriday = new Date(today);
      nextFriday.setDate(today.getDate() + (daysUntilFriday === 0 ? 7 : daysUntilFriday));
      nextFriday.setHours(23, 59, 59, 999); // End of Friday

      const authorised = invoices.filter(inv => inv.status === 'AUTHORISED');
      const overdue = invoices.filter(inv => {
        if (inv.status === 'PAID') return false;
        if (!inv.due_date) return false;
        return new Date(inv.due_date) < now;
      });
      
      const expectedThisWeek = invoices.filter(inv => {
        if (inv.status === 'PAID') return false;
        if (!inv.due_date) return false;
        const dueDate = new Date(inv.due_date);
        return dueDate >= now && dueDate <= nextFriday && parseFloat(String(inv.amount_due || 0)) > 0;
      });
      
      const currency = invoices[0]?.currency_code || 'USD';

      setStats({
        authorisedCount: authorised.length,
        authorisedTotal: authorised.reduce((sum, inv) => sum + parseFloat(String(inv.total || 0)), 0),
        overdueCount: overdue.length,
        overdueTotal: overdue.reduce((sum, inv) => sum + parseFloat(String(inv.amount_due || 0)), 0),
        expectedThisWeekCount: expectedThisWeek.length,
        expectedThisWeekTotal: expectedThisWeek.reduce((sum, inv) => sum + parseFloat(String(inv.amount_due || 0)), 0),
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
            Total of {stats.authorisedCount} authorised invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.authorisedTotal, stats.currency)}</div>
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
          <CardTitle className="text-sm font-medium text-gray-600">
            Total of {stats.expectedThisWeekCount} expected payments until Friday
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.expectedThisWeekTotal, stats.currency)}</div>
        </CardContent>
      </Card>
    </div>
  );
};
