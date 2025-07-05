import { Card, CardContent } from "@/components/ui/card";
import {
  Table as TableComponent,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { useRef, useEffect } from "react";
import { DigitalObject } from "./types";
import { DigitalObjectRow } from "./DigitalObjectRow";

interface DigitalObjectsTableProps {
  digitalObjects: DigitalObject[];
  loading: boolean;
  editingId: string | null;
  editingData: Partial<DigitalObject>;
  selectedIds: string[];
  onRowClick: (obj: DigitalObject) => void;
  onRowSelect: (id: string, event: React.MouseEvent) => void;
  onSave: () => void;
  onCancel: () => void;
  onEditingDataChange: (data: Partial<DigitalObject>) => void;
  onDragEnd: (result: any) => void;
}

export const DigitalObjectsTable = ({
  digitalObjects,
  loading,
  editingId,
  editingData,
  selectedIds,
  onRowClick,
  onRowSelect,
  onSave,
  onCancel,
  onEditingDataChange,
  onDragEnd
}: DigitalObjectsTableProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  // Handle click outside to save
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (editingId) {
          onSave();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingId, onSave]);

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm" ref={containerRef}>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-white">Loading digital objects...</div>
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <TableComponent>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/5 h-10">
                  <TableHead className="text-white font-semibold h-10 w-8"></TableHead>
                  <TableHead className="text-white font-semibold h-10">Name</TableHead>
                  <TableHead className="text-white font-semibold h-10">Type</TableHead>
                  <TableHead className="text-white font-semibold h-10">Description</TableHead>
                  <TableHead className="text-white font-semibold h-10">Status</TableHead>
                  <TableHead className="text-white font-semibold h-10">Cost</TableHead>
                  <TableHead className="text-white font-semibold h-10">Progress</TableHead>
                  <TableHead className="text-white font-semibold h-10 w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <Droppable droppableId="digital-objects">
                {(provided) => (
                  <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                    {digitalObjects.map((obj, index) => (
                      <DigitalObjectRow
                        key={obj.id}
                        obj={obj}
                        index={index}
                        editingId={editingId}
                        editingData={editingData}
                        selectedIds={selectedIds}
                        onRowClick={onRowClick}
                        onRowSelect={onRowSelect}
                        onSave={onSave}
                        onCancel={onCancel}
                        onEditingDataChange={onEditingDataChange}
                        onKeyDown={handleKeyDown}
                      />
                    ))}
                    {digitalObjects.length === 0 && (
                      <TableRow className="border-white/10 h-10">
                        <TableCell colSpan={8} className="text-center text-slate-400 py-8">
                          No digital objects found for this project
                        </TableCell>
                      </TableRow>
                    )}
                    {provided.placeholder}
                  </TableBody>
                )}
              </Droppable>
            </TableComponent>
          </DragDropContext>
        )}
      </CardContent>
    </Card>
  );
};