import { Button } from "@/components/ui/button";
import { Upload, Download, Mail, RefreshCw, MoreVertical } from "lucide-react";
import { useNotifyPayer } from "@/hooks/useNotifyPayer";
import { useScreenSize } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface BillsHeaderProps {
  onUploadClick?: () => void;
}

export const BillsHeader = ({ onUploadClick }: BillsHeaderProps) => {
  const { notifyPayers, isLoading } = useNotifyPayer();
  const screenSize = useScreenSize();
  const isMobile = screenSize === 'mobile' || screenSize === 'mobile-small';

  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Bills</h1>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <SheetHeader>
                <SheetTitle>Actions</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-2 mt-6">
                <Button 
                  onClick={onUploadClick}
                  className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Bill
                </Button>
                <Button 
                  variant="outline"
                  onClick={notifyPayers}
                  disabled={isLoading}
                  className="w-full justify-start"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {isLoading ? "Sending..." : "Notify Payer"}
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync from Xero
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    );
  }

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

          <Button 
            variant="outline"
            onClick={notifyPayers}
            disabled={isLoading}
          >
            <Mail className="w-4 h-4 mr-2" />
            {isLoading ? "Sending..." : "Notify Payer"}
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
