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
  onToggleExpand
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
          className={`border-white/10 hover:bg-white/5 h-8 cursor-pointer transition-colors ${
            isSelected ? 'bg-blue-500/20 border-blue-500/30' : ''
          } ${snapshot.isDragging ? 'bg-white/20 shadow-lg transform rotate-2 z-50' : ''}`}
          onClick={handleClick}
        >
          <TableCell className="h-8 py-1 w-8">
            <div 
              {...provided.dragHandleProps}
              className="flex items-center justify-center h-full cursor-grab active:cursor-grabbing"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-4 h-4 text-white" />
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
            />
          </TableCell>
          <TableCell className="text-slate-300 capitalize h-8 py-1 text-sm">
            <EditableCell
              obj={obj}
              field="object_type"
              value={obj.object_type}
              isEditing={isFieldEditing('object_type')}
              editingData={editingData}
              onFieldClick={onFieldClick}
              onEditingDataChange={onEditingDataChange}
              onKeyDown={onKeyDown}
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
          <TableCell className="h-8 py-1 text-sm">
            <EditableCell
              obj={obj}
              field="status"
              value={obj.status}
              isEditing={isFieldEditing('status')}
              editingData={editingData}
              onFieldClick={onFieldClick}
              onEditingDataChange={onEditingDataChange}
              onKeyDown={onKeyDown}
              type="select"
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
          <TableCell className="text-slate-300 h-8 py-1 text-sm">
            <EditableCell
              obj={obj}
              field="cost"
              value={obj.cost}
              isEditing={isFieldEditing('cost')}
              editingData={editingData}
              onFieldClick={onFieldClick}
              onEditingDataChange={onEditingDataChange}
              onKeyDown={onKeyDown}
              type="number"
            />
          </TableCell>
          <TableCell className="text-slate-300 h-8 py-1 text-sm">
            <EditableCell
              obj={obj}
              field="progress"
              value={obj.progress}
              isEditing={isFieldEditing('progress')}
              editingData={editingData}
              onFieldClick={onFieldClick}
              onEditingDataChange={onEditingDataChange}
              onKeyDown={onKeyDown}
              type="number"
            />
          </TableCell>
          <TableCell className="h-8 py-1">
            <ActionButtons
              isEditing={editingField?.id === obj.id}
              onSave={onSave}
              onCancel={onCancel}
            />
          </TableCell>
        </TableRow>
      )}
    </Draggable>
  );
};