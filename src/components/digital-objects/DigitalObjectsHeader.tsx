import { Table, ChevronRight, ChevronLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DigitalObjectsHeaderProps {
  selectedIds: string[];
  onIndent: () => void;
  onOutdent: () => void;
  onAddRow: () => void;
}

export const DigitalObjectsHeader = ({ selectedIds, onIndent, onOutdent, onAddRow }: DigitalObjectsHeaderProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Table className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Digital Objects</h1>
            <p className="text-white">Project component data table</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={onAddRow}
            variant="default"
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="w-4 h-4" />
            Add Row
          </Button>
          <Button
            onClick={onOutdent}
            disabled={selectedIds.length === 0}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
          >
            <ChevronLeft className="w-4 h-4" />
            Outdent
          </Button>
          <Button
            onClick={onIndent}
            disabled={selectedIds.length === 0}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
          >
            <ChevronRight className="w-4 h-4" />
            Indent
          </Button>
        </div>
      </div>
    </div>
  );
};