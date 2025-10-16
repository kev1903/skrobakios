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
}

export const ExpenseSettingsPage = ({ onNavigate }: ExpenseSettingsPageProps) => {
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

  return (
    <div className="w-full bg-gradient-to-br from-background to-muted/20">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate?.('finance')}
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
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
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
