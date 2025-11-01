
import { Button } from "@/components/ui/button";
import { Upload, Download, Mail, RefreshCw } from "lucide-react";

interface BillsHeaderProps {
  onUploadClick?: () => void;
}

export const BillsHeader = ({ onUploadClick }: BillsHeaderProps) => {
  return (
    <div className="space-y-6">
      {/* Title and Actions */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Bills</h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-3">
          <Button 
            onClick={onUploadClick}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Bill
          </Button>

          <Button variant="outline">
            <Mail className="w-4 h-4 mr-2" />
            Send Reminders
          </Button>

          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>

          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync from Xero
          </Button>
        </div>
      </div>
    </div>
  );
};
