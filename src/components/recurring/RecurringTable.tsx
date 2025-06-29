
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody } from "@/components/ui/table";
import { recurringItems } from "@/data/recurringData";
import { RecurringTableHeader } from "./RecurringTableHeader";
import { RecurringTableRow } from "./RecurringTableRow";

export const RecurringTable = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recurring Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <RecurringTableHeader />
          <TableBody>
            {recurringItems.map((item) => (
              <RecurringTableRow key={item.id} item={item} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
