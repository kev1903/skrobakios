
import { Card, CardContent } from "@/components/ui/card";
import { CashFlowItem } from "./types";

interface OpeningBalanceTableProps {
  openingBalance: CashFlowItem;
}

const monthHeaders = ["May 25", "Jun 25", "Jul 25", "Aug 25", "Sep 25", "Oct 25"];

export const OpeningBalanceTable = ({ openingBalance }: OpeningBalanceTableProps) => {
  const formatCellValue = (value: number | string) => {
    if (typeof value === 'number') {
      return value === 0 ? '$0' : `$${value.toLocaleString()}`;
    }
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) {
        return parsed === 0 ? '$0' : `$${parsed.toLocaleString()}`;
      }
    }
    return value;
  };

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
              <tr className="border-b-2 border-gray-300 bg-gray-50">
                <td className="py-3 font-bold text-gray-900 px-2">{openingBalance.name}</td>
                <td className="text-right py-3 text-gray-900 px-2 min-w-[100px] font-bold">
                  {formatCellValue(openingBalance.may)}
                </td>
                <td className="text-right py-3 text-gray-900 px-2 min-w-[100px] font-bold">
                  {formatCellValue(openingBalance.jun)}
                </td>
                <td className="text-right py-3 text-gray-900 px-2 min-w-[100px] font-bold">
                  {formatCellValue(openingBalance.jul)}
                </td>
                <td className="text-right py-3 text-gray-900 px-2 min-w-[100px] font-bold">
                  {formatCellValue(openingBalance.aug)}
                </td>
                <td className="text-right py-3 text-gray-900 px-2 min-w-[100px] font-bold">
                  {formatCellValue(openingBalance.sep)}
                </td>
                <td className="text-right py-3 text-gray-900 px-2 min-w-[100px] font-bold">
                  {formatCellValue(openingBalance.oct)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
