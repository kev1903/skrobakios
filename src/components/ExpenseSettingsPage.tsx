import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Edit, Trash2, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ExpenseAccount {
  id: string;
  account_code: string;
  account_name: string;
  account_type: string;
  description: string | null;
  is_active: boolean;
  parent_account_id: string | null;
  sort_order: number;
}

interface ExpenseSettingsPageProps {
  onNavigate?: (page: string) => void;
  onTabChange?: (tab: string) => void;
}

export const ExpenseSettingsPage = ({ onNavigate, onTabChange }: ExpenseSettingsPageProps) => {
  const [accounts, setAccounts] = useState<ExpenseAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<ExpenseAccount | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    account_code: "",
    account_name: "",
    account_type: "Expense",
    description: "",
    is_active: true,
    sort_order: 0,
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
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
        setAccounts([]);
        return;
      }

      const { data, error } = await supabase
        .from('expense_accounts')
        .select('*')
        .eq('company_id', companyMember.company_id)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast({
        title: "Error",
        description: "Failed to load expense accounts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (account?: ExpenseAccount) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        account_code: account.account_code,
        account_name: account.account_name,
        account_type: account.account_type,
        description: account.description || "",
        is_active: account.is_active,
        sort_order: account.sort_order,
      });
    } else {
      setEditingAccount(null);
      setFormData({
        account_code: "",
        account_name: "",
        account_type: "Expense",
        description: "",
        is_active: true,
        sort_order: 0,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingAccount(null);
    setFormData({
      account_code: "",
      account_name: "",
      account_type: "Expense",
      description: "",
      is_active: true,
      sort_order: 0,
    });
  };

  const handleSave = async () => {
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

      if (editingAccount) {
        // Update existing account
        const { error } = await supabase
          .from('expense_accounts')
          .update({
            account_code: formData.account_code,
            account_name: formData.account_name,
            account_type: formData.account_type,
            description: formData.description || null,
            is_active: formData.is_active,
            sort_order: formData.sort_order,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingAccount.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Expense account updated successfully",
        });
      } else {
        // Create new account
        const { error } = await supabase
          .from('expense_accounts')
          .insert({
            company_id: companyMember.company_id,
            account_code: formData.account_code,
            account_name: formData.account_name,
            account_type: formData.account_type,
            description: formData.description || null,
            is_active: formData.is_active,
            sort_order: formData.sort_order,
            created_by: user.id,
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Expense account created successfully",
        });
      }

      handleCloseDialog();
      fetchAccounts();
    } catch (error: any) {
      console.error('Error saving account:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save expense account",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from('expense_accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Expense account deleted successfully",
      });

      fetchAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "Failed to delete expense account",
        variant: "destructive",
      });
    }
  };

  const handleBulkImport = async () => {
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

      // Chart of Accounts data from PDF
      const accountsData = [
        { code: "310", name: "Cost of Goods Sold", type: "Expense", desc: "GST on Expenses" },
        { code: "400", name: "Advertising", type: "Expense", desc: "GST on Expenses" },
        { code: "402", name: "Business Coaching", type: "Expense", desc: "GST Free Expenses" },
        { code: "404", name: "Bank Fees", type: "Expense", desc: "GST Free Expenses" },
        { code: "405", name: "Borrowing Expenses", type: "Expense", desc: "BAS Excluded" },
        { code: "408", name: "Cleaning", type: "Expense", desc: "GST on Expenses" },
        { code: "412", name: "Accounting", type: "Expense", desc: "GST on Expenses" },
        { code: "413", name: "Asset immediately written off", type: "Expense", desc: "BAS Excluded" },
        { code: "416", name: "Depreciation", type: "Expense", desc: "BAS Excluded" },
        { code: "417", name: "Donations and Tithes", type: "Expense", desc: "GST Free Expenses" },
        { code: "418", name: "Bad Debt", type: "Expense", desc: "BAS Excluded" },
        { code: "420", name: "Entertainment", type: "Expense", desc: "GST Free Expenses" },
        { code: "421", name: "Equipment Hire", type: "Expense", desc: "GST on Expenses" },
        { code: "422", name: "Filing Fees", type: "Expense", desc: "GST Free Expenses" },
        { code: "425", name: "Freight & Courier", type: "Expense", desc: "GST on Expenses" },
        { code: "429", name: "General Expenses", type: "Expense", desc: "GST on Expenses" },
        { code: "433", name: "Insurance", type: "Expense", desc: "GST on Expenses" },
        { code: "437", name: "Interest Expense", type: "Expense", desc: "GST Free Expenses" },
        { code: "441", name: "Legal expenses", type: "Expense", desc: "GST on Expenses" },
        { code: "445", name: "Light, Power, Heating", type: "Expense", desc: "GST on Expenses" },
        { code: "449", name: "Motor Vehicle Expenses", type: "Expense", desc: "GST on Expenses" },
        { code: "453", name: "Office Expenses", type: "Expense", desc: "GST on Expenses" },
        { code: "455", name: "Construction Expenses", type: "Expense", desc: "GST on Expenses" },
        { code: "461", name: "Printing & Stationery", type: "Expense", desc: "GST on Expenses" },
        { code: "465", name: "Labour Hire", type: "Expense", desc: "GST on Expenses" },
        { code: "469", name: "Rent", type: "Expense", desc: "GST on Expenses" },
        { code: "470", name: "Online Services Expenses", type: "Expense", desc: "GST on Expenses" },
        { code: "473", name: "Repairs and Maintenance", type: "Expense", desc: "GST on Expenses" },
        { code: "477", name: "Wages and Salaries", type: "Expense", desc: "BAS Excluded" },
        { code: "478", name: "Superannuation", type: "Expense", desc: "BAS Excluded" },
        { code: "480", name: "Staff Amenities", type: "Expense", desc: "GST on Expenses" },
        { code: "485", name: "Subscriptions", type: "Expense", desc: "GST on Expenses" },
        { code: "489", name: "Telephone & Internet", type: "Expense", desc: "GST on Expenses" },
        { code: "493", name: "Travel - National", type: "Expense", desc: "GST on Expenses" },
        { code: "494", name: "Travel - International", type: "Expense", desc: "GST Free Expenses" },
        { code: "497", name: "Bank Revaluations", type: "Expense", desc: "BAS Excluded" },
        { code: "498", name: "Unrealised Currency Gains", type: "Expense", desc: "BAS Excluded" },
        { code: "499", name: "Realised Currency Gains", type: "Expense", desc: "BAS Excluded" },
        { code: "500", name: "Owner Personal Expense", type: "Expense", desc: "GST on Expenses" },
        { code: "501", name: "Conference & Client Networking", type: "Expense", desc: "GST on Expenses" },
        { code: "502", name: "Waste Removal", type: "Expense", desc: "GST on Expenses" },
        { code: "503", name: "Fines", type: "Expense", desc: "BAS Excluded" },
        { code: "504", name: "Consultancy Hire", type: "Expense", desc: "GST on Expenses" },
        { code: "505", name: "Income Tax Expense", type: "Expense", desc: "BAS Excluded" },
        { code: "506", name: "Stripe Fees", type: "Expense", desc: "GST on Expenses" },
        { code: "544", name: "Tools & Equipment", type: "Expense", desc: "GST on Expenses" },
        { code: "545", name: "Education Expense", type: "Expense", desc: "GST on Expenses" },
        { code: "546", name: "Licensing", type: "Expense", desc: "GST on Expenses" },
        { code: "547", name: "Food Expenses", type: "Expense", desc: "GST on Expenses" },
        { code: "556", name: "Workwear", type: "Expense", desc: "GST on Expenses" },
        { code: "557", name: "Hospital & Physiotherapy", type: "Expense", desc: "GST on Expenses" },
        { code: "887", name: "Medical Expense", type: "Expense", desc: "GST on Expenses" },
        { code: "SQ-300000", name: "Square Fees", type: "Expense", desc: "GST on Expenses" },
        { code: "SQ-300001", name: "Square Chargebacks", type: "Expense", desc: "GST on Expenses" },
        { code: "SQ-300002", name: "Stripe Fees 1", type: "Expense", desc: "GST on Expenses" },
        { code: "SQ-300003", name: "Stripe Fees 2", type: "Expense", desc: "GST on Expenses" },
      ];

      // Check for existing accounts to avoid duplicates
      const { data: existingAccounts } = await supabase
        .from('expense_accounts')
        .select('account_code')
        .eq('company_id', companyMember.company_id);

      const existingCodes = new Set(existingAccounts?.map(a => a.account_code) || []);
      
      // Filter out accounts that already exist
      const newAccounts = accountsData.filter(acc => !existingCodes.has(acc.code));

      if (newAccounts.length === 0) {
        toast({
          title: "Info",
          description: "All accounts already exist in the system",
        });
        return;
      }

      // Prepare records for insertion
      const recordsToInsert = newAccounts.map((account, index) => ({
        company_id: companyMember.company_id,
        account_code: account.code,
        account_name: account.name,
        account_type: account.type,
        description: account.desc,
        is_active: true,
        sort_order: index,
        created_by: user.id,
      }));

      const { error } = await supabase
        .from('expense_accounts')
        .insert(recordsToInsert);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Successfully imported ${newAccounts.length} expense accounts`,
      });

      fetchAccounts();
    } catch (error: any) {
      console.error('Error importing accounts:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to import expense accounts",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-background to-muted/20">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTabChange?.('expenses')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Expenses
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Expense Settings</h1>
              <p className="text-muted-foreground mt-1">
                Manage Chart of Accounts for expense tracking
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleBulkImport}>
              <Plus className="h-4 w-4 mr-2" />
              Import Chart of Accounts
            </Button>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </div>
        </div>

        {/* Chart of Accounts Table */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Chart of Accounts</CardTitle>
            <CardDescription>
              Configure expense account codes and categories for better tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading accounts...
              </div>
            ) : accounts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No expense accounts configured yet</p>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Account
                </Button>
              </div>
            ) : (
              <div className="rounded-md border border-border/50">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Code</TableHead>
                      <TableHead>Account Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-mono font-medium">
                          {account.account_code}
                        </TableCell>
                        <TableCell className="font-medium">
                          {account.account_name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{account.account_type}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-xs truncate">
                          {account.description || '—'}
                        </TableCell>
                        <TableCell>
                          {account.is_active ? (
                            <Badge className="bg-green-500/10 text-green-600">
                              <Check className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <X className="h-3 w-3 mr-1" />
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(account)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(account.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAccount ? "Edit Expense Account" : "Add Expense Account"}
            </DialogTitle>
            <DialogDescription>
              {editingAccount
                ? "Update the expense account details"
                : "Create a new expense account for your chart of accounts"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="account_code">Account Code *</Label>
                <Input
                  id="account_code"
                  value={formData.account_code}
                  onChange={(e) =>
                    setFormData({ ...formData, account_code: e.target.value })
                  }
                  placeholder="e.g., 5000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account_type">Account Type *</Label>
                <Select
                  value={formData.account_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, account_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asset">Asset</SelectItem>
                    <SelectItem value="Liability">Liability</SelectItem>
                    <SelectItem value="Equity">Equity</SelectItem>
                    <SelectItem value="Revenue">Revenue</SelectItem>
                    <SelectItem value="Expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_name">Account Name *</Label>
              <Input
                id="account_name"
                value={formData.account_name}
                onChange={(e) =>
                  setFormData({ ...formData, account_name: e.target.value })
                }
                placeholder="e.g., Materials & Supplies"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Optional description for this account"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) =>
                    setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="is_active">Status</Label>
                <Select
                  value={formData.is_active ? "active" : "inactive"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, is_active: value === "active" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingAccount ? "Update" : "Create"} Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
