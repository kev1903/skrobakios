
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload } from "lucide-react";

interface BillsHeaderProps {
  onNavigate?: (page: string) => void;
  onUploadClick?: () => void;
}

export const BillsHeader = ({ onNavigate, onUploadClick }: BillsHeaderProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onNavigate?.("finance")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Finance</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Bills</h1>
            <p className="text-muted-foreground">Manage and track all your bills and payables</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={onUploadClick}
            className="flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Bill</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
