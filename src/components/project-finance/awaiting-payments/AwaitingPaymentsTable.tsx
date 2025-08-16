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
        .eq('status', 'scheduled')
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

  const handleMarkAsPaid = async (billId: string) => {
    try {
      const { error } = await supabase
        .from('bills')
        .update({ status: 'paid' })
        .eq('id', billId);

      if (error) throw error;
      
      // Refresh the bills list
      fetchApprovedBills();
    } catch (error) {
      console.error('Error marking bill as paid:', error);
    }
  };

  const getStatusBadge = (status: string, billId: string) => {
    switch (status) {
      case 'scheduled':
        return (
          <Badge 
            variant="default" 
            className="bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200 transition-colors"
            onClick={() => handleMarkAsPaid(billId)}
          >
            Paid
          </Badge>
        );
      case 'part_paid':
        return <Badge variant="secondary">Part Paid</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Approved</Badge>;
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
              <th className="text-left p-2 font-medium text-foreground text-xs">From</th>
              <th className="text-left p-2 font-medium w-32 text-foreground text-xs">Reference</th>
              <th className="text-left p-2 font-medium w-28 text-foreground text-xs">Date ↓</th>
              <th className="text-left p-2 font-medium w-28 text-foreground text-xs">Due date</th>
              <th className="text-left p-2 font-medium w-24 text-foreground text-xs">Amount</th>
              <th className="text-left p-2 font-medium w-12 text-xs"></th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill) => (
              <tr key={bill.id} className="border-b hover:bg-muted/30 group h-12">
                <td className="p-2">
                  <input 
                    type="checkbox" 
                    className="rounded"
                    checked={selectedBills.includes(bill.id)}
                    onChange={(e) => handleSelectBill(bill.id, e.target.checked)}
                  />
                </td>
                <td className="p-2">
                  <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                    <Eye className="h-3 w-3 text-blue-600" />
                  </Button>
                </td>
                <td className="p-2 text-foreground font-medium text-xs">{bill.supplier_name}</td>
                <td className="p-2 text-foreground">
                  <div>
                    <div className="font-medium text-xs">{bill.bill_no}</div>
                  </div>
                </td>
                <td className="p-2 text-foreground text-xs">{formatDate(bill.bill_date)}</td>
                <td className="p-2 text-foreground text-xs">
                  <span className={new Date(bill.due_date) < new Date() ? 'text-red-600' : 'text-foreground'}>
                    {formatDate(bill.due_date)}
                  </span>
                </td>
                <td className="p-2 text-foreground font-medium text-xs">{formatCurrency(bill.total)}</td>
                <td className="p-2">
                  <div className="opacity-0 group-hover:opacity-100">
                    {getStatusBadge(bill.status, bill.id)}
                  </div>
                </td>
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