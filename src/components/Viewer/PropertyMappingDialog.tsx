import { useState } from "react";
import { Settings, Plus, X, RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  IFCPropertyMapping,
  DEFAULT_IFC_PROPERTY_MAPPING,
  getPropertyMapping,
  savePropertyMapping,
  resetPropertyMapping,
} from "@/types/ifcPropertyMapping";
import { toast } from "sonner";

interface PropertyMappingDialogProps {
  onMappingChange?: () => void;
}

export const PropertyMappingDialog = ({ onMappingChange }: PropertyMappingDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mapping, setMapping] = useState<IFCPropertyMapping>(getPropertyMapping());

  const handleAddProperty = (field: keyof IFCPropertyMapping) => {
    setMapping({
      ...mapping,
      [field]: [...mapping[field], '']
    });
  };

  const handleRemoveProperty = (field: keyof IFCPropertyMapping, index: number) => {
    const newArray = [...mapping[field]];
    newArray.splice(index, 1);
    setMapping({
      ...mapping,
      [field]: newArray
    });
  };

  const handleUpdateProperty = (field: keyof IFCPropertyMapping, index: number, value: string) => {
    const newArray = [...mapping[field]];
    newArray[index] = value;
    setMapping({
      ...mapping,
      [field]: newArray
    });
  };

  const handleSave = () => {
    // Remove empty strings
    const cleanedMapping: IFCPropertyMapping = {
      assemblyNumber: mapping.assemblyNumber.filter(v => v.trim() !== ''),
      elementId: mapping.elementId.filter(v => v.trim() !== ''),
      tag: mapping.tag.filter(v => v.trim() !== ''),
      reference: mapping.reference.filter(v => v.trim() !== ''),
      mark: mapping.mark.filter(v => v.trim() !== '')
    };

    savePropertyMapping(cleanedMapping);
    toast.success('Property mapping saved successfully');
    setIsOpen(false);
    onMappingChange?.();
  };

  const handleReset = () => {
    resetPropertyMapping();
    setMapping(DEFAULT_IFC_PROPERTY_MAPPING);
    toast.success('Property mapping reset to defaults');
    onMappingChange?.();
  };

  const renderPropertyList = (
    field: keyof IFCPropertyMapping, 
    label: string, 
    description: string
  ) => (
    <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border/30">
      <div>
        <Label className="text-sm font-semibold text-foreground">{label}</Label>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
      <div className="space-y-2">
        {mapping[field].map((property, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-6">{index + 1}.</span>
            <Input
              value={property}
              onChange={(e) => handleUpdateProperty(field, index, e.target.value)}
              placeholder="Property name..."
              className="flex-1 h-8 text-sm"
            />
            <button
              onClick={() => handleRemoveProperty(field, index)}
              className="p-1 hover:bg-destructive/10 rounded transition-colors"
              title="Remove"
            >
              <X className="h-3.5 w-3.5 text-destructive" />
            </button>
          </div>
        ))}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleAddProperty(field)}
          className="w-full h-8 text-xs"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Property Name
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          className="p-1.5 rounded-full hover:bg-accent/50 transition-all duration-200"
          title="Configure property mapping"
        >
          <Settings className="h-3.5 w-3.5 text-muted-foreground hover:text-luxury-gold" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-luxury-gold" />
            IFC Property Mapping Configuration
          </DialogTitle>
          <DialogDescription>
            Configure which IFC property names map to semantic fields. Properties are checked in order (top to bottom, first match wins).
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-4">
            {renderPropertyList(
              'assemblyNumber',
              'Assembly Number',
              'Property containing the assembly/part identifier (e.g., "1B1.1", "1C1.1")'
            )}
            
            {renderPropertyList(
              'elementId',
              'Element ID',
              'Property containing the unique element identifier'
            )}
            
            {renderPropertyList(
              'tag',
              'Tag',
              'Property containing the element tag or label'
            )}
            
            {renderPropertyList(
              'reference',
              'Reference',
              'Property containing the element reference or code'
            )}
            
            {renderPropertyList(
              'mark',
              'Mark',
              'Property containing the element mark or position identifier'
            )}
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between gap-3 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset to Defaults
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="bg-luxury-gold hover:bg-luxury-gold/90 text-white"
            >
              Save Mapping
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
