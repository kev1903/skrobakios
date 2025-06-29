
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, DollarSign } from "lucide-react";

const bills = [
  {
    id: "BILL-001",
    vendor: "ABC Construction Supply",
    amount: "$2,450.00",
    dueDate: "2024-01-15",
    status: "overdue",
    category: "Materials"
  },
  {
    id: "BILL-002", 
    vendor: "Metro Electric Services",
    amount: "$1,250.00",
    dueDate: "2024-01-20",
    status: "due",
    category: "Services"
  },
  {
    id: "BILL-003",
    vendor: "City Permits Office",
    amount: "$850.00",
    dueDate: "2024-01-25",
    status: "pending",
    category: "Permits"
  },
  {
    id: "BILL-004",
    vendor: "Pacific Plumbing Co.",
    amount: "$3,200.00",
    dueDate: "2024-01-30",
    status: "pending",
    category: "Services"
  },
  {
    id: "BILL-005",
    vendor: "Safety Equipment Ltd",
    amount: "$750.00",
    dueDate: "2024-02-05",
    status: "draft",
    category: "Equipment"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "overdue":
      return "bg-red-100 text-red-800";
    case "due":
      return "bg-yellow-100 text-yellow-800";
    case "pending":
      return "bg-blue-100 text-blue-800";
    case "draft":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const BillsTable = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Bills</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bill ID</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bills.map((bill) => (
              <TableRow key={bill.id}>
                <TableCell className="font-medium">{bill.id}</TableCell>
                <TableCell>{bill.vendor}</TableCell>
                <TableCell className="font-medium">{bill.amount}</TableCell>
                <TableCell>{bill.dueDate}</TableCell>
                <TableCell>{bill.category}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(bill.status)}>
                    {bill.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <DollarSign className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
