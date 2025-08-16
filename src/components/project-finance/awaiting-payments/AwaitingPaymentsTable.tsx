import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, DollarSign } from 'lucide-react';

interface Bill {
  id: string;
  bill_no: string;
  supplier_name: string;
  bill_date: string;
  due_date: string;
  total: number;
  status: string;
  paid_to_date: number;
}

interface AwaitingPaymentsTableProps {
  projectId: string;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
}

export const AwaitingPaymentsTable: React.FC<AwaitingPaymentsTableProps> = ({
  projectId,
  formatCurrency,
  formatDate
}) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBills, setSelectedBills] = useState<string[]>([]);

  useEffect(() => {
    fetchApprovedBills();
  }, [projectId]);

  const fetchApprovedBills = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('project_id', projectId)
        .eq('status', 'approved')
        .order('due_date', { ascending: true });

      if (error) throw error;
      setBills(data || []);
    } catch (error) {
      console.error('Error fetching approved bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBills(bills.map(bill => bill.id));
    } else {
      setSelectedBills([]);
    }
  };

  const handleSelectBill = (billId: string, checked: boolean) => {
    if (checked) {
      setSelectedBills(prev => [...prev, billId]);
    } else {
      setSelectedBills(prev => prev.filter(id => id !== billId));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Approved</Badge>;
      case 'part_paid':
        return <Badge variant="secondary">Part Paid</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading approved bills...</p>
        </div>
      </div>
    );
  }

  if (bills.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8 text-foreground">
          <div className="h-12 w-12 mx-auto mb-4 text-muted-foreground flex items-center justify-center">
            <DollarSign className="h-8 w-8" />
          </div>
          <p className="text-foreground">No approved bills awaiting payment.</p>
          <p className="text-sm mt-2 text-muted-foreground">Approved bills will appear here when ready for payment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="w-full">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-2 font-medium w-12 text-xs">
                <input 
                  type="checkbox" 
                  className="rounded" 
                  checked={selectedBills.length === bills.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <th className="text-left p-2 font-medium w-16 text-foreground text-xs">View</th>
              <th className="text-left p-2 font-medium text-foreground text-xs">Supplier</th>
              <th className="text-left p-2 font-medium w-32 text-foreground text-xs">Bill #</th>
              <th className="text-left p-2 font-medium w-28 text-foreground text-xs">Bill Date</th>
              <th className="text-left p-2 font-medium w-28 text-foreground text-xs">Due Date</th>
              <th className="text-left p-2 font-medium w-24 text-foreground text-xs">Amount</th>
              <th className="text-left p-2 font-medium w-20 text-foreground text-xs">Status</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill) => (
              <tr key={bill.id} className="border-b hover:bg-muted/25 transition-colors">
                <td className="p-2">
                  <input 
                    type="checkbox" 
                    className="rounded"
                    checked={selectedBills.includes(bill.id)}
                    onChange={(e) => handleSelectBill(bill.id, e.target.checked)}
                  />
                </td>
                <td className="p-2">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Eye className="h-3 w-3" />
                  </Button>
                </td>
                <td className="p-2 text-sm text-foreground">{bill.supplier_name}</td>
                <td className="p-2 text-sm font-mono text-foreground">{bill.bill_no}</td>
                <td className="p-2 text-sm text-muted-foreground">{formatDate(bill.bill_date)}</td>
                <td className="p-2 text-sm text-muted-foreground">{formatDate(bill.due_date)}</td>
                <td className="p-2 text-sm font-semibold text-foreground">{formatCurrency(bill.total)}</td>
                <td className="p-2">{getStatusBadge(bill.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {selectedBills.length > 0 && (
        <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg border">
          <span className="text-sm text-muted-foreground">
            {selectedBills.length} bill(s) selected
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Mark as Paid
            </Button>
            <Button variant="outline" size="sm">
              Schedule Payment
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};