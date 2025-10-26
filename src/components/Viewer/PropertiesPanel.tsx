import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface PropertyGroup {
  title: string;
  properties: Array<{ name: string; value: string }>;
}

interface SelectedObject {
  name: string;
  type: string;
  tag: string;
  propertyGroups: PropertyGroup[];
}

interface PropertiesPanelProps {
  selectedObject: SelectedObject | null;
}

export const PropertiesPanel = ({ selectedObject }: PropertiesPanelProps) => {
  if (!selectedObject) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-6 border-b border-border/30">
          <h3 className="text-sm font-semibold text-luxury-gold uppercase tracking-wide">Properties</h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Select an object to view its properties</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Click on any element in the viewer</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-border/30">
        <h3 className="text-sm font-semibold text-luxury-gold uppercase tracking-wide mb-4">Properties</h3>
        
        {/* NAME */}
        <div className="mb-4">
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            NAME
          </div>
          <div className="text-base font-semibold text-foreground">
            {selectedObject.name}
          </div>
        </div>

        {/* TYPE */}
        <div>
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            TYPE
          </div>
          <div className="text-sm font-mono text-foreground">
            {selectedObject.type}
          </div>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Property Groups */}
          {selectedObject.propertyGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-luxury-gold/20"></div>
                <h4 className="text-xs font-semibold text-luxury-gold uppercase tracking-wider whitespace-nowrap">
                  {group.title}
                </h4>
                <div className="h-px flex-1 bg-luxury-gold/20"></div>
              </div>
              <div className="space-y-2">
                {group.properties.map((prop, propIndex) => (
                  <div key={propIndex} className="grid grid-cols-2 gap-4 py-1.5">
                    <span className="text-xs text-muted-foreground">
                      {prop.name}
                    </span>
                    <span className="text-xs font-medium text-right text-foreground">
                      {prop.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
