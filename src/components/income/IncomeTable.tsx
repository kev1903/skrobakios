import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown, Search, Filter } from "lucide-react";
import { IncomeDetailsDrawer } from "./IncomeDetailsDrawer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCompany } from "@/contexts/CompanyContext";

interface IncomeRecord {
  id: string;
  date: string;
  client: string;
  project: string;
  description: string;
  amount: number;
  method: string;
  status: "received" | "pending";
  account_code?: string;
  account_name?: string;
  invoiceNumber?: string;
  notes?: string;
  attachments?: string[];
}

export const IncomeTable = () => {
  const [data, setData] = useState<IncomeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState<"date" | "amount" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<IncomeRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { toast } = useToast();
  const { currentCompany } = useCompany();

  const fetchIncomeData = async (shouldSeedIfEmpty = false) => {
    try {
      setLoading(true);
      
      // Use current company from context
      if (!currentCompany?.id) {
        setData([]);
        return;
      }

      const { data: incomeData, error } = await supabase
        .from('income_transactions')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('transaction_date', { ascending: false });

      if (error) throw error;

      // Auto-seed if empty, or check for missing transactions
      if (shouldSeedIfEmpty) {
        if (!incomeData || incomeData.length === 0) {
          await seedInitialData();
          return;
        } else if (incomeData.length < 18) {
          // Check if we need to add new transactions
          await seedInitialData();
        }
      }

      // Fetch account names for display
      const accountCodes = [...new Set(incomeData?.map(r => r.account_code).filter(Boolean))];
      let accountsMap: Record<string, string> = {};
      
      if (accountCodes.length > 0) {
        const { data: accountsData } = await supabase
          .from('expense_accounts')
          .select('account_code, account_name')
          .in('account_code', accountCodes);
        
        accountsMap = (accountsData || []).reduce((acc, a) => {
          acc[a.account_code] = a.account_name;
          return acc;
        }, {} as Record<string, string>);
      }

      // Transform to match UI format
      const transformedData: IncomeRecord[] = (incomeData || []).map(record => ({
        id: record.id,
        date: record.transaction_date,
        client: record.client_source,
        project: record.project_name || '—',
        description: record.description,
        amount: Number(record.amount),
        method: record.payment_method,
        status: record.status as "received" | "pending",
        account_code: record.account_code || undefined,
        account_name: record.account_code ? accountsMap[record.account_code] : undefined,
        invoiceNumber: record.invoice_number || undefined,
        notes: record.notes || undefined,
        attachments: (Array.isArray(record.attachments) ? record.attachments : []) as string[]
      }));

      setData(transformedData);
    } catch (error) {
      console.error('Error fetching income data:', error);
      toast({
        title: "Error",
        description: "Failed to load income data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const seedInitialData = async () => {
    try {
      // Get user and use current company from context
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !currentCompany?.id) {
        toast({
          title: "Error",
          description: "Not authenticated or no company selected",
          variant: "destructive",
        });
        return;
      }

      // Income data to seed
      const incomeData = [
        { date: '2025-07-09', client: 'Mr Benjamin & Mrs Jac', project: 'Site Surveillance', description: 'Site surveillance payment', amount: 1100.00, method: 'Fast Transfer', category: 'Consultancy' },
        { date: '2025-07-10', client: 'City of Kingston', project: null, description: 'Direct credit', amount: 2000.00, method: 'Direct Credit', category: 'Construction' },
        { date: '2025-07-14', client: 'Stripe', project: 'Horace Street', description: 'Stripe-HbAHF1qLMS', amount: 6201.91, method: 'Direct Credit', category: 'Construction' },
        { date: '2025-07-16', client: 'Mr Peter Wayne-Good', project: null, description: 'Credit to account (Peter Tiyago)', amount: 1650.00, method: 'Fast Transfer', category: 'Consultancy' },
        { date: '2025-07-16', client: 'TPM Consulting', project: '21 Sugarloaf Rd', description: 'INV-0309 Final Invoice', amount: 2609.20, method: 'Fast Transfer', category: 'Consultancy' },
        { date: '2025-08-05', client: 'Vishal Bhasin', project: '43 Iris Rd', description: 'Bank transfer', amount: 1630.00, method: 'NetBank', category: 'Construction' },
        { date: '2025-08-06', client: 'Stripe', project: null, description: 'Stripe-1Cord6Q8llT', amount: 4398.43, method: 'Direct Credit', category: 'Construction' },
        { date: '2025-08-12', client: 'Mr Benjamin & Mrs Jac', project: 'Base Thanet', description: 'Payment for base works', amount: 7000.00, method: 'Fast Transfer', category: 'Construction' },
        { date: '2025-08-12', client: 'WBC OLP MECON', project: 'Insurance Claim', description: 'MECON Claim 18118', amount: 10000.00, method: 'Direct Credit', category: 'Construction' },
        { date: '2025-08-01', client: 'Leongatha Christian R', project: null, description: 'Gravel refund', amount: 221.00, method: 'Fast Transfer', category: 'Construction' },
        { date: '2025-09-05', client: 'Stripe', project: 'High Society Café', description: 'Stripe-PYKfOuJqbrr', amount: 6201.91, method: 'Direct Credit', category: 'Construction' },
        { date: '2025-09-07', client: 'Ekta Bhasin', project: '43 Iris Rd', description: 'Deposit Invoice SK_25011', amount: 5452.92, method: 'Fast Transfer', category: 'Construction' },
        { date: '2025-09-16', client: 'Mr Benjamin & Mrs Jac', project: 'Thanet St', description: 'Concrete cutting Thanet', amount: 400.00, method: 'Fast Transfer', category: 'Construction' },
        { date: '2025-09-18', client: 'Stripe', project: null, description: 'Stripe-Pl4TlFpayWc', amount: 2199.06, method: 'Direct Credit', category: 'Construction' },
        { date: '2025-09-20', client: 'Ekta Bhasin', project: '43 Iris Rd', description: 'Inv 0328', amount: 20000.00, method: 'Fast Transfer', category: 'Construction' },
        { date: '2025-10-02', client: 'Mr Benjamin & Mrs Jac', project: 'Timber purchase', description: 'Payment for timber', amount: 4512.30, method: 'Fast Transfer', category: 'Construction' },
        { date: '2025-10-03', client: 'Mrs Nomsa Sithandekil', project: 'Render Inv0319', description: 'Render invoice payment', amount: 1560.00, method: 'Fast Transfer', category: 'Construction' },
        { date: '2025-10-14', client: 'Vishal Bhasin', project: '43 Iris Rd', description: 'Project transfer', amount: 20000.00, method: 'NetBank Transfer', category: 'Construction' },
      ];

      // Get existing transactions to avoid duplicates
      const { data: existingData } = await supabase
        .from('income_transactions')
        .select('transaction_date, client_source, description, amount')
        .eq('company_id', currentCompany.id);

      // Filter out transactions that already exist
      const existingKeys = new Set(
        (existingData || []).map(r => `${r.transaction_date}-${r.client_source}-${r.description}-${r.amount}`)
      );

      const newRecords = incomeData.filter(record => 
        !existingKeys.has(`${record.date}-${record.client}-${record.description}-${record.amount}`)
      );

      if (newRecords.length === 0) {
        console.log('All transactions already exist');
        return;
      }

      const recordsToInsert = newRecords.map(record => ({
        company_id: currentCompany.id,
        transaction_date: record.date,
        client_source: record.client,
        project_name: record.project || '—',
        description: record.description,
        amount: record.amount,
        payment_method: record.method,
        account_code: null,
        status: 'received',
        created_by: user.id
      }));

      const { data, error } = await supabase
        .from('income_transactions')
        .insert(recordsToInsert)
        .select();

      if (error) throw error;

      toast({
        title: "Success",
        description: `Added ${data.length} new income records`,
      });
      
      await fetchIncomeData();
    } catch (error) {
      console.error('Error seeding data:', error);
      toast({
        title: "Error",
        description: "Failed to load initial data",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchIncomeData(true);
  }, [currentCompany?.id]);

  const handleSort = (column: "date" | "amount") => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const handleRowClick = (record: IncomeRecord) => {
    setSelectedRecord(record);
    setDrawerOpen(true);
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;
    
    if (sortColumn === "date") {
      const comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      return sortDirection === "asc" ? comparison : -comparison;
    }
    
    if (sortColumn === "amount") {
      const comparison = a.amount - b.amount;
      return sortDirection === "asc" ? comparison : -comparison;
    }
    
    return 0;
  });

  const filteredData = sortedData.filter((record) => {
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    const matchesSearch = 
      record.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const totalIncome = filteredData.reduce((sum, record) => sum + record.amount, 0);

  return (
    <>
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Income Table</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => handleSort("date")}
                    >
                      Date
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Client / Source</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => handleSort("amount")}
                    >
                      Amount (AUD)
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Loading income records...
                    </TableCell>
                  </TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No income records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((record) => (
                    <TableRow
                      key={record.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleRowClick(record)}
                    >
                      <TableCell className="font-medium">
                        {new Date(record.date).toLocaleDateString("en-AU", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>{record.client}</TableCell>
                      <TableCell>{record.project}</TableCell>
                      <TableCell>
                        {record.account_code ? (
                          <div className="flex flex-col">
                            <span className="font-mono text-xs text-muted-foreground">{record.account_code}</span>
                            <span className="text-sm">{record.account_name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {record.description}
                      </TableCell>
                      <TableCell className="font-semibold">
                        ${record.amount.toLocaleString("en-AU", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell>{record.method}</TableCell>
                      <TableCell>
                        <Badge
                          variant={record.status === "received" ? "default" : "secondary"}
                          className={
                            record.status === "received"
                              ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                              : "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20"
                          }
                        >
                          {record.status === "received" ? "✓ Received" : "◆ Pending"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Summary Footer */}
          <div className="mt-4 flex items-center justify-between px-2">
            <p className="text-sm text-muted-foreground">
              Showing {filteredData.length} of {data.length} records
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Total:</span>
              <span className="text-lg font-bold text-foreground">
                ${totalIncome.toLocaleString("en-AU", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <IncomeDetailsDrawer
        record={selectedRecord}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onUpdate={fetchIncomeData}
      />
    </>
  );
};
