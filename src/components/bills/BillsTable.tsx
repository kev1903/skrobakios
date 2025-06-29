
import { useState } from "react";
import {
  Table,
  TableBody,
} from "@/components/ui/table";
import { BillsTableControls } from "./BillsTableControls";
import { BillsTableHeader } from "./BillsTableHeader";
import { BillsTableRow } from "./BillsTableRow";
import { BillsTableFooter } from "./BillsTableFooter";

const billData = [
  {
    id: "1",
    dueDate: "15 Jan '25",
    vendor: "ABC Construction Supply",
    billNumber: "BILL-001",
    category: "Materials",
    amount: "2,450.00",
    overdue: true,
    hasWarning: true,
    includedInCashFlow: true,
  },
  {
    id: "2",
    dueDate: "20 Jan '25",
    vendor: "Metro Electric Services",
    billNumber: "BILL-002",
    category: "Services",
    amount: "1,250.00",
    overdue: false,
    hasWarning: false,
    includedInCashFlow: true,
  },
  {
    id: "3",
    dueDate: "25 Jan '25",
    vendor: "City Permits Office",
    billNumber: "BILL-003",
    category: "Permits",
    amount: "850.00",
    overdue: false,
    hasWarning: false,
    includedInCashFlow: true,
  },
  {
    id: "4",
    dueDate: "30 Jan '25",
    vendor: "Pacific Plumbing Co.",
    billNumber: "BILL-004",
    category: "Services",
    amount: "3,200.00",
    overdue: false,
    hasWarning: false,
    includedInCashFlow: true,
  },
];

export const BillsTable = () => {
  const [selectedBills, setSelectedBills] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBills(billData.map(bill => bill.id));
    } else {
      setSelectedBills([]);
    }
  };

  const handleSelectBill = (billId: string, checked: boolean) => {
    if (checked) {
      setSelectedBills([...selectedBills, billId]);
    } else {
      setSelectedBills(selectedBills.filter(id => id !== billId));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <BillsTableControls 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <Table>
        <BillsTableHeader
          selectedCount={selectedBills.length}
          totalCount={billData.length}
          onSelectAll={handleSelectAll}
        />
        <TableBody>
          {billData.map((bill) => (
            <BillsTableRow
              key={bill.id}
              bill={bill}
              isSelected={selectedBills.includes(bill.id)}
              onSelect={handleSelectBill}
            />
          ))}
        </TableBody>
      </Table>

      <BillsTableFooter />
    </div>
  );
};
