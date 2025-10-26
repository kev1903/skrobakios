import { ScrollArea } from "@/components/ui/scroll-area";
import { MousePointer } from "lucide-react";

interface Property {
  name: string;
  value: string | number;
}

interface PropertyGroup {
  title: string;
  properties: Property[];
}

interface PropertiesPanelProps {
  selectedObject?: {
    name: string;
    type: string;
    tag?: string;
    propertyGroups?: PropertyGroup[];
  };
}

export const PropertiesPanel = ({ selectedObject }: PropertiesPanelProps) => {
  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 border-b border-border/50 bg-gradient-to-b from-primary/5 to-transparent">
        <h3 className="text-base font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Properties
        </h3>
      </div>
      <ScrollArea className="flex-1">
        {selectedObject ? (
          <div className="p-6 space-y-4">
            <div className="glass-button p-4 rounded-xl space-y-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Name</div>
                <div className="text-sm font-medium">{selectedObject.name}</div>
              </div>

              {selectedObject.tag && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Tag</div>
                  <div className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-sm font-medium inline-block">
                    {selectedObject.tag}
                  </div>
                </div>
              )}

              <div>
                <div className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Type</div>
                <div className="text-sm font-mono bg-muted/50 px-2 py-1 rounded">{selectedObject.type}</div>
              </div>
            </div>

            {selectedObject.propertyGroups?.map((group, idx) => (
              <div key={idx} className="glass-button p-4 rounded-xl space-y-3">
                <div className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent" />
                  {group.title}
                  <div className="h-px flex-1 bg-gradient-to-l from-primary/50 to-transparent" />
                </div>
                <div className="space-y-2">
                  {group.properties.map((prop, propIdx) => (
                    <div key={propIdx} className="flex justify-between items-start gap-3 text-xs py-1.5 border-b border-border/30 last:border-0">
                      <span className="text-muted-foreground flex-1 font-medium">
                        {prop.name}
                      </span>
                      <span className="font-mono text-right text-foreground">
                        {prop.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <div className="glass-button p-8 rounded-xl">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <MousePointer className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Select an object to view its properties
              </p>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
