
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody } from "@/components/ui/table";
import { recurringItems as initialItems } from "@/data/recurringData";
import { RecurringTableHeader } from "./RecurringTableHeader";
import { RecurringTableRow } from "./RecurringTableRow";
import { EditRecurringDialog } from "./EditRecurringDialog";
import { RecurringItem } from "@/data/recurringData";

export const RecurringTable = () => {
  const [items, setItems] = useState(initialItems);
  const [editingItem, setEditingItem] = useState<RecurringItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEdit = (item: RecurringItem) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  const handleSave = (updatedItem: RecurringItem) => {
    setItems(prevItems =>
      prevItems.map(item => item.id === updatedItem.id ? updatedItem : item)
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Recurring Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <RecurringTableHeader />
            <TableBody>
              {items.map((item) => (
                <RecurringTableRow 
                  key={item.id} 
                  item={item} 
                  onEdit={handleEdit}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EditRecurringDialog
        item={editingItem}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSave}
      />
    </>
  );
};
