
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Account {
  id: string;
  name: string;
  type: string;
  accountNumber: string;
  balance: string;
  status: string;
}

interface ImportAccountsDialogProps {
  onImportAccounts: (accounts: Omit<Account, 'id'>[]) => void;
}

export const ImportAccountsDialog = ({ onImportAccounts }: ImportAccountsDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const fileType = selectedFile.type;
      const fileName = selectedFile.name.toLowerCase();
      
      if (fileType === 'text/csv' || fileName.endsWith('.csv') || 
          fileType === 'application/vnd.ms-excel' || 
          fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        setFile(selectedFile);
        setErrors([]);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please select a CSV or Excel file (.csv, .xlsx, .xls)",
          variant: "destructive"
        });
      }
    }
  };

  const parseCSV = (text: string): string[][] => {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      result.push(current.trim());
      return result;
    });
  };

  const validateAndProcessAccounts = (data: string[][]): Omit<Account, 'id'>[] => {
    const validationErrors: string[] = [];
    const accounts: Omit<Account, 'id'>[] = [];
    
    // Skip header row if it exists
    const startIndex = data[0]?.some(cell => 
      cell.toLowerCase().includes('name') || 
      cell.toLowerCase().includes('type') || 
      cell.toLowerCase().includes('account')
    ) ? 1 : 0;

    for (let i = startIndex; i < data.length; i++) {
      const row = data[i];
      if (row.length < 3) {
        validationErrors.push(`Row ${i + 1}: Insufficient columns (minimum 3 required)`);
        continue;
      }

      const [name, type, accountNumber, balance = "", status = "Active"] = row;
      
      if (!name?.trim()) {
        validationErrors.push(`Row ${i + 1}: Account name is required`);
        continue;
      }
      
      if (!accountNumber?.trim()) {
        validationErrors.push(`Row ${i + 1}: Account number is required`);
        continue;
      }

      const validTypes = ["Asset", "Liability", "Equity", "Revenue", "Expense"];
      const accountType = type?.trim() || "Asset";
      
      if (!validTypes.includes(accountType)) {
        validationErrors.push(`Row ${i + 1}: Invalid account type "${accountType}". Must be one of: ${validTypes.join(", ")}`);
        continue;
      }

      accounts.push({
        name: name.trim(),
        type: accountType,
        accountNumber: accountNumber.trim(),
        balance: balance?.trim() || "$0.00",
        status: status?.trim() || "Active"
      });
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return [];
    }

    return accounts;
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a file to import",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setErrors([]);

    try {
      const text = await file.text();
      let data: string[][];

      if (file.name.toLowerCase().endsWith('.csv')) {
        data = parseCSV(text);
      } else {
        // For Excel files, we'll treat them as CSV for now
        // In a real application, you'd want to use a library like SheetJS
        toast({
          title: "Excel Import",
          description: "Excel files are processed as CSV. Please save your Excel file as CSV for best results.",
        });
        data = parseCSV(text);
      }

      const accounts = validateAndProcessAccounts(data);
      
      if (accounts.length > 0) {
        onImportAccounts(accounts);
        toast({
          title: "Import Successful",
          description: `Successfully imported ${accounts.length} accounts`,
        });
        setIsOpen(false);
        setFile(null);
      }
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to process the file. Please check the file format.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const template = "Account Name,Account Type,Account Number,Balance,Status\nBusiness Checking,Asset,****1234,$10000.00,Active\nOffice Supplies,Expense,EXP-001,$0.00,Active\nAccounts Payable,Liability,AP-001,$5000.00,Active";
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'accounts_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Import Accounts
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import Transaction Accounts</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>File Format Requirements</Label>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• CSV or Excel file (.csv, .xlsx, .xls)</p>
              <p>• Columns: Name, Type, Account Number, Balance (optional), Status (optional)</p>
              <p>• Account Type must be: Asset, Liability, Equity, Revenue, or Expense</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Download Template</Label>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadTemplate}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Download CSV Template
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-upload">Select File</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
            />
          </div>

          {file && (
            <div className="text-sm text-green-600">
              Selected: {file.name}
            </div>
          )}

          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
                <AlertCircle className="w-4 h-4" />
                Validation Errors
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                {errors.slice(0, 5).map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
                {errors.length > 5 && (
                  <li>• ... and {errors.length - 5} more errors</li>
                )}
              </ul>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleImport} 
              disabled={!file || isProcessing}
              className="flex-1"
            >
              {isProcessing ? "Processing..." : "Import Accounts"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
