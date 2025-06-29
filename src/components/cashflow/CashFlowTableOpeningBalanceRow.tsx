
import { CashFlowItem } from "./types";

interface CashFlowTableOpeningBalanceRowProps {
  openingBalance: CashFlowItem;
  formatCellValue: (value: number | string) => string;
}

export const CashFlowTableOpeningBalanceRow = ({ 
  openingBalance, 
  formatCellValue 
}: CashFlowTableOpeningBalanceRowProps) => {
  return (
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
  );
};
