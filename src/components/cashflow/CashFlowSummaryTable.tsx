import { Card, CardContent } from "@/components/ui/card";
import { CashFlowItem } from "./types";

interface CashFlowSummaryTableProps {
  netMovement: CashFlowItem;
  endingBalance: CashFlowItem;
}

const monthHeaders = ["May 25", "Jun 25", "Jul 25", "Aug 25", "Sep 25", "Oct 25"];

export const CashFlowSummaryTable = ({ netMovement, endingBalance }: CashFlowSummaryTableProps) => {
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

  const renderSummaryRow = (item: CashFlowItem, isLast: boolean = false) => (
    <tr className={`${isLast ? 'border-b-2 border-gray-300' : 'border-b'} bg-gray-50 font-semibold`}>
      <td className="py-3 font-bold text-gray-900 px-2">{item.name}</td>
      <td className="text-right py-3 text-gray-900 px-2 min-w-[100px]">{formatCellValue(item.may)}</td>
      <td className="text-right py-3 text-gray-900 px-2 min-w-[100px]">{formatCellValue(item.jun)}</td>
      <td className="text-right py-3 text-gray-900 px-2 min-w-[100px]">{formatCellValue(item.jul)}</td>
      <td className="text-right py-3 text-gray-900 px-2 min-w-[100px]">{formatCellValue(item.aug)}</td>
      <td className="text-right py-3 text-gray-900 px-2 min-w-[100px]">{formatCellValue(item.sep)}</td>
      <td className="text-right py-3 text-gray-900 px-2 min-w-[100px]">{formatCellValue(item.oct)}</td>
    </tr>
  );

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardContent className="pt-6">
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
              {renderSummaryRow(netMovement)}
              {renderSummaryRow(endingBalance, true)}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
