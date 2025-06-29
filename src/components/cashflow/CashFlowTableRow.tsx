
import { CashFlowItem } from "./types";

interface CashFlowTableRowProps {
  item: CashFlowItem;
  onCellClick: (itemName: string, month: string, value: any) => void;
  formatCellValue: (value: number | string) => string;
}

const monthHeaders = ["May 25", "Jun 25", "Jul 25", "Aug 25", "Sep 25", "Oct 25"];

export const CashFlowTableRow = ({ item, onCellClick, formatCellValue }: CashFlowTableRowProps) => {
  const rowClass = "border-b hover:bg-gray-50/50";
  const cellClass = "text-right py-2 text-gray-700 cursor-pointer hover:bg-blue-50 hover:text-blue-600 px-2 min-w-[100px]";
  const nameClass = "py-2 font-medium text-gray-900 px-2";

  return (
    <tr className={rowClass}>
      <td className={nameClass}>{item.name}</td>
      <td 
        className={cellClass}
        onClick={() => onCellClick(item.name, monthHeaders[0], item.may)}
      >
        {formatCellValue(item.may)}
      </td>
      <td 
        className={cellClass}
        onClick={() => onCellClick(item.name, monthHeaders[1], item.jun)}
      >
        {formatCellValue(item.jun)}
      </td>
      <td 
        className={cellClass}
        onClick={() => onCellClick(item.name, monthHeaders[2], item.jul)}
      >
        {formatCellValue(item.jul)}
      </td>
      <td 
        className={cellClass}
        onClick={() => onCellClick(item.name, monthHeaders[3], item.aug)}
      >
        {formatCellValue(item.aug)}
      </td>
      <td 
        className={cellClass}
        onClick={() => onCellClick(item.name, monthHeaders[4], item.sep)}
      >
        {formatCellValue(item.sep)}
      </td>
      <td 
        className={cellClass}
        onClick={() => onCellClick(item.name, monthHeaders[5], item.oct)}
      >
        {formatCellValue(item.oct)}
      </td>
    </tr>
  );
};
