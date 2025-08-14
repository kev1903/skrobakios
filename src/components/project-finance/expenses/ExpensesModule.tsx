import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Eye, CheckCircle, Clock, DollarSign, X, CreditCard, FileText, Download } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

interface Bill {
  id: string;
  supplier_name: string;
  supplier_email: string | null;
  bill_no: string;
  reference_number: string | null;
  bill_date: string;
  due_date: string;
  status: 'draft' | 'submitted' | 'approved' | 'scheduled' | 'paid' | 'void';
  subtotal: number;
  tax: number;
  total: number;
  paid_to_date: number;
  file_attachments: any;
  forwarded_bill: boolean;
}

interface ExpensesModuleProps {
  projectId: string;
  statusFilter?: string;
}

export const ExpensesModule = ({ projectId, statusFilter = 'inbox' }: ExpensesModuleProps) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadBills = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBills(data || []);
    } catch (error) {
      console.error('Error loading bills:', error);
      toast({
        title: "Error",
        description: "Failed to load bills",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBills();
  }, [projectId]);

  const getStatusBadge = (status: Bill['status']) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>;
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Approved</Badge>;
      case 'submitted':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending Approval</Badge>;
      case 'scheduled':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Scheduled</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleApproveBill = async (billId: string) => {
    try {
      const { error } = await supabase
        .from('bills')
        .update({ status: 'approved' })
        .eq('id', billId);

      if (error) throw error;

      // Log approval event
      await supabase.from('events').insert({
        project_id: projectId,
        name: 'bill_approved',
        ref_table: 'bills',
        ref_id: billId,
        payload: { approved_by: 'current_user' }
      });

      toast({
        title: "Success",
        description: "Bill approved successfully"
      });
      
      loadBills();
    } catch (error) {
      console.error('Error approving bill:', error);
      toast({
        title: "Error",
        description: "Failed to approve bill",
        variant: "destructive"
      });
    }
  };

  const handleRecordPayment = async (billId: string) => {
    toast({
      title: "Coming Soon",
      description: "Payment recording will be implemented soon"
    });
  };

  const filterBillsByStatus = (status: string) => {
    switch (status) {
      case 'inbox':
        return bills.filter(bill => bill.status === 'draft' || bill.status === 'submitted');
      case 'pending':
        return bills.filter(bill => bill.status === 'submitted');
      case 'scheduled':
        return bills.filter(bill => bill.status === 'approved' || bill.status === 'scheduled');
      case 'paid':
        return bills.filter(bill => bill.status === 'paid');
      default:
        return bills;
    }
  };

  const summaryData = {
    totalBills: bills.reduce((sum, bill) => sum + bill.total, 0),
    totalPaid: bills.reduce((sum, bill) => sum + bill.paid_to_date, 0),
    outstanding: bills.reduce((sum, bill) => sum + (bill.total - bill.paid_to_date), 0),
    pending: bills.filter(bill => bill.status === 'submitted').length,
  };

  const filteredBills = filterBillsByStatus(statusFilter);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8 text-foreground">Loading bills...</div>
          ) : filteredBills.length === 0 ? (
            <div className="text-center py-8 text-foreground">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-foreground">No bills found in this category.</p>
              <p className="text-sm mt-2 text-muted-foreground">Upload bills or create new entries to get started.</p>
            </div>
          ) : (
            <div className="w-full">
              {/* Action Bar */}
              <div className="flex items-center gap-2 mb-4 p-2 bg-muted/30 rounded-lg">
                <Button variant="outline" size="sm" className="bg-blue-600 text-white hover:bg-blue-700 border-blue-600">
                  Approve
                </Button>
                <Button variant="outline" size="sm">Submit for approval</Button>
                <Button variant="outline" size="sm">Delete</Button>
                <Button variant="outline" size="sm">Print</Button>
                <div className="ml-auto text-sm text-muted-foreground">
                  {filteredBills.length} items | {formatCurrency(filteredBills.reduce((sum, bill) => sum + bill.total, 0))}
                </div>
              </div>

              {/* Bills Table */}
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium w-12">
                      <input type="checkbox" className="rounded" />
                    </th>
                    <th className="text-left p-3 font-medium w-16 text-foreground">View</th>
                    <th className="text-left p-3 font-medium text-foreground">From</th>
                    <th className="text-left p-3 font-medium w-32 text-foreground">Reference</th>
                    <th className="text-left p-3 font-medium w-28 text-foreground">Date ↓</th>
                    <th className="text-left p-3 font-medium w-28 text-foreground">Due date</th>
                    <th className="text-left p-3 font-medium w-24 text-foreground">Due</th>
                    <th className="text-left p-3 font-medium w-16 text-foreground">Files</th>
                    <th className="text-left p-3 font-medium w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBills.map((bill) => (
                    <tr key={bill.id} className="border-b hover:bg-muted/30 group">
                      <td className="p-3"><input type="checkbox" className="rounded" /></td>
                      <td className="p-3">
                        <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                          <Eye className="h-4 w-4 text-blue-600" />
                        </Button>
                      </td>
                      <td className="p-3 text-foreground font-medium">{bill.supplier_name}</td>
                      <td className="p-3 text-foreground">
                        <div>
                          <div className="font-mono text-sm">{bill.reference_number || bill.bill_no}</div>
                          {bill.forwarded_bill && <div className="text-xs text-blue-600 italic">Forwarded Bill</div>}
                        </div>
                      </td>
                      <td className="p-3 text-foreground text-sm">{format(new Date(bill.bill_date), 'dd MMM yyyy')}</td>
                      <td className="p-3 text-foreground text-sm">
                        {bill.due_date && (
                          <span className={new Date(bill.due_date) < new Date() ? 'text-red-600' : 'text-foreground'}>
                            {format(new Date(bill.due_date), 'dd MMM yyyy')}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-foreground font-medium">{formatCurrency(bill.total - bill.paid_to_date)}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          {bill.file_attachments && Array.isArray(bill.file_attachments) && bill.file_attachments.length > 0 ? (
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-medium">{bill.file_attachments.length}</span>
                              <FileText className="h-4 w-4 text-blue-600" />
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">0</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 p-1 h-6 w-6">
                          <span className="text-xs">⋯</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};