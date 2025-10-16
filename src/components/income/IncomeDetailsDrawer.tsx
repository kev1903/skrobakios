import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileText, Download, Edit, Link as LinkIcon } from "lucide-react";

interface IncomeRecord {
  id: string;
  date: string;
  client: string;
  project: string;
  description: string;
  amount: number;
  method: string;
  status: "received" | "pending";
  invoiceNumber?: string;
  notes?: string;
  attachments?: string[];
}

interface IncomeDetailsDrawerProps {
  record: IncomeRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const IncomeDetailsDrawer = ({ record, open, onOpenChange }: IncomeDetailsDrawerProps) => {
  if (!record) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] sm:w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Income Details</SheetTitle>
          <SheetDescription>
            View and manage income transaction details
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <Badge
              variant={record.status === "received" ? "default" : "secondary"}
              className={
                record.status === "received"
                  ? "bg-green-500/10 text-green-600"
                  : "bg-orange-500/10 text-orange-600"
              }
            >
              {record.status === "received" ? "✓ Received" : "◆ Pending"}
            </Badge>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>

          <Separator />

          {/* Main Details */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Date</label>
              <p className="text-base mt-1">
                {new Date(record.date).toLocaleDateString("en-AU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Client / Source</label>
              <p className="text-base font-medium mt-1">{record.client}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Project</label>
              <p className="text-base mt-1">{record.project}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <p className="text-base mt-1">{record.description}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Amount</label>
              <p className="text-2xl font-bold mt-1">
                ${record.amount.toLocaleString("en-AU", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
              <p className="text-base mt-1">{record.method}</p>
            </div>

            {record.invoiceNumber && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Invoice Number</label>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-base">{record.invoiceNumber}</p>
                  <Button variant="ghost" size="sm">
                    <LinkIcon className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Notes */}
          {record.notes && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Notes</label>
              <p className="text-sm mt-2 p-3 bg-muted/50 rounded-md">{record.notes}</p>
            </div>
          )}

          {/* Attachments */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-3 block">
              Attachments
            </label>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Payment_Proof.pdf
                <Download className="h-4 w-4 ml-auto" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              View Invoice
            </Button>
            <Button variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
