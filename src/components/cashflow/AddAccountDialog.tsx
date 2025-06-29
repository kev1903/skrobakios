
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CashFlowItem } from "./types";

interface AddAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAccount: (account: CashFlowItem) => void;
  sectionTitle: string;
}

export const AddAccountDialog = ({ isOpen, onClose, onAddAccount, sectionTitle }: AddAccountDialogProps) => {
  const [accountName, setAccountName] = useState("");
  const [mayValue, setMayValue] = useState("");
  const [junValue, setJunValue] = useState("");
  const [julValue, setJulValue] = useState("");
  const [augValue, setAugValue] = useState("");
  const [sepValue, setSepValue] = useState("");
  const [octValue, setOctValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accountName.trim()) return;

    const parseValue = (value: string): number => {
      const parsed = parseFloat(value) || 0;
      return parsed;
    };

    const newAccount: CashFlowItem = {
      name: accountName.trim(),
      may: parseValue(mayValue),
      jun: parseValue(junValue),
      jul: parseValue(julValue),
      aug: parseValue(augValue),
      sep: parseValue(sepValue),
      oct: parseValue(octValue),
    };

    onAddAccount(newAccount);
    
    // Reset form
    setAccountName("");
    setMayValue("");
    setJunValue("");
    setJulValue("");
    setAugValue("");
    setSepValue("");
    setOctValue("");
    
    onClose();
  };

  const handleCancel = () => {
    setAccountName("");
    setMayValue("");
    setJunValue("");
    setJulValue("");
    setAugValue("");
    setSepValue("");
    setOctValue("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Add New Account to {sectionTitle}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="accountName">Account Name</Label>
            <Input
              id="accountName"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Enter account name"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <Label htmlFor="may">May 25</Label>
              <Input
                id="may"
                type="number"
                step="0.01"
                value={mayValue}
                onChange={(e) => setMayValue(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="jun">Jun 25</Label>
              <Input
                id="jun"
                type="number"
                step="0.01"
                value={junValue}
                onChange={(e) => setJunValue(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="jul">Jul 25</Label>
              <Input
                id="jul"
                type="number"
                step="0.01"
                value={julValue}
                onChange={(e) => setJulValue(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="aug">Aug 25</Label>
              <Input
                id="aug"
                type="number"
                step="0.01"
                value={augValue}
                onChange={(e) => setAugValue(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="sep">Sep 25</Label>
              <Input
                id="sep"
                type="number"
                step="0.01"
                value={sepValue}
                onChange={(e) => setSepValue(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="oct">Oct 25</Label>
              <Input
                id="oct"
                type="number"
                step="0.01"
                value={octValue}
                onChange={(e) => setOctValue(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">
              Add Account
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
