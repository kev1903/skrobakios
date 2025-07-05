import { Edit, Check, X, GripVertical, ChevronDown, ChevronRight } from "lucide-react";
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

  // Check if this row has children (is a parent row)
  const hasChildren = obj.level === 0 || (obj.parent_id === null);

  const renderNameWithExpandButton = () => {
    const nameContent = isFieldEditing('name') ? (
      <Input
        type="text"
        value={editingData.name as string || ''}
        onChange={(e) => onEditingDataChange({ 
          ...editingData, 
          name: e.target.value 
        })}
        onKeyDown={onKeyDown}
        className="h-6 bg-white/10 border-white/20 text-white text-xs"
        autoFocus
      />
    ) : (
      <div 
        className="cursor-pointer hover:bg-white/10 px-2 py-1 rounded flex items-center gap-2"
        onClick={(e) => {
          e.stopPropagation();
          onFieldClick(obj, 'name');
        }}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(obj.id);
            }}
            className="text-slate-400 hover:text-white"
          >
            {obj.expanded === false ? (
              <ChevronRight className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        )}
        <span>{obj.name}</span>
      </div>
    );

    return nameContent;
  };

  const renderEditableCell = (field: keyof DigitalObject, value: any, type: 'text' | 'number' | 'select' = 'text') => {
    if (isFieldEditing(field)) {
      if (type === 'select' && field === 'status') {
        return (
          <Select
            value={editingData[field] as string || ''}
            onValueChange={(val) => onEditingDataChange({ ...editingData, [field]: val })}
          >
            <SelectTrigger className="h-6 bg-white/10 border-white/20 text-white text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-white/20">
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
          className="h-6 bg-white/10 border-white/20 text-white text-xs"
          autoFocus
        />
      );
    }
    
    return (
      <div 
        className="cursor-pointer hover:bg-white/10 px-2 py-1 rounded"
        onClick={(e) => {
          e.stopPropagation();
          onFieldClick(obj, field);
        }}
      >
        {value}
      </div>
    );
  };

  return (
    <Draggable key={obj.id} draggableId={obj.id} index={index}>
      {(provided, snapshot) => (
        <TableRow 
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`border-white/10 hover:bg-white/5 h-8 cursor-pointer transition-colors ${
            isSelected ? 'bg-blue-500/20 border-blue-500/30' : ''
          } ${snapshot.isDragging ? 'bg-white/20 shadow-lg' : ''}`}
          onClick={handleClick}
        >
          <TableCell className="h-8 py-1 w-8">
            <div 
              {...provided.dragHandleProps}
              className="flex items-center justify-center h-full cursor-grab active:cursor-grabbing"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-4 h-4 text-slate-400 hover:text-white" />
            </div>
          </TableCell>
          <TableCell className="text-white font-medium h-8 py-1 text-sm" style={{ paddingLeft: `${obj.level * 20 + 16}px` }}>
            {renderNameWithExpandButton()}
          </TableCell>
          <TableCell className="text-slate-300 capitalize h-8 py-1 text-sm">
            {renderEditableCell('object_type', obj.object_type)}
          </TableCell>
          <TableCell className="text-slate-300 h-8 py-1 text-sm">
            {renderEditableCell('description', obj.description || '-')}
          </TableCell>
          <TableCell className="h-8 py-1 text-sm">
            {isFieldEditing('status') ? (
              renderEditableCell('status', obj.status, 'select')
            ) : (
              <div 
                className="cursor-pointer hover:bg-white/10 px-2 py-1 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  onFieldClick(obj, 'status');
                }}
              >
                <Badge variant="outline" className={getStatusColor(obj.status)}>
                  {getStatusText(obj.status)}
                </Badge>
              </div>
            )}
          </TableCell>
          <TableCell className="text-slate-300 h-8 py-1 text-sm">
            {isFieldEditing('cost') ? (
              renderEditableCell('cost', obj.cost || 0, 'number')
            ) : (
              <div 
                className="cursor-pointer hover:bg-white/10 px-2 py-1 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  onFieldClick(obj, 'cost');
                }}
              >
                {obj.cost ? `$${obj.cost.toLocaleString()}` : '-'}
              </div>
            )}
          </TableCell>
          <TableCell className="text-slate-300 h-8 py-1 text-sm">
            {isFieldEditing('progress') ? (
              renderEditableCell('progress', obj.progress, 'number')
            ) : (
              <div 
                className="cursor-pointer hover:bg-white/10 px-2 py-1 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  onFieldClick(obj, 'progress');
                }}
              >
                {`${obj.progress}%`}
              </div>
            )}
          </TableCell>
          <TableCell className="h-8 py-1">
            {editingField?.id === obj.id ? (
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSave();
                  }}
                  className="p-1 text-green-400 hover:text-green-300"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancel();
                  }}
                  className="p-1 text-red-400 hover:text-red-300"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <Edit className="w-3 h-3 text-slate-400" />
            )}
          </TableCell>
        </TableRow>
      )}
    </Draggable>
  );
};