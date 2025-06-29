
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { CashFlowItem } from "./types";

interface CashFlowTableProps {
  title: string;
  data: CashFlowItem[];
  isExpanded: boolean;
  onToggle: () => void;
  onCellClick: (itemName: string, month: string, value: any) => void;
  hasOpeningBalance?: boolean;
}

const monthHeaders = ["May 25", "Jun 25", "Jul 25", "Aug 25", "Sep 25", "Oct 25"];

export const CashFlowTable = ({ 
  title, 
  data, 
  isExpanded, 
  onToggle, 
  onCellClick,
  hasOpeningBalance = false
}: CashFlowTableProps) => {
  const formatCellValue = (value: number | string) => {
    if (typeof value === 'number') {
      return value === 0 ? '0' : value.toLocaleString();
    }
    return value;
  };

  const renderRow = (item: CashFlowItem, index: number) => {
    const isOpeningBalance = hasOpeningBalance && index === 0;
    const rowClass = isOpeningBalance 
      ? "border-b-2 border-gray-300 bg-gray-50 font-semibold" 
      : "border-b hover:bg-gray-50/50";
    
    const cellClass = isOpeningBalance
      ? "text-right py-3 text-gray-900 px-2 min-w-[100px] font-bold"
      : "text-right py-2 text-gray-700 cursor-pointer hover:bg-blue-50 hover:text-blue-600 px-2 min-w-[100px]";

    const nameClass = isOpeningBalance
      ? "py-3 font-bold text-gray-900 px-2"
      : "py-2 font-medium text-gray-900 px-2";

    return (
      <tr key={index} className={rowClass}>
        <td className={nameClass}>{item.name}</td>
        <td 
          className={cellClass}
          onClick={() => !isOpeningBalance && onCellClick(item.name, monthHeaders[0], item.may)}
        >
          {formatCellValue(item.may)}
        </td>
        <td 
          className={cellClass}
          onClick={() => !isOpeningBalance && onCellClick(item.name, monthHeaders[1], item.jun)}
        >
          {formatCellValue(item.jun)}
        </td>
        <td 
          className={cellClass}
          onClick={() => !isOpeningBalance && onCellClick(item.name, monthHeaders[2], item.jul)}
        >
          {formatCellValue(item.jul)}
        </td>
        <td 
          className={cellClass}
          onClick={() => !isOpeningBalance && onCellClick(item.name, monthHeaders[3], item.aug)}
        >
          {formatCellValue(item.aug)}
        </td>
        <td 
          className={cellClass}
          onClick={() => !isOpeningBalance && onCellClick(item.name, monthHeaders[4], item.sep)}
        >
          {formatCellValue(item.sep)}
        </td>
        <td 
          className={cellClass}
          onClick={() => !isOpeningBalance && onCellClick(item.name, monthHeaders[5], item.oct)}
        >
          {formatCellValue(item.oct)}
        </td>
      </tr>
    );
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
          <Button variant="ghost" size="sm">
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
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium text-gray-700 px-2"></th>
                  {monthHeaders.map((month, index) => (
                    <th key={index} className="text-right py-2 font-medium text-gray-700 px-2 min-w-[100px]">{month}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => renderRow(item, index))}
              </tbody>
            </table>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
