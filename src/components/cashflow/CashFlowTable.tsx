
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { CashFlowItem } from "./types";
import { CashFlowTableHeader } from "./CashFlowTableHeader";
import { CashFlowTableOpeningBalanceRow } from "./CashFlowTableOpeningBalanceRow";
import { CashFlowTableRow } from "./CashFlowTableRow";
import { CashFlowTableTotalsRow } from "./CashFlowTableTotalsRow";

interface CashFlowTableProps {
  title: string;
  data: CashFlowItem[];
  isExpanded: boolean;
  onToggle: () => void;
  onCellClick: (itemName: string, month: string, value: any) => void;
  onAddAccount: () => void;
  openingBalance?: CashFlowItem;
  totals?: {
    may: number;
    jun: number;
    jul: number;
    aug: number;
    sep: number;
    oct: number;
  };
}

export const CashFlowTable = ({ 
  title, 
  data, 
  isExpanded, 
  onToggle, 
  onCellClick,
  onAddAccount,
  openingBalance,
  totals
}: CashFlowTableProps) => {
  const formatCellValue = (value: number | string) => {
    if (typeof value === 'number') {
      return value === 0 ? '$0.00' : `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) {
        return parsed === 0 ? '$0.00' : `$${parsed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
    }
    return value;
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="p-0 h-auto"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
            <CardTitle className="text-lg text-gray-900">{title}</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onAddAccount}
            className="hover:bg-blue-50 hover:text-blue-600"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-fixed">
              <colgroup>
                <col className="w-1/4" />
                <col className="w-1/8" />
                <col className="w-1/8" />
                <col className="w-1/8" />
                <col className="w-1/8" />
                <col className="w-1/8" />
                <col className="w-1/8" />
              </colgroup>
              <CashFlowTableHeader />
              <tbody>
                {openingBalance && (
                  <CashFlowTableOpeningBalanceRow 
                    openingBalance={openingBalance}
                    formatCellValue={formatCellValue}
                  />
                )}
                {data.map((item, index) => (
                  <CashFlowTableRow
                    key={index}
                    item={item}
                    onCellClick={onCellClick}
                    formatCellValue={formatCellValue}
                  />
                ))}
                {totals && (
                  <CashFlowTableTotalsRow 
                    totals={totals}
                    formatCellValue={formatCellValue}
                  />
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
