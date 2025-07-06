import { Check, X, Edit } from "lucide-react";

interface ActionButtonsProps {
  isEditing: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export const ActionButtons = ({
  isEditing,
  onSave,
  onCancel
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
    );
  }

  return <Edit className="w-3 h-3 text-slate-400" />;
};