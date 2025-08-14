
import { Badge } from "@/components/ui/badge";

export const BillsTableFooter = () => {
  return (
    <div className="p-4 border-t bg-muted/30 flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-muted-foreground">Status indicators:</span>
        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
          OVERDUE
        </Badge>
        <Badge variant="outline" className="bg-yellow-100 text-yellow-600 border-yellow-300">
          DUE SOON
        </Badge>
      </div>
    </div>
  );
};
