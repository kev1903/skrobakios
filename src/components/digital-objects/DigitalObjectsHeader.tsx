import { Plus, ChevronRight, ChevronLeft, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRef } from "react";

interface DigitalObjectsHeaderProps {
  selectedIds: string[];
  onIndent: () => void;
  onOutdent: () => void;
  onAddRow: () => void;
  onImportCSV: (file: File) => void;
}

export const DigitalObjectsHeader = ({ 
  selectedIds, 
  onIndent, 
  onOutdent, 
  onAddRow,
  onImportCSV 
}: DigitalObjectsHeaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      onImportCSV(file);
    }
    // Reset the input
    event.target.value = '';
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Digital Objects</h1>
        <p className="text-slate-400">Manage project digital objects and deliverables</p>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onOutdent}
          disabled={selectedIds.length === 0}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Outdent
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onIndent}
          disabled={selectedIds.length === 0}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <ChevronRight className="w-4 h-4 mr-1" />
          Indent
        </Button>
        
        <Button
          variant="outline" 
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <Upload className="w-4 h-4 mr-1" />
          Import CSV
        </Button>
        
        <Button 
          onClick={onAddRow}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Row
        </Button>
        
        <Input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {selectedIds.length > 0 && (
          <span className="text-sm text-slate-400 ml-2">
            {selectedIds.length} item(s) selected
          </span>
        )}
      </div>
    </div>
  );
};