import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Eye, CheckCircle, Clock, DollarSign, X, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

interface Bill {
  id: string;
  supplier_name: string;
  supplier_email: string | null;
  bill_no: string;
  bill_date: string;
  due_date: string;
  status: 'draft' | 'submitted' | 'approved' | 'scheduled' | 'paid' | 'void';
  subtotal: number;
  tax: number;
  total: number;
  paid_to_date: number;
}

interface ExpensesModuleProps {
  projectId: string;
}

export const ExpensesModule = ({ projectId }: ExpensesModuleProps) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inbox');
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

  const filteredBills = filterBillsByStatus(activeTab);

  return (
    <div className="space-y-4">

      {/* Bills Management */}
      <Card>
        <CardContent className="pt-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="inbox">For Approval</TabsTrigger>
              <TabsTrigger value="pending">Awaiting Payments</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
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
                  <table className="w-full border-collapse table-fixed">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-medium w-20 text-foreground">Bill #</th>
                        <th className="text-left p-2 font-medium text-foreground">Supplier</th>
                        <th className="text-left p-2 font-medium w-24 text-foreground">Date</th>
                        <th className="text-left p-2 font-medium w-24 text-foreground">Due Date</th>
                        <th className="text-left p-2 font-medium w-20 text-foreground">Total</th>
                        <th className="text-left p-2 font-medium w-20 text-foreground">Paid</th>
                        <th className="text-left p-2 font-medium w-20 text-foreground">Balance</th>
                        <th className="text-left p-2 font-medium w-20 text-foreground">Status</th>
                        <th className="text-left p-2 font-medium w-24 text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBills.map((bill) => (
                        <tr key={bill.id} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-mono text-sm truncate text-foreground">{bill.bill_no}</td>
                          <td className="p-2 truncate text-foreground">{bill.supplier_name}</td>
                          <td className="p-2 text-sm text-foreground">{format(new Date(bill.bill_date), 'MMM dd, yyyy')}</td>
                          <td className="p-2 text-sm text-foreground">{format(new Date(bill.due_date), 'MMM dd, yyyy')}</td>
                          <td className="p-2 font-medium text-sm text-foreground">{formatCurrency(bill.total)}</td>
                          <td className="p-2 font-medium text-sm text-foreground">{formatCurrency(bill.paid_to_date)}</td>
                          <td className="p-2 font-medium text-sm text-foreground">{formatCurrency(bill.total - bill.paid_to_date)}</td>
                          <td className="p-2">{getStatusBadge(bill.status)}</td>
                          <td className="p-2">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" title="View">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {bill.status === 'submitted' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleApproveBill(bill.id)}
                                  title="Approve"
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                              {['approved', 'scheduled'].includes(bill.status) && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleRecordPayment(bill.id)}
                                  title="Record Payment"
                                >
                                  <CreditCard className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'inbox' && (
                <div className="mt-6 p-6 border-2 border-dashed border-muted-foreground/25 rounded-lg text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-lg font-medium mb-2">Upload Bills</p>
                  <p className="text-muted-foreground mb-4">
                    Drag and drop PDF files here or click to browse
                  </p>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Files
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};