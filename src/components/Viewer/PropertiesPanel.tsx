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
        <div className="p-4 border-b border-border/30">
          <h3 className="text-sm font-semibold text-foreground">Properties</h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm text-muted-foreground text-center">
            Select an object to view its properties
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border/30">
        <h3 className="text-sm font-semibold text-foreground">Properties</h3>
        <p className="text-xs text-muted-foreground mt-1 truncate">
          {selectedObject.name}
        </p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Header Info */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase">Type</span>
              <span className="text-sm font-medium">{selectedObject.type}</span>
            </div>
            {selectedObject.tag && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase">Tag</span>
                <span className="text-sm font-medium">{selectedObject.tag}</span>
              </div>
            )}
          </div>

          <Separator className="bg-border/30" />

          {/* Property Groups */}
          {selectedObject.propertyGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              <h4 className="text-xs font-semibold text-foreground uppercase mb-3">
                {group.title}
              </h4>
              <div className="space-y-2">
                {group.properties.map((prop, propIndex) => (
                  <div key={propIndex} className="flex items-start justify-between gap-2">
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {prop.name}
                    </span>
                    <span className="text-xs font-medium text-right break-all">
                      {prop.value}
                    </span>
                  </div>
                ))}
              </div>
              {groupIndex < selectedObject.propertyGroups.length - 1 && (
                <Separator className="mt-4 bg-border/30" />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
