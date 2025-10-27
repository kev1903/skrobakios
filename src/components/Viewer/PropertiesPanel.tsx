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
              <h4 className="text-base font-semibold text-foreground">
                {selectedObject.name}
              </h4>
              <div className="flex items-center gap-2 flex-wrap">
                {selectedObject.id && (
                  <span className="text-xs px-2.5 py-1 bg-muted/30 rounded-full font-mono text-muted-foreground border border-border/30">
                    {selectedObject.id}
                  </span>
                )}
                <span className="text-xs px-2.5 py-1 bg-luxury-gold/10 text-luxury-gold rounded-full font-medium border border-luxury-gold/20">
                  {selectedObject.type}
                </span>
              </div>
            </div>

            {/* Properties */}
            <div className="space-y-3">
              <h5 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Object Properties
              </h5>
              <div className="space-y-2">
                {Object.entries(selectedObject).map(([key, value]: [string, any]) => {
                  if (key === 'id' || key === 'name' || key === 'type') return null;
                  
                  const displayValue = typeof value === 'object' && value !== null
                    ? JSON.stringify(value, null, 2)
                    : String(value);
                    
                  return (
                    <div key={key} className="flex justify-between items-start py-2.5 border-b border-border/10 last:border-0">
                      <span className="text-xs text-muted-foreground font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-xs text-foreground font-mono text-right ml-2 max-w-[60%] break-words">
                        {displayValue}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
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
