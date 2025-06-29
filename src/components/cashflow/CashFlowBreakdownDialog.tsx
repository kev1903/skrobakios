
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { BreakdownData } from "./types";

interface CashFlowBreakdownDialogProps {
  isOpen: boolean;
  onClose: () => void;
  breakdownData: BreakdownData | null;
}

export const CashFlowBreakdownDialog = ({ 
  isOpen, 
  onClose, 
  breakdownData 
}: CashFlowBreakdownDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between bg-gray-900 text-white p-4 -m-6 mb-4">
          <DialogTitle className="text-lg font-medium">
            {breakdownData?.title} {breakdownData?.month}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-gray-800 p-1 h-auto"
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        {breakdownData && (
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button className="px-4 py-2 bg-gray-800 text-white rounded text-sm font-medium">
                Paid ({breakdownData.items.length})
              </button>
              <button className="px-4 py-2 text-gray-600 rounded text-sm">
                Budgets (0)
              </button>
              <div className="ml-auto">
                <button className="px-4 py-2 text-gray-600 text-sm">
                  Notes
                </button>
              </div>
            </div>

            {/* Section Title */}
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Full invoice payments ({breakdownData.items.length})
              </h3>
            </div>

            {/* Items List */}
            <div className="space-y-2">
              {breakdownData.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-blue-600 font-medium min-w-[80px]">
                        {item.date}
                      </span>
                      <span className="text-sm font-medium text-gray-900 flex-1">
                        {item.description}
                      </span>
                      <span className="text-sm text-gray-600 min-w-[80px]">
                        {item.invoiceNumber}
                      </span>
                      <span className="text-sm font-medium text-gray-900 min-w-[80px] text-right">
                        ${item.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  ${breakdownData.total.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Paid this month</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  ${breakdownData.expected.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Expected this month</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  ${breakdownData.overExpected.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Over expected</div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
