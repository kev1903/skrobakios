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
import { ArrowUpDown, Search, Filter, RefreshCw } from "lucide-react";
import { IncomeDetailsDrawer } from "./IncomeDetailsDrawer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface IncomeRecord {
  id: string;
  date: string;
  client: string;
  project: string;
  description: string;
  amount: number;
  method: string;
  status: "received" | "pending";
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

  const fetchIncomeData = async () => {
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

      const { data: incomeData, error } = await supabase
        .from('income_transactions')
        .select('*')
        .eq('company_id', companyMember.company_id)
        .order('transaction_date', { ascending: false });

      if (error) throw error;

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
      const { data, error } = await supabase.functions.invoke('seed-income-data');
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Loaded ${data.count} income records`,
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
    fetchIncomeData();
  }, []);

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
              <Button
                variant="outline"
                size="sm"
                onClick={seedInitialData}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Load Data
              </Button>
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
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Loading income records...
                    </TableCell>
                  </TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No income records found. Click "Load Data" to populate with initial data.
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
      />
    </>
  );
};
