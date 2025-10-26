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
          <h3 className="text-[11px] font-semibold text-foreground uppercase tracking-wider">Properties</h3>
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
        <h3 className="text-[11px] font-semibold text-foreground uppercase tracking-wider mb-2">Properties</h3>
        <p className="text-sm font-medium text-foreground truncate">
          {selectedObject.name}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {selectedObject.type}
        </p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Header Info */}
          {selectedObject.tag && (
            <div className="bg-accent/20 rounded-xl p-4 border border-border/30">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Tag</span>
                <span className="text-sm font-medium text-luxury-gold">{selectedObject.tag}</span>
              </div>
            </div>
          )}

          {/* Property Groups */}
          {selectedObject.propertyGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              <h4 className="text-[11px] font-semibold text-foreground uppercase tracking-wider mb-3 pb-2 border-b border-border/30">
                {group.title}
              </h4>
              <div className="space-y-3">
                {group.properties.map((prop, propIndex) => (
                  <div key={propIndex} className="flex items-start justify-between gap-3 py-1">
                    <span className="text-xs text-muted-foreground flex-shrink-0 min-w-[100px]">
                      {prop.name}
                    </span>
                    <span className="text-xs font-medium text-right break-all text-foreground">
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
