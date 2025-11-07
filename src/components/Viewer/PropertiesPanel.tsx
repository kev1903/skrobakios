import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MousePointer, Pin, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Package } from "lucide-react";

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
  viewer?: any;
  onElementSelect?: (elementId: string) => void;
}

const findAssemblyNumber = (selectedObject: any): string | null => {
  // First check in attributes
  if (selectedObject.attributes?.ASSEMBLY_POS) {
    return selectedObject.attributes.ASSEMBLY_POS;
  }
  
  // Then check in property sets
  if (selectedObject.propertySets) {
    for (const propSet of selectedObject.propertySets) {
      if (propSet.properties?.ASSEMBLY_POS) {
        return propSet.properties.ASSEMBLY_POS;
      }
    }
  }
  
  return null;
};

export const PropertiesPanel = ({ selectedObject, isPinned = false, onPinToggle, viewer, onElementSelect }: PropertiesPanelProps) => {
  const assemblyNumber = selectedObject ? findAssemblyNumber(selectedObject) : null;
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredElements, setFilteredElements] = useState<any[]>([]);

  // Extract and filter elements when search query changes
  useEffect(() => {
    if (!searchQuery.trim() || !viewer?.metaScene) {
      setFilteredElements([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const elements: any[] = [];
    const metaObjects = viewer.metaScene.metaObjects;

    // Search through all meta objects
    Object.values(metaObjects).forEach((metaObject: any) => {
      if (!metaObject) return;

      // Search in attributes for ASSEMBLY_POS
      const assemblyPos = metaObject.attributes?.ASSEMBLY_POS;
      if (assemblyPos && String(assemblyPos).toLowerCase().includes(query)) {
        elements.push({
          id: metaObject.id,
          name: metaObject.name || metaObject.id,
          type: metaObject.type || "Unknown",
          assemblyPos: assemblyPos,
        });
      }
      
      // Also search in property sets
      if (metaObject.propertySets) {
        for (const propSet of metaObject.propertySets) {
          if (propSet.properties?.ASSEMBLY_POS) {
            const assemblyPosInPropSet = propSet.properties.ASSEMBLY_POS;
            if (String(assemblyPosInPropSet).toLowerCase().includes(query)) {
              elements.push({
                id: metaObject.id,
                name: metaObject.name || metaObject.id,
                type: metaObject.type || "Unknown",
                assemblyPos: assemblyPosInPropSet,
              });
              break;
            }
          }
        }
      }
    });

    setFilteredElements(elements);
  }, [searchQuery, viewer]);

  const handleElementClick = (elementId: string) => {
    if (!viewer) return;
    
    // Clear previous selection
    viewer.scene.setObjectsSelected(viewer.scene.selectedObjectIds, false);
    
    // Select the clicked element
    viewer.scene.setObjectsSelected([elementId], true);
    
    // Fly camera to the element
    const entity = viewer.scene.objects[elementId];
    if (entity && viewer.cameraFlight) {
      viewer.cameraFlight.flyTo({
        aabb: entity.aabb,
        duration: 0.5
      });
    }

    // Trigger the parent callback if provided
    if (onElementSelect) {
      onElementSelect(elementId);
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* Header with Search */}
      <div className="px-6 py-4 border-b border-border/30 space-y-3">
        <div className="flex items-center justify-between">
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

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search by Assembly Number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8 h-9 text-sm bg-white/50 border-border/30 focus:bg-white focus:border-luxury-gold/50 transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-accent/50 rounded-full transition-all duration-200"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        {/* Search Results */}
        {searchQuery && (
          <div className="p-6">
            <div className="mb-3 text-xs font-semibold text-luxury-gold uppercase tracking-wider">
              Search Results ({filteredElements.length})
            </div>
            {filteredElements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  No elements found
                </p>
                <p className="text-xs text-muted-foreground/60">
                  Try a different Assembly Number
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredElements.map((element) => (
                  <button
                    key={element.id}
                    onClick={() => handleElementClick(element.id)}
                    className="w-full flex items-start gap-3 px-4 py-3 rounded-lg hover:bg-luxury-gold/10 transition-all duration-200 text-left border border-border/20 hover:border-luxury-gold/30"
                  >
                    <Package className="h-4 w-4 text-luxury-gold flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-luxury-gold font-mono">
                          {element.assemblyPos}
                        </span>
                        <span className="text-xs bg-luxury-gold/20 text-luxury-gold px-2 py-0.5 rounded-md font-medium">
                          {element.type}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {element.name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Selected Object - Assembly Number Only */}
        {!searchQuery && selectedObject && (
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

            {/* Assembly Number - Prominent Display */}
            {assemblyNumber ? (
              <div className="space-y-3">
                <h5 className="text-[11px] font-semibold text-luxury-gold uppercase tracking-wider">
                  Assembly Number
                </h5>
                <div className="flex items-center justify-center p-8 bg-luxury-gold/10 rounded-xl border-2 border-luxury-gold/30">
                  <span className="text-4xl font-bold text-luxury-gold font-mono tracking-wider">
                    {assemblyNumber}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-3">
                  <MousePointer className="h-6 w-6 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  No Assembly Number
                </p>
                <p className="text-xs text-muted-foreground/60">
                  This element doesn't have an ASSEMBLY_POS property
                </p>
              </div>
            )}
          </div>
        )}

        {/* No Selection State */}
        {!searchQuery && !selectedObject && (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
              <MousePointer className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Select an object to view its Assembly Number
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Or use the search bar above to find elements
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
