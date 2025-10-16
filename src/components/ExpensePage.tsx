import { ExpenseTable } from "./expense/ExpenseTable";
import { ExpenseTrendChart } from "./expense/ExpenseTrendChart";
import { Button } from "@/components/ui/button";
import { Settings, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ExpensePageProps {
  onNavigate?: (page: string) => void;
  onTabChange?: (tab: string) => void;
}

export const ExpensePage = ({ onNavigate, onTabChange }: ExpensePageProps) => {
  const { toast } = useToast();

  const handleBulkExpenseImport = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: companyMember } = await supabase
        .from('company_members')
        .select('company_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle();

      if (!companyMember) throw new Error('No active company found');

      // Map vendor/description to account codes
      const mapToAccountCode = (vendor: string, description: string): string => {
        const combined = (vendor + " " + description).toLowerCase();
        
        if (combined.includes('materials') || combined.includes('gravel') || combined.includes('construction materials')) return '455';
        if (combined.includes('equipment hire') || combined.includes('kennards') || combined.includes('aim hire')) return '421';
        if (combined.includes('consumables') || combined.includes('kmart')) return '453';
        if (combined.includes('vehicle registration') || combined.includes('vicroads')) return '449';
        if (combined.includes('server') || combined.includes('software') || combined.includes('amazon web') || combined.includes('paddle') || combined.includes('smartsheet') || combined.includes('lovable')) return '470';
        if (combined.includes('subscription') || combined.includes('prime video') || combined.includes('xero') || combined.includes('programa')) return '485';
        if (combined.includes('wage') || combined.includes('salary')) return '477';
        if (combined.includes('freelance') || combined.includes('upwork')) return '465';
        if (combined.includes('insurance') || combined.includes('budget direct') || combined.includes('bizcover')) return '433';
        if (combined.includes('finance') || combined.includes('loan') || combined.includes('iqumulate') || combined.includes('ato loan')) return '437';
        if (combined.includes('subcontract') || combined.includes('consultant') || combined.includes('joseph samar') || combined.includes('warren junkeer') || combined.includes('hm painting') || combined.includes('michael salau')) return '504';
        if (combined.includes('company renewal') || combined.includes('asic') || combined.includes('permit') || combined.includes('council') || combined.includes('bpay')) return '422';
        if (combined.includes('electronics') || combined.includes('hardware') || combined.includes('centrecom')) return '470';
        if (combined.includes('internet') || combined.includes('optus')) return '489';
        if (combined.includes('roofing') || combined.includes('quotation')) return '455';
        if (combined.includes('sector services')) return '429';
        if (combined.includes('haircut')) return '500';
        
        return '429'; // General Expenses as fallback
      };

      // Expense data from PDF
      const expensesData = [
        { date: '2025-07-01', vendor: 'Leongatha Garden Supply', desc: 'Materials (Gravel)', amount: 221.00, method: 'Card xx9563', project: null },
        { date: '2025-07-02', vendor: 'Kennards Hire – Seven Hills', desc: 'Equipment Hire', amount: 162.00, method: 'Card xx9563', project: null },
        { date: '2025-07-03', vendor: 'Kmart Clayton', desc: 'Consumables', amount: 58.00, method: 'Card xx9563', project: null },
        { date: '2025-07-04', vendor: 'Vicroads Online Payment', desc: 'Vehicle registration fees', amount: 230.68, method: 'Card xx9563', project: null },
        { date: '2025-07-05', vendor: 'Aim Hire', desc: 'Equipment Hire', amount: 154.00, method: 'Transfer', project: null },
        { date: '2025-07-06', vendor: 'Amazon Web Services', desc: 'Server usage', amount: 7.59, method: 'Card xx9563', project: null },
        { date: '2025-07-07', vendor: 'Prime Video', desc: 'Subscription', amount: 6.99, method: 'Card xx9563', project: null },
        { date: '2025-07-08', vendor: 'Wage Transfer (xx0152)', desc: 'Staff wage payment', amount: 1000.00, method: 'Transfer', project: null },
        { date: '2025-07-09', vendor: 'Upwork', desc: 'Freelance Services – Ref 833616153', amount: 387.53, method: 'Card xx9563', project: null },
        { date: '2025-07-10', vendor: 'Budget Direct', desc: 'Insurance premium', amount: 247.57, method: 'Direct Debit', project: null },
        { date: '2025-07-11', vendor: 'IQumulate Funding', desc: 'Finance Repayment 000092815962', amount: 463.44, method: 'Direct Debit', project: null },
        { date: '2025-07-12', vendor: 'ATO Loan Transfer', desc: 'Loan Repayment', amount: 2200.00, method: 'Transfer', project: 'Thanet Project' },
        { date: '2025-07-13', vendor: 'Xero', desc: 'Subscription INV-45600261', amount: 123.50, method: 'Card xx9563', project: null },
        { date: '2025-08-01', vendor: 'Joseph Samar', desc: 'Subcontract Payment', amount: 1560.00, method: 'Transfer', project: 'Gaskett Job' },
        { date: '2025-08-02', vendor: 'Staff Wage Transfer', desc: 'Salary Payment', amount: 1000.00, method: 'Transfer', project: null },
        { date: '2025-08-03', vendor: 'Upwork', desc: 'Ref 835791774 Freelance Services', amount: 529.28, method: 'Card xx9563', project: null },
        { date: '2025-08-04', vendor: 'ASIC Sydney', desc: 'Company Renewal Fee', amount: 45.00, method: 'Card xx9563', project: null },
        { date: '2025-08-05', vendor: 'Warren Junkeer', desc: 'Consultant Fee', amount: 1000.00, method: 'Transfer', project: 'Skrobaki PM' },
        { date: '2025-08-06', vendor: 'HM Painting & Building Maintenance', desc: 'Subcontract Work', amount: 1500.00, method: 'Transfer', project: 'Invoice 1047' },
        { date: '2025-08-07', vendor: 'Sector Services Pty Ltd', desc: 'Services', amount: 66.00, method: 'Transfer', project: 'INV-4211' },
        { date: '2025-09-01', vendor: 'BizCover', desc: 'Insurance premium 698710398', amount: 96.17, method: 'Direct Debit', project: null },
        { date: '2025-09-02', vendor: 'Paddle.net (n8n Cloud)', desc: 'Automation Subscription EUR 66', amount: 119.04, method: 'Card xx9563', project: null },
        { date: '2025-09-03', vendor: 'SmartSheet Inc', desc: 'Project Software USD 12', amount: 18.51, method: 'Card xx9563', project: null },
        { date: '2025-09-04', vendor: 'MM Infrastructure Supplies', desc: 'Construction materials', amount: 114.13, method: 'Card xx9563', project: 'Brunswick East' },
        { date: '2025-09-05', vendor: 'Centrecom Superstore Clayton', desc: 'Electronics / Hardware', amount: 52.42, method: 'Card xx9563', project: null },
        { date: '2025-09-06', vendor: 'Ngoc Loan Ma', desc: 'Haircut (service payment)', amount: 50.00, method: 'Transfer', project: null },
        { date: '2025-09-07', vendor: 'Programa Subscription', desc: 'Software License', amount: 53.90, method: 'Direct Debit', project: null },
        { date: '2025-09-08', vendor: 'Michael Salau', desc: 'Invoice 2425084 – Trade payment', amount: 880.00, method: 'Transfer', project: null },
        { date: '2025-10-01', vendor: 'Optus Billing', desc: 'Internet Plan', amount: 339.81, method: 'Card xx9563', project: null },
        { date: '2025-10-02', vendor: 'Permit Application (Malvern LPD)', desc: 'Council BPay 20461017848680', amount: 238.20, method: 'BPAY', project: 'Malvern' },
        { date: '2025-10-03', vendor: 'Michael Salau', desc: 'Invoice 2425090 – Trade payment', amount: 1130.00, method: 'Transfer', project: null },
        { date: '2025-10-04', vendor: 'Xero', desc: 'Subscription INV-47090333', amount: 123.50, method: 'Card xx9563', project: null },
        { date: '2025-10-05', vendor: 'Roofing Sheetmetal Centre', desc: 'Quotation 487877 (materials)', amount: 90.24, method: 'Transfer', project: null },
        { date: '2025-10-06', vendor: 'Lovable (Dev DE US)', desc: 'Software plan USD 94', amount: 145.35, method: 'Card xx9563', project: null },
        { date: '2025-10-07', vendor: 'Optus Billing', desc: 'Internet Plan Renewal', amount: 93.00, method: 'Card xx9563', project: null },
      ];

      // Prepare expense records for insertion
      const expenseRecords = expensesData.map(expense => ({
        company_id: companyMember.company_id,
        transaction_date: expense.date,
        vendor_supplier: expense.vendor,
        description: expense.desc,
        amount: expense.amount,
        payment_method: expense.method,
        status: expense.method.includes('Card') ? 'Paid' : 'Paid',
        account_code: mapToAccountCode(expense.vendor, expense.desc),
        created_by: user.id,
      }));

      const { error } = await supabase
        .from('expense_transactions')
        .insert(expenseRecords);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Successfully imported ${expensesData.length} expense transactions`,
      });

      // Refresh the page after a short delay to show new data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error('Error importing expenses:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to import expenses",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-background to-muted/20">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Expenses</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage all expense transactions
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkExpenseImport}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Import Expenses (Jul-Oct)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onTabChange?.('expense-settings')}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>

        {/* Monthly Trend Chart */}
        <ExpenseTrendChart />

        {/* Expense Table */}
        <ExpenseTable />
      </div>
    </div>
  );
};
