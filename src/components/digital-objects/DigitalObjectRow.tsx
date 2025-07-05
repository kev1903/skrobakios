import { Edit, Check, X, GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Draggable } from "react-beautiful-dnd";
import { DigitalObject } from "./types";
import { getStatusColor, getStatusText } from "./utils";

interface DigitalObjectRowProps {
  obj: DigitalObject;
  index: number;
  editingId: string | null;
  editingData: Partial<DigitalObject>;
  selectedIds: string[];
  onRowClick: (obj: DigitalObject) => void;
  onRowSelect: (id: string, event: React.MouseEvent) => void;
  onSave: () => void;
  onCancel: () => void;
  onEditingDataChange: (data: Partial<DigitalObject>) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export const DigitalObjectRow = ({
  obj,
  index,
  editingId,
  editingData,
  selectedIds,
  onRowClick,
  onRowSelect,
  onSave,
  onCancel,
  onEditingDataChange,
  onKeyDown
}: DigitalObjectRowProps) => {
  const isSelected = selectedIds.includes(obj.id);

  const handleClick = (event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      onRowSelect(obj.id, event);
    } else {
      onRowClick(obj);
    }
  };
  const renderEditableCell = (field: keyof DigitalObject, value: any, type: 'text' | 'number' | 'select' = 'text') => {
    if (editingId === obj.id && editingData) {
      if (type === 'select' && field === 'status') {
        return (
          <Select
            value={editingData[field] as string || ''}
            onValueChange={(val) => onEditingDataChange({ ...editingData, [field]: val })}
          >
            <SelectTrigger className="h-7 bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        );
      }
      
      return (
        <Input
          type={type}
          value={editingData[field] as string || ''}
          onChange={(e) => onEditingDataChange({ 
            ...editingData, 
            [field]: type === 'number' ? Number(e.target.value) : e.target.value 
          })}
          onKeyDown={onKeyDown}
          className="h-7 bg-white/10 border-white/20 text-white"
          autoFocus={field === 'name'}
        />
      );
    }
    return value;
  };

  return (
    <Draggable key={obj.id} draggableId={obj.id} index={index}>
      {(provided, snapshot) => (
        <TableRow 
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`border-white/10 hover:bg-white/5 h-10 cursor-pointer transition-colors ${
            editingId === obj.id ? 'bg-white/10' : ''
          } ${isSelected ? 'bg-blue-500/20 border-blue-500/30' : ''} ${
            snapshot.isDragging ? 'bg-white/20 shadow-lg' : ''
          }`}
          onClick={handleClick}
        >
          <TableCell className="h-10 py-2 w-8">
            <div 
              {...provided.dragHandleProps}
              className="flex items-center justify-center h-full cursor-grab active:cursor-grabbing"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-4 h-4 text-slate-400 hover:text-white" />
            </div>
          </TableCell>
          <TableCell className="text-white font-medium h-10 py-2" style={{ paddingLeft: `${obj.level * 20 + 16}px` }}>
            {renderEditableCell('name', obj.name)}
          </TableCell>
          <TableCell className="text-slate-300 capitalize h-10 py-2">
            {renderEditableCell('object_type', obj.object_type)}
          </TableCell>
          <TableCell className="text-slate-300 h-10 py-2">
            {renderEditableCell('description', obj.description || '-')}
          </TableCell>
          <TableCell className="h-10 py-2">
            {editingId === obj.id ? (
              renderEditableCell('status', obj.status, 'select')
            ) : (
              <Badge variant="outline" className={getStatusColor(obj.status)}>
                {getStatusText(obj.status)}
              </Badge>
            )}
          </TableCell>
          <TableCell className="text-slate-300 h-10 py-2">
            {editingId === obj.id ? (
              renderEditableCell('cost', obj.cost || 0, 'number')
            ) : (
              obj.cost ? `$${obj.cost.toLocaleString()}` : '-'
            )}
          </TableCell>
          <TableCell className="text-slate-300 h-10 py-2">
            {editingId === obj.id ? (
              renderEditableCell('progress', obj.progress, 'number')
            ) : (
              `${obj.progress}%`
            )}
          </TableCell>
          <TableCell className="h-10 py-2">
            {editingId === obj.id ? (
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSave();
                  }}
                  className="p-1 text-green-400 hover:text-green-300"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancel();
                  }}
                  className="p-1 text-red-400 hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Edit className="w-4 h-4 text-slate-400" />
            )}
          </TableCell>
        </TableRow>
      )}
    </Draggable>
  );
};