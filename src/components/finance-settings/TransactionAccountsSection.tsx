
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddAccountForm } from "./AddAccountForm";
import { ImportAccountsDialog } from "./ImportAccountsDialog";

interface Account {
  id: string;
  name: string;
  type: string;
  accountNumber: string;
  balance: string;
  status: string;
}

interface TransactionAccountsSectionProps {
  accounts: Account[];
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
}

export const TransactionAccountsSection = ({ accounts, setAccounts }: TransactionAccountsSectionProps) => {
  const { toast } = useToast();
  const [newAccount, setNewAccount] = useState({
    name: "",
    type: "Asset",
    accountNumber: "",
    balance: "",
    status: "Active"
  });
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);

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

  const handleImportAccounts = (importedAccounts: Omit<Account, 'id'>[]) => {
    const accountsWithIds = importedAccounts.map(account => ({
      ...account,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    }));

    setAccounts(prev => [...prev, ...accountsWithIds]);
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

  const handleCancelAdd = () => {
    setIsAddingAccount(false);
    setNewAccount({
      name: "",
      type: "Asset",
      accountNumber: "",
      balance: "",
      status: "Active"
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Transaction Accounts</h3>
        <div className="flex gap-2">
          <ImportAccountsDialog onImportAccounts={handleImportAccounts} />
          <Button 
            onClick={() => setIsAddingAccount(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Account
          </Button>
        </div>
      </div>

      {isAddingAccount && (
        <AddAccountForm
          newAccount={newAccount}
          setNewAccount={setNewAccount}
          onAddAccount={handleAddAccount}
          onCancel={handleCancelAdd}
        />
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
  );
};
