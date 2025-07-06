import { GripVertical } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Draggable } from "react-beautiful-dnd";
import { DigitalObject } from "./types";
import { EditableCell } from "./EditableCell";
import { NameCellWithExpand } from "./NameCellWithExpand";
import { ActionButtons } from "./ActionButtons";

interface DigitalObjectRowProps {
  obj: DigitalObject;
  index: number;
  editingField: {id: string, field: keyof DigitalObject} | null;
  editingData: Partial<DigitalObject>;
  selectedIds: string[];
  onFieldClick: (obj: DigitalObject, field: keyof DigitalObject) => void;
  onRowSelect: (id: string, event: React.MouseEvent) => void;
  onSave: () => void;
  onCancel: () => void;
  onEditingDataChange: (data: Partial<DigitalObject>) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onToggleExpand: (id: string) => void;
  onDelete: (id: string) => void;
  hasChildren: boolean;
}

export const DigitalObjectRow = ({
  obj,
  index,
  editingField,
  editingData,
  selectedIds,
  onFieldClick,
  onRowSelect,
  onSave,
  onCancel,
  onEditingDataChange,
  onKeyDown,
  onToggleExpand,
  onDelete,
  hasChildren
}: DigitalObjectRowProps) => {
  const isSelected = selectedIds.includes(obj.id);

  const handleClick = (event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      onRowSelect(obj.id, event);
    } else {
      // Normal click should select the row
      onRowSelect(obj.id, event);
    }
  };

  const isFieldEditing = (field: keyof DigitalObject) => {
    return editingField?.id === obj.id && editingField?.field === field;
  };

  return (
    <Draggable key={obj.id} draggableId={obj.id} index={index}>
      {(provided, snapshot) => (
        <TableRow 
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`border-white/10 hover:bg-white/5 h-8 cursor-pointer transition-all duration-200 ${
            isSelected ? 'bg-blue-500/20 border-blue-500/30' : ''
          } ${snapshot.isDragging ? 'bg-white/30 shadow-2xl transform scale-105 z-50 border-blue-400/50' : ''}`}
          onClick={handleClick}
        >
          <TableCell className="h-8 py-1 w-8">
            <div 
              {...provided.dragHandleProps}
              className="flex items-center justify-center h-full cursor-grab active:cursor-grabbing hover:bg-white/10 rounded transition-colors p-1"
              onClick={(e) => e.stopPropagation()}
              title="Drag to reorder or nest items"
            >
              <GripVertical className="w-4 h-4 text-white hover:text-blue-300 transition-colors" />
            </div>
          </TableCell>
          <TableCell className="text-white font-medium h-8 py-1 text-sm" style={{ paddingLeft: `${obj.level * 20 + 16}px` }}>
            <NameCellWithExpand
              obj={obj}
              isEditing={isFieldEditing('name')}
              editingData={editingData}
              onFieldClick={onFieldClick}
              onEditingDataChange={onEditingDataChange}
              onKeyDown={onKeyDown}
              onToggleExpand={onToggleExpand}
              hasChildren={hasChildren}
            />
          </TableCell>
          <TableCell className="text-slate-300 h-8 py-1 text-sm">
            <EditableCell
              obj={obj}
              field="description"
              value={obj.description}
              isEditing={isFieldEditing('description')}
              editingData={editingData}
              onFieldClick={onFieldClick}
              onEditingDataChange={onEditingDataChange}
              onKeyDown={onKeyDown}
            />
          </TableCell>
          <TableCell className="text-slate-300 h-8 py-1 text-sm">
            <EditableCell
              obj={obj}
              field="stage"
              value={obj.stage}
              isEditing={isFieldEditing('stage')}
              editingData={editingData}
              onFieldClick={onFieldClick}
              onEditingDataChange={onEditingDataChange}
              onKeyDown={onKeyDown}
            />
          </TableCell>
          <TableCell className="h-8 py-1">
            <ActionButtons
              isEditing={editingField?.id === obj.id}
              onSave={onSave}
              onCancel={onCancel}
              onDelete={() => onDelete(obj.id)}
            />
          </TableCell>
        </TableRow>
      )}
    </Draggable>
  );
};