import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, EyeOff, Pin, Package, MoreVertical, Edit, Upload, Trash2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ObjectTreeProps {
  loadedModels: Map<string, any>;
  visibleModels: Set<string>;
  ifcLoader: any;
  isPinned?: boolean;
  onPinToggle?: () => void;
  viewer?: any;
  savedModels?: any[];
  onModelLoad?: (filePath: string, fileName: string, modelDbId?: string) => void;
  onModelToggleVisibility?: (modelDbId: string) => void;
  onModelRename?: (modelId: string, currentName: string) => void;
  onModelReplace?: (modelId: string) => void;
  onModelDelete?: (modelId: string, fileName: string) => void;
}

export const ObjectTree = ({ 
  loadedModels,
  visibleModels,
  isPinned = false, 
  onPinToggle, 
  savedModels = [], 
  onModelLoad,
  onModelToggleVisibility,
  onModelRename,
  onModelReplace,
  onModelDelete,
  viewer
}: ObjectTreeProps) => {
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
          modelId: metaObject.modelId
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
                modelId: metaObject.modelId
              });
              break; // Don't add duplicates
            }
          }
        }
      }
    });

    setFilteredElements(elements);
  }, [searchQuery, viewer, loadedModels]);

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
  };
  
  return (
    <div className="h-full flex flex-col bg-white/80 backdrop-blur-xl border-r border-border/30">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border/30 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-luxury-gold" />
            <h3 className="text-xs font-semibold text-luxury-gold uppercase tracking-wider">
              Project Models
            </h3>
          </div>
          {onPinToggle && (
            <button
              onClick={onPinToggle}
              className={`transition-all duration-200 p-1.5 hover:bg-accent/50 rounded-full ${
                isPinned ? 'text-luxury-gold' : 'text-muted-foreground'
              }`}
              title={isPinned ? "Unpin (auto-collapse)" : "Pin (keep open)"}
            >
              <Pin className="h-3.5 w-3.5" />
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

      {/* Content - Search Results or Models List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* Search Results */}
          {searchQuery && (
            <div className="mb-4">
              <div className="px-4 py-2 text-xs font-semibold text-luxury-gold uppercase tracking-wider">
                Search Results ({filteredElements.length})
              </div>
              {filteredElements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                  <Search className="h-10 w-10 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No elements found
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Try a different Assembly Number
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredElements.map((element) => (
                    <button
                      key={element.id}
                      onClick={() => handleElementClick(element.id)}
                      className="w-full flex items-start gap-3 px-4 py-3 rounded-lg hover:bg-luxury-gold/10 transition-all duration-200 text-left group border border-transparent hover:border-luxury-gold/30"
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

          {/* Models List */}
          {!searchQuery && (
            <>
              {savedModels.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <Package className="h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No models uploaded yet
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Upload an IFC model to get started
                  </p>
                </div>
              ) : (
                savedModels.map((savedModel) => {
                  const modelDbId = savedModel.id;
                  const isLoaded = loadedModels.has(modelDbId);
                  const isVisible = visibleModels.has(modelDbId);
                  
                  return (
                    <div
                      key={modelDbId}
                      className={`flex items-center gap-2 px-4 py-3 mb-1 rounded-lg hover:bg-accent/30 transition-all duration-200 group ${
                        isLoaded && isVisible ? 'bg-luxury-gold/10 border border-luxury-gold/30' : ''
                      }`}
                    >
                      <Package className={`h-4 w-4 flex-shrink-0 ${isLoaded ? 'text-luxury-gold' : 'text-muted-foreground'}`} />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium truncate ${isLoaded ? 'text-luxury-gold' : 'text-foreground'}`}>
                            {savedModel.file_name}
                          </span>
                          {isLoaded && isVisible && (
                            <span className="text-xs bg-luxury-gold/20 text-luxury-gold px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                              Visible
                            </span>
                          )}
                          {isLoaded && !isVisible && (
                            <span className="text-xs bg-muted/50 text-muted-foreground px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                              Hidden
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Eye icon for show/hide */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isLoaded && onModelToggleVisibility) {
                              onModelToggleVisibility(modelDbId);
                            } else if (!isLoaded && onModelLoad) {
                              onModelLoad(savedModel.file_path, savedModel.file_name, modelDbId);
                            }
                          }}
                          className="transition-all duration-200 p-1.5 hover:bg-accent/50 rounded-full flex-shrink-0"
                          title={isLoaded ? (isVisible ? "Hide model" : "Show model") : "Load model"}
                        >
                          {isLoaded && isVisible ? (
                            <Eye className="h-3.5 w-3.5 text-luxury-gold" />
                          ) : (
                            <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </button>
                        
                        {/* More options menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="transition-all duration-200 p-1.5 hover:bg-accent/50 rounded-full flex-shrink-0 opacity-0 group-hover:opacity-100"
                            >
                              <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {onModelRename && (
                              <DropdownMenuItem
                                onClick={() => onModelRename(modelDbId, savedModel.file_name)}
                              >
                                <Edit className="h-3.5 w-3.5 mr-2" />
                                Rename
                              </DropdownMenuItem>
                            )}
                            {onModelReplace && (
                              <DropdownMenuItem
                                onClick={() => onModelReplace(modelDbId)}
                              >
                                <Upload className="h-3.5 w-3.5 mr-2" />
                                Replace
                              </DropdownMenuItem>
                            )}
                            {onModelDelete && (
                              <DropdownMenuItem
                                onClick={() => onModelDelete(modelDbId, savedModel.file_name)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
