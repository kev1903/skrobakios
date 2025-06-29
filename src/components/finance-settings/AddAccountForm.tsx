
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Account {
  name: string;
  type: string;
  accountNumber: string;
  balance: string;
  status: string;
}

interface AddAccountFormProps {
  newAccount: Account;
  setNewAccount: React.Dispatch<React.SetStateAction<Account>>;
  onAddAccount: () => void;
  onCancel: () => void;
}

export const AddAccountForm = ({ newAccount, setNewAccount, onAddAccount, onCancel }: AddAccountFormProps) => {
  return (
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
        <Button onClick={onAddAccount}>Add Account</Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};
