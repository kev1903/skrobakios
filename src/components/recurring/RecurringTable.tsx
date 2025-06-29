
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const RecurringTable = () => {
  const recurringItems = [
    {
      id: 1,
      name: "Office Rent",
      type: "Expense",
      amount: -2500,
      frequency: "Monthly",
      nextDate: "2024-07-01",
      status: "Active",
      category: "Facilities"
    },
    {
      id: 2,
      name: "Project Retainer - ABC Corp",
      type: "Income",
      amount: 15000,
      frequency: "Monthly",
      nextDate: "2024-07-05",
      status: "Active",
      category: "Contracts"
    },
    {
      id: 3,
      name: "Software Subscriptions",
      type: "Expense",
      amount: -850,
      frequency: "Monthly",
      nextDate: "2024-07-15",
      status: "Active",
      category: "Technology"
    },
    {
      id: 4,
      name: "Insurance Premium",
      type: "Expense",
      amount: -1200,
      frequency: "Quarterly",
      nextDate: "2024-09-01",
      status: "Active",
      category: "Insurance"
    },
    {
      id: 5,
      name: "Maintenance Contract",
      type: "Income",
      amount: 5000,
      frequency: "Quarterly",
      nextDate: "2024-07-30",
      status: "Pending",
      category: "Services"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recurring Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Next Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recurringItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  <Badge variant={item.type === "Income" ? "default" : "secondary"}>
                    {item.type}
                  </Badge>
                </TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.frequency}</TableCell>
                <TableCell>{item.nextDate}</TableCell>
                <TableCell className={`text-right font-medium ${item.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${Math.abs(item.amount).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge variant={item.status === "Active" ? "default" : "outline"}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
