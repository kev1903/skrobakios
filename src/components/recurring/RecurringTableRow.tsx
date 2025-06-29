
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RecurringItem } from "@/data/recurringData";
import { getPriorityColor } from "@/utils/recurringUtils";

interface RecurringTableRowProps {
  item: RecurringItem;
  onEdit: (item: RecurringItem) => void;
}

export const RecurringTableRow = ({ item, onEdit }: RecurringTableRowProps) => {
  return (
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
        <Badge className={getPriorityColor(item.priority)}>
          {item.priority}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={item.status === "Active" ? "default" : "outline"}>
          {item.status}
        </Badge>
      </TableCell>
      <TableCell>
        <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
          Edit
        </Button>
      </TableCell>
    </TableRow>
  );
};
