
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { BillsTableControls } from "./BillsTableControls";
import { BillsTableHeader } from "./BillsTableHeader";
import { BillsTableRow } from "./BillsTableRow";
import { BillsTableFooter } from "./BillsTableFooter";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface BillsTableProps {
  refreshTrigger?: number;
}

export const BillsTable = ({ refreshTrigger }: BillsTableProps) => {
  const [selectedBills, setSelectedBills] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBills();
  }, [refreshTrigger]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      
      // Get user's company_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: memberData, error: memberError } = await supabase
        .from('company_members')
        .select('company_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      console.log('Bills table - company lookup:', { memberData, memberError, userId: user.id });

      if (memberError) {
        console.error('Error fetching company membership:', memberError);
        toast({
          title: "Error",
          description: "Failed to fetch company information",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!memberData || memberData.length === 0) {
        console.warn('No active company membership found');
        setLoading(false);
        return;
      }

      const companyId = memberData[0].company_id;

      // Fetch bills with project information
      const { data, error } = await supabase
        .from('bills')
        .select(`
          *,
          projects:project_id (
            id,
            name,
            project_id
          )
        `)
        .eq('company_id', companyId)
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Error fetching bills:', error);
        toast({
          title: "Error",
          description: "Failed to fetch bills",
          variant: "destructive",
        });
        return;
      }

      // Transform database records to match component interface
      const transformedBills = (data || []).map(bill => ({
        id: bill.id,
        dueDate: new Date(bill.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, ' '),
        vendor: bill.supplier_name,
        billNumber: bill.bill_no,
        project: bill.projects?.name || '-',
        amount: bill.total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","),
        overdue: new Date(bill.due_date) < new Date() && bill.payment_status === 'unpaid',
        hasWarning: new Date(bill.due_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && bill.payment_status === 'unpaid',
        linkedCashInAccount: "",
        toPay: bill.to_pay || "",
      }));

      setBills(transformedBills);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
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
      setSelectedBills([...selectedBills, billId]);
    } else {
      setSelectedBills(selectedBills.filter(id => id !== billId));
    }
  };

  const handleAccountLinkChange = (billId: string, accountId: string) => {
    setBills(prevBills =>
      prevBills.map(bill =>
        bill.id === billId
          ? { ...bill, linkedCashInAccount: accountId }
          : bill
      )
    );
    console.log(`Bill ${billId} linked to account: ${accountId}`);
  };

  const handleToPayChange = async (billId: string, toPay: string) => {
    // Update local state immediately for responsive UI
    setBills(prevBills =>
      prevBills.map(bill =>
        bill.id === billId
          ? { ...bill, toPay }
          : bill
      )
    );

    // Save to database
    try {
      const { error } = await supabase
        .from('bills')
        .update({ to_pay: toPay })
        .eq('id', billId);

      if (error) {
        console.error('Error updating payer:', error);
        toast({
          title: "Error",
          description: "Failed to update payer allocation",
          variant: "destructive",
        });
        // Revert local state on error
        fetchBills();
        return;
      }

      console.log(`Bill ${billId} payer saved to database: ${toPay}`);
      toast({
        title: "Payer Updated",
        description: "Bill payer has been saved successfully",
      });
    } catch (err) {
      console.error('Update error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      fetchBills();
    }
  };

  const handleDeleteBill = async (billId: string) => {
    try {
      // Delete from database
      const { error } = await supabase
        .from('bills')
        .delete()
        .eq('id', billId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete bill",
          variant: "destructive",
        });
        console.error('Delete error:', error);
        return;
      }

      // Update local state
      setBills(prevBills => prevBills.filter(bill => bill.id !== billId));
      setSelectedBills(prevSelected => prevSelected.filter(id => id !== billId));
      
      toast({
        title: "Bill Deleted",
        description: "The bill has been deleted successfully",
      });
    } catch (err) {
      console.error('Delete error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-luxury-gold mr-2" />
        <span className="text-sm text-muted-foreground">Loading bills...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <BillsTableControls 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <Table>
        <BillsTableHeader
          selectedCount={selectedBills.length}
          totalCount={bills.length}
          onSelectAll={handleSelectAll}
        />
        <TableBody>
          {bills.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                No bills found. Upload your first bill to get started.
              </TableCell>
            </TableRow>
          ) : (
            bills.map((bill) => (
              <BillsTableRow
                key={bill.id}
                bill={bill}
                isSelected={selectedBills.includes(bill.id)}
                onSelect={handleSelectBill}
                onAccountLinkChange={handleAccountLinkChange}
                onToPayChange={handleToPayChange}
                onDelete={handleDeleteBill}
              />
            ))
          )}
        </TableBody>
      </Table>

      <BillsTableFooter />
    </div>
  );
};
