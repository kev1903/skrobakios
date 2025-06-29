
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FinanceSettingsPageProps {
  onNavigate?: (page: string) => void;
}

interface Account {
  id: string;
  name: string;
  type: string;
  accountNumber: string;
  balance: string;
  status: string;
}

export const FinanceSettingsPage = ({ onNavigate }: FinanceSettingsPageProps) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    baseCurrency: "AUD",
    fiscalYearStart: "July",
    taxRate: "10",
    defaultPaymentTerms: "30",
    enableNotifications: true,
    enableAutoSync: false,
    retentionPeriod: "7",
    backupFrequency: "daily"
  });

  const [accounts, setAccounts] = useState<Account[]>([
    {
      id: "1",
      name: "Business Checking",
      type: "Asset",
      accountNumber: "****1234",
      balance: "$125,450.00",
      status: "Active"
    },
    {
      id: "2",
      name: "Petty Cash",
      type: "Asset",
      accountNumber: "CASH-001",
      balance: "$500.00",
      status: "Active"
    },
    {
      id: "3",
      name: "Accounts Payable",
      type: "Liability",
      accountNumber: "AP-001",
      balance: "$15,230.00",
      status: "Active"
    },
    {
      id: "4",
      name: "Equipment Fund",
      type: "Asset",
      accountNumber: "****5678",
      balance: "$75,000.00",
      status: "Active"
    }
  ]);

  const [newAccount, setNewAccount] = useState({
    name: "",
    type: "Asset",
    accountNumber: "",
    balance: "",
    status: "Active"
  });

  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);

  const handleSave = () => {
    // Here you would typically save to a backend or local storage
    toast({
      title: "Settings Saved",
      description: "Finance settings have been updated successfully.",
    });
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleAddAccount = () => {
    if (!newAccount.name || !newAccount.accountNumber) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const account: Account = {
      id: Date.now().toString(),
      ...newAccount
    };

    setAccounts(prev => [...prev, account]);
    setNewAccount({
      name: "",
      type: "Asset",
      accountNumber: "",
      balance: "",
      status: "Active"
    });
    setIsAddingAccount(false);

    toast({
      title: "Account Added",
      description: "New account has been added successfully.",
    });
  };

  const handleDeleteAccount = (accountId: string) => {
    setAccounts(prev => prev.filter(account => account.id !== accountId));
    toast({
      title: "Account Deleted",
      description: "Account has been removed successfully.",
    });
  };

  const handleEditAccount = (accountId: string) => {
    setEditingAccount(accountId);
  };

  const handleSaveEdit = (accountId: string, updatedAccount: Partial<Account>) => {
    setAccounts(prev => prev.map(account => 
      account.id === accountId ? { ...account, ...updatedAccount } : account
    ));
    setEditingAccount(null);
    toast({
      title: "Account Updated",
      description: "Account details have been updated successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => onNavigate?.("finance")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Finance Settings</h1>
              <p className="text-gray-600">Configure your finance dashboard preferences</p>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-8">
          {/* General Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">General Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="baseCurrency">Base Currency</Label>
                <Select
                  value={settings.baseCurrency}
                  onValueChange={(value) => handleInputChange('baseCurrency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fiscalYearStart">Fiscal Year Start</Label>
                <Select
                  value={settings.fiscalYearStart}
                  onValueChange={(value) => handleInputChange('fiscalYearStart', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="January">January</SelectItem>
                    <SelectItem value="July">July</SelectItem>
                    <SelectItem value="April">April</SelectItem>
                    <SelectItem value="October">October</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  value={settings.taxRate}
                  onChange={(e) => handleInputChange('taxRate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultPaymentTerms">Default Payment Terms (days)</Label>
                <Input
                  id="defaultPaymentTerms"
                  type="number"
                  value={settings.defaultPaymentTerms}
                  onChange={(e) => handleInputChange('defaultPaymentTerms', e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Accounts Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Company Accounts</h3>
              <Button 
                onClick={() => setIsAddingAccount(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Account
              </Button>
            </div>

            {isAddingAccount && (
              <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
                <h4 className="font-medium">Add New Account</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Account Name *</Label>
                    <Input
                      value={newAccount.name}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter account name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Type</Label>
                    <Select
                      value={newAccount.type}
                      onValueChange={(value) => setNewAccount(prev => ({ ...prev, type: value }))}
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
                  <div className="space-y-2">
                    <Label>Account Number *</Label>
                    <Input
                      value={newAccount.accountNumber}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, accountNumber: e.target.value }))}
                      placeholder="Enter account number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Opening Balance</Label>
                    <Input
                      value={newAccount.balance}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, balance: e.target.value }))}
                      placeholder="$0.00"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddAccount}>Add Account</Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsAddingAccount(false);
                      setNewAccount({
                        name: "",
                        type: "Asset",
                        accountNumber: "",
                        balance: "",
                        status: "Active"
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Account Number</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.name}</TableCell>
                      <TableCell>{account.type}</TableCell>
                      <TableCell>{account.accountNumber}</TableCell>
                      <TableCell>{account.balance}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          account.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {account.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditAccount(account.id)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteAccount(account.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <Separator />

          {/* Notifications & Automation */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Notifications & Automation</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Notifications</Label>
                <p className="text-sm text-gray-500">Receive alerts for overdue invoices, cash flow warnings, etc.</p>
              </div>
              <Switch
                checked={settings.enableNotifications}
                onCheckedChange={(checked) => handleInputChange('enableNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Auto-Sync</Label>
                <p className="text-sm text-gray-500">Automatically sync data with accounting software</p>
              </div>
              <Switch
                checked={settings.enableAutoSync}
                onCheckedChange={(checked) => handleInputChange('enableAutoSync', checked)}
              />
            </div>
          </div>

          <Separator />

          {/* Data Management */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Data Management</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="retentionPeriod">Data Retention (years)</Label>
                <Select
                  value={settings.retentionPeriod}
                  onValueChange={(value) => handleInputChange('retentionPeriod', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Year</SelectItem>
                    <SelectItem value="3">3 Years</SelectItem>
                    <SelectItem value="5">5 Years</SelectItem>
                    <SelectItem value="7">7 Years</SelectItem>
                    <SelectItem value="10">10 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backupFrequency">Backup Frequency</Label>
                <Select
                  value={settings.backupFrequency}
                  onValueChange={(value) => handleInputChange('backupFrequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={handleSave}>
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
