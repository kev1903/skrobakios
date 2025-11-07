import { ScrollArea } from "@/components/ui/scroll-area";
import { MousePointer, Pin } from "lucide-react";

interface Property {
  name: string;
  value: string | number;
}

interface PropertyGroup {
  groupName: string;
  properties: Property[];
}

interface PropertiesPanelProps {
  selectedObject?: any;
  isPinned?: boolean;
  onPinToggle?: () => void;
}

export const PropertiesPanel = ({ selectedObject, isPinned = false, onPinToggle }: PropertiesPanelProps) => {
  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 border-b border-border/30 flex items-center justify-between">
        <h3 className="text-[11px] font-semibold text-luxury-gold uppercase tracking-wider">
          Properties
        </h3>
        {onPinToggle && (
          <button
            onClick={onPinToggle}
            className={`p-1.5 rounded-full transition-all duration-200 hover:bg-accent/50 ${
              isPinned ? 'text-luxury-gold bg-luxury-gold/10' : 'text-muted-foreground hover:text-luxury-gold'
            }`}
            title={isPinned ? "Unpin panel" : "Pin panel open"}
          >
            <Pin className={`h-3.5 w-3.5 transition-transform duration-200 ${isPinned ? 'rotate-45' : ''}`} />
          </button>
        )}
      </div>

      <ScrollArea className="flex-1">
        {selectedObject ? (
          <div className="p-6 space-y-6">
            {/* Object Header */}
            <div className="space-y-3 pb-4 border-b border-border/30">
              <h4 className="text-base font-semibold text-foreground break-all">
                {selectedObject.name}
              </h4>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs px-2.5 py-1 bg-muted/30 rounded-md font-mono text-muted-foreground border border-border/30">
                  {selectedObject.id}
                </span>
                <span className="text-xs px-2.5 py-1 bg-luxury-gold/10 text-luxury-gold rounded-md font-medium border border-luxury-gold/20">
                  {selectedObject.type}
                </span>
              </div>
            </div>

            {/* Key Properties - Tag and Reference */}
            {(selectedObject.attributes?.Tag || selectedObject.attributes?.Reference) && (
              <div className="space-y-3 pb-4 border-b border-border/30">
                <h5 className="text-[11px] font-semibold text-luxury-gold uppercase tracking-wider">
                  Key Properties
                </h5>
                <div className="grid grid-cols-1 gap-2">
                  {selectedObject.attributes.Tag && (
                    <div className="flex items-center justify-between p-3 bg-luxury-gold/10 rounded-lg border border-luxury-gold/20">
                      <span className="text-xs font-medium text-muted-foreground">Tag</span>
                      <span className="text-sm font-semibold text-luxury-gold font-mono">{selectedObject.attributes.Tag}</span>
                    </div>
                  )}
                  {selectedObject.attributes.Reference && (
                    <div className="flex items-center justify-between p-3 bg-luxury-gold/10 rounded-lg border border-luxury-gold/20">
                      <span className="text-xs font-medium text-muted-foreground">Reference</span>
                      <span className="text-sm font-semibold text-luxury-gold font-mono">{selectedObject.attributes.Reference}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* IFC Property Sets */}
            {selectedObject.propertySets && selectedObject.propertySets.length > 0 ? (
              <div className="space-y-4">
                {selectedObject.propertySets
                  .filter((propSet: any) => {
                    const name = propSet.name.toLowerCase();
                    return !name.includes('statendpoints') && 
                           !name.includes('centreofgravity') && 
                           !name.includes('tekla common');
                  })
                  .map((propSet: any, idx: number) => (
                  <div key={idx} className="space-y-3">
                    <h5 className="text-[11px] font-semibold text-luxury-gold uppercase tracking-wider">
                      {propSet.name}
                    </h5>
                    <div className="space-y-0 bg-muted/5 rounded-lg border border-border/20">
                      {Object.entries(propSet.properties).map(([key, value]: [string, any], propIdx: number) => (
                        <div key={propIdx} className={`flex justify-between items-start px-4 py-3 ${propIdx < Object.keys(propSet.properties).length - 1 ? 'border-b border-border/10' : ''}`}>
                          <span className="text-xs text-muted-foreground font-medium">{key}</span>
                          <span className="text-xs text-foreground font-mono text-right ml-2 max-w-[60%] break-all">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-3">
                  <MousePointer className="h-6 w-6 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  No IFC properties available
                </p>
                <p className="text-xs text-muted-foreground/60">
                  This object may not have property sets
                </p>
              </div>
            )}

            {/* IFC Attributes */}
            {selectedObject.attributes && Object.keys(selectedObject.attributes).length > 0 && (
              <div className="space-y-3">
                <h5 className="text-[11px] font-semibold text-luxury-gold uppercase tracking-wider">
                  IFC Attributes
                </h5>
                <div className="space-y-0 bg-muted/5 rounded-lg border border-border/20">
                  {Object.entries(selectedObject.attributes).map(([key, value]: [string, any], idx: number, arr: any[]) => (
                    <div key={idx} className={`flex justify-between items-start px-4 py-3 ${idx < arr.length - 1 ? 'border-b border-border/10' : ''}`}>
                      <span className="text-xs text-muted-foreground font-medium">{key}</span>
                      <span className="text-xs text-foreground font-mono text-right ml-2 max-w-[60%] break-all">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
              <MousePointer className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Select an object to view its properties
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
