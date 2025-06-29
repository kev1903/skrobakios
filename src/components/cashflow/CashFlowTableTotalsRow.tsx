
interface Totals {
  may: number;
  jun: number;
  jul: number;
  aug: number;
  sep: number;
  oct: number;
}

interface CashFlowTableTotalsRowProps {
  totals: Totals;
  formatCellValue: (value: number | string) => string;
}

export const CashFlowTableTotalsRow = ({ totals, formatCellValue }: CashFlowTableTotalsRowProps) => {
  return (
    <tr className="border-t-2 border-gray-400 bg-gray-100 font-bold">
      <td className="py-3 font-bold text-gray-900 px-2">Total</td>
      <td className="text-right py-3 text-gray-900 px-2 min-w-[100px] font-bold">
        {formatCellValue(totals.may)}
      </td>
      <td className="text-right py-3 text-gray-900 px-2 min-w-[100px] font-bold">
        {formatCellValue(totals.jun)}
      </td>
      <td className="text-right py-3 text-gray-900 px-2 min-w-[100px] font-bold">
        {formatCellValue(totals.jul)}
      </td>
      <td className="text-right py-3 text-gray-900 px-2 min-w-[100px] font-bold">
        {formatCellValue(totals.aug)}
      </td>
      <td className="text-right py-3 text-gray-900 px-2 min-w-[100px] font-bold">
        {formatCellValue(totals.sep)}
      </td>
      <td className="text-right py-3 text-gray-900 px-2 min-w-[100px] font-bold">
        {formatCellValue(totals.oct)}
      </td>
    </tr>
  );
};
