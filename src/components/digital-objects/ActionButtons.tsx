import { Check, X, Edit, Trash2 } from "lucide-react";

interface ActionButtonsProps {
  isEditing: boolean;
  onSave: () => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export const ActionButtons = ({
  isEditing,
  onSave,
  onCancel,
  onDelete
}: ActionButtonsProps) => {
  if (isEditing) {
    return (
      <div className="flex gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSave();
          }}
          className="p-1 text-green-400 hover:text-green-300"
          title="Save changes"
        >
          <Check className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCancel();
          }}
          className="p-1 text-red-400 hover:text-red-300"
          title="Cancel editing"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-1">
      <Edit className="w-3 h-3 text-slate-400" />
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 text-red-400 hover:text-red-300"
          title="Delete row"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};