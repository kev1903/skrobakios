import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DigitalObject } from "./types";
import { getStatusColor, getStatusText } from "./utils";

interface EditableCellProps {
  obj: DigitalObject;
  field: keyof DigitalObject;
  value: any;
  isEditing: boolean;
  editingData: Partial<DigitalObject>;
  onFieldClick: (obj: DigitalObject, field: keyof DigitalObject) => void;
  onEditingDataChange: (data: Partial<DigitalObject>) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  type?: 'text' | 'number' | 'select';
}

export const EditableCell = ({
  obj,
  field,
  value,
  isEditing,
  editingData,
  onFieldClick,
  onEditingDataChange,
  onKeyDown,
  type = 'text'
}: EditableCellProps) => {
  if (isEditing) {
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

  const displayValue = field === 'status' ? (
    <Badge variant="outline" className={getStatusColor(obj.status)}>
      {getStatusText(obj.status)}
    </Badge>
  ) : field === 'cost' ? (
    obj.cost ? `$${obj.cost.toLocaleString()}` : '-'
  ) : field === 'progress' ? (
    `${obj.progress}%`
  ) : (
    value || '-'
  );
  
  return (
    <div 
      className="cursor-pointer hover:bg-white/10 px-2 py-1 rounded"
      onClick={(e) => {
        e.stopPropagation();
        onFieldClick(obj, field);
      }}
    >
      {displayValue}
    </div>
  );
};