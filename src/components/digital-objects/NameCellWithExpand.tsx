import { ChevronDown, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DigitalObject } from "./types";

interface NameCellWithExpandProps {
  obj: DigitalObject;
  isEditing: boolean;
  editingData: Partial<DigitalObject>;
  onFieldClick: (obj: DigitalObject, field: keyof DigitalObject) => void;
  onEditingDataChange: (data: Partial<DigitalObject>) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onToggleExpand: (id: string) => void;
}

export const NameCellWithExpand = ({
  obj,
  isEditing,
  editingData,
  onFieldClick,
  onEditingDataChange,
  onKeyDown,
  onToggleExpand
}: NameCellWithExpandProps) => {
  // Check if this row has children (is a parent row)
  const hasChildren = obj.level === 0 || (obj.parent_id === null);

  if (isEditing) {
    return (
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
    );
  }

  return (
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
          className="text-white hover:text-slate-300"
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
};