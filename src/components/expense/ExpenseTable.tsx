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
import { ExpenseDetailsDrawer } from "./ExpenseDetailsDrawer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ExpenseRecord {
  id: string;
  date: string;
  vendor: string;
  project: string;
  description: string;
  amount: number;
  method: string;
  status: "paid" | "pending";
  account_code?: string;
  account_name?: string;
  invoiceNumber?: string;
  notes?: string;
  attachments?: string[];
}

interface ExpenseTableProps {
  refreshTrigger?: number;
}

export const ExpenseTable = ({ refreshTrigger }: ExpenseTableProps) => {
  const [data, setData] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState<"date" | "amount" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<ExpenseRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { toast } = useToast();

  const fetchExpenseData = async () => {
    try {
      setLoading(true);
      
      // Get user's active company
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: companyMember } = await supabase
        .from('company_members')
        .select('company_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle();

      if (!companyMember) {
        setData([]);
        return;
      }

      const { data: expenseData, error } = await supabase
        .from('expense_transactions')
        .select('*')
        .eq('company_id', companyMember.company_id)
        .order('transaction_date', { ascending: false });

      if (error) throw error;

      // Fetch account names for display
      const accountCodes = [...new Set(expenseData?.map(r => r.account_code).filter(Boolean))];
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
      const transformedData: ExpenseRecord[] = (expenseData || []).map(record => ({
        id: record.id,
        date: record.transaction_date,
        vendor: record.vendor_supplier,
        project: record.project_name || '—',
        description: record.description,
        amount: Number(record.amount),
        method: record.payment_method,
        status: record.status as "paid" | "pending",
        account_code: record.account_code || undefined,
        account_name: record.account_code ? accountsMap[record.account_code] : undefined,
        invoiceNumber: record.invoice_number || undefined,
        notes: record.notes || undefined,
        attachments: (Array.isArray(record.attachments) ? record.attachments : []) as string[]
      }));

      setData(transformedData);
    } catch (error) {
      console.error('Error fetching expense data:', error);
      toast({
        title: "Error",
        description: "Failed to load expense data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenseData();
  }, [refreshTrigger]);

  const handleSort = (column: "date" | "amount") => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const handleRowClick = (record: ExpenseRecord) => {
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
      record.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const totalExpense = filteredData.reduce((sum, record) => sum + record.amount, 0);

  return (
    <>
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Expense Table</CardTitle>
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
                  <SelectItem value="paid">Paid</SelectItem>
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
                  <TableHead>Vendor / Supplier</TableHead>
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
                      Loading expense records...
                    </TableCell>
                  </TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No expense records found.
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
                      <TableCell>{record.vendor}</TableCell>
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
                          variant={record.status === "paid" ? "default" : "secondary"}
                          className={
                            record.status === "paid"
                              ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                              : "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20"
                          }
                        >
                          {record.status === "paid" ? "✓ Paid" : "◆ Pending"}
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
                ${totalExpense.toLocaleString("en-AU", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <ExpenseDetailsDrawer
        record={selectedRecord}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onUpdate={fetchExpenseData}
      />
    </>
  );
};
