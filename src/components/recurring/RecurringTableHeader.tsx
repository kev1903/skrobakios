
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const RecurringTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Type</TableHead>
        <TableHead>Category</TableHead>
        <TableHead>Frequency</TableHead>
        <TableHead>Next Date</TableHead>
        <TableHead className="text-right">Amount</TableHead>
        <TableHead>Priority</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="w-12"></TableHead>
      </TableRow>
    </TableHeader>
  );
};
