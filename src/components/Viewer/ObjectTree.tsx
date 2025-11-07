import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, ChevronDown, Box, Eye, EyeOff, Loader2, Pin, Package, MoreVertical, Edit, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ObjectTreeProps {
  model: any;
  ifcLoader: any;
  isPinned?: boolean;
  onPinToggle?: () => void;
  viewer?: any;
  savedModels?: any[];
  onModelLoad?: (filePath: string, fileName: string) => void;
  onModelUnload?: () => void;
  onModelRename?: (modelId: string, currentName: string) => void;
  onModelReplace?: (modelId: string) => void;
  onModelDelete?: (modelId: string, fileName: string) => void;
}

export const ObjectTree = ({ 
  model, 
  ifcLoader, 
  isPinned = false, 
  onPinToggle, 
  viewer, 
  savedModels = [], 
  onModelLoad,
  onModelUnload,
  onModelRename,
  onModelReplace,
  onModelDelete
}: ObjectTreeProps) => {
  const [treeData, setTreeData] = useState<any[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [visibleNodes, setVisibleNodes] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Save visibility state to localStorage whenever it changes
  useEffect(() => {
    if (!model?.id && !model?.fileName) return;
    if (visibleNodes.size === 0) return; // Don't save empty state on initial load
    
    const storageKey = `objectTree_visibility_${model.id || model.fileName}`;
    const stateArray = Array.from(visibleNodes);
    localStorage.setItem(storageKey, JSON.stringify(stateArray));
    console.log('💾 Saved visibility state:', stateArray.length, 'nodes');
  }, [visibleNodes, model?.id, model?.fileName]);

  useEffect(() => {
    const buildTree = async () => {
      setIsLoading(true);
      
      try {
        // Check for saved visibility state
        const storageKey = model?.id 
          ? `objectTree_visibility_${model.id}` 
          : model?.fileName 
            ? `objectTree_visibility_${model.fileName}`
            : null;
        
        let savedVisibilitySet: Set<string> | null = null;
        if (storageKey) {
          const savedState = localStorage.getItem(storageKey);
          if (savedState) {
            try {
              const parsedState = JSON.parse(savedState);
              savedVisibilitySet = new Set(parsedState);
              console.log('📂 Using saved visibility state:', parsedState.length, 'nodes');
            } catch (error) {
              console.warn('Failed to load visibility state:', error);
            }
          }
        }
        
        // Build tree with models at the top level
        const modelNodes: any[] = [];
        const visibleSet = savedVisibilitySet || new Set<string>();
        
        // If we have saved models, show them at the top level
        if (savedModels.length > 0) {
          for (const savedModel of savedModels) {
            const modelId = `model-${savedModel.id}`;
            
            // Only add to visible set if no saved state exists
            if (!savedVisibilitySet) {
              visibleSet.add(modelId);
            }
            
            const modelNode: any = {
              id: modelId,
              name: savedModel.file_name,
              modelData: savedModel,
              level: 0,
              isModel: true,
              isLoadedModel: model?.id === savedModel.id || model?.fileName === savedModel.file_name,
              children: []
            };
            
            // If this is the currently loaded model and we have viewer data, build the schema
            if (modelNode.isLoadedModel && viewer && model) {
              const sceneObjects = viewer.scene.objects;
              
              if (sceneObjects && Object.keys(sceneObjects).length > 0) {
                const metaObjects = viewer.metaScene?.metaObjects || {};
                const elementsByType = new Map<string, any[]>();
                let processedCount = 0;
                const MAX_OBJECTS = 500;
                
                for (const [entityId, sceneObject] of Object.entries(sceneObjects)) {
                  if (processedCount >= MAX_OBJECTS) break;
                  
                  try {
                    const metaObject = metaObjects[entityId];
                    const ifcType = metaObject?.type || (sceneObject as any).type || "Unknown";
                    const entityName = metaObject?.name || (sceneObject as any).name || `${ifcType} ${processedCount + 1}`;
                    
                    if (!elementsByType.has(ifcType)) {
                      elementsByType.set(ifcType, []);
                    }
                    
                    const nodeId = `entity-${entityId}`;
                    const entityNode = {
                      id: nodeId,
                      name: entityName,
                      entity: sceneObject,
                      entityId: entityId,
                      level: 2
                    };
                    
                    elementsByType.get(ifcType)!.push(entityNode);
                    
                    // Set initial visibility based on saved state or default to visible
                    const shouldBeVisible = savedVisibilitySet 
                      ? savedVisibilitySet.has(nodeId)
                      : true;
                    
                    if (!savedVisibilitySet) {
                      visibleSet.add(nodeId);
                    }
                    
                    // Apply visibility to the actual scene object
                    (sceneObject as any).visible = shouldBeVisible;
                    
                    processedCount++;
                    
                    if (processedCount % 50 === 0) {
                      await new Promise(resolve => setTimeout(resolve, 0));
                    }
                  } catch (error) {
                    console.warn(`Error processing entity ${entityId}:`, error);
                  }
                }
                
                // Convert types to tree nodes
                const typeNodes: any[] = [];
                for (const [typeName, elements] of elementsByType.entries()) {
                  const typeId = `type-${modelId}-${typeName}`;
                  
                  if (!savedVisibilitySet) {
                    visibleSet.add(typeId);
                  }
                  
                  typeNodes.push({
                    id: typeId,
                    name: typeName,
                    count: elements.length,
                    type: typeName,
                    level: 1,
                    children: elements
                  });
                }
                
                typeNodes.sort((a, b) => a.type.localeCompare(b.type));
                modelNode.children = typeNodes;
                
                if (Object.keys(sceneObjects).length > MAX_OBJECTS) {
                  toast.info(`Showing first ${MAX_OBJECTS} of ${Object.keys(sceneObjects).length} objects`);
                }
              }
            }
            
            modelNodes.push(modelNode);
          }
        } else if (model && viewer) {
          // Fallback to old behavior if no saved models
          const sceneObjects = viewer.scene.objects;
          
          if (!sceneObjects || Object.keys(sceneObjects).length === 0) {
            setTreeData([]);
            setIsLoading(false);
            return;
          }

          const metaObjects = viewer.metaScene?.metaObjects || {};
          const elementsByType = new Map<string, any[]>();
          let processedCount = 0;
          const MAX_OBJECTS = 500;
          
          for (const [entityId, sceneObject] of Object.entries(sceneObjects)) {
            if (processedCount >= MAX_OBJECTS) break;
            
            try {
              const metaObject = metaObjects[entityId];
              const ifcType = metaObject?.type || (sceneObject as any).type || "Unknown";
              const entityName = metaObject?.name || (sceneObject as any).name || `${ifcType} ${processedCount + 1}`;
              
              if (!elementsByType.has(ifcType)) {
                elementsByType.set(ifcType, []);
              }
              
              const nodeId = `entity-${entityId}`;
              elementsByType.get(ifcType)!.push({
                id: nodeId,
                name: entityName,
                entity: sceneObject,
                entityId: entityId,
                level: 1
              });
              
              // Set initial visibility based on saved state or default to visible
              const shouldBeVisible = savedVisibilitySet 
                ? savedVisibilitySet.has(nodeId)
                : true;
              
              if (!savedVisibilitySet) {
                visibleSet.add(nodeId);
              }
              
              // Apply visibility to the actual scene object
              (sceneObject as any).visible = shouldBeVisible;
              
              processedCount++;
              
              if (processedCount % 50 === 0) {
                await new Promise(resolve => setTimeout(resolve, 0));
              }
            } catch (error) {
              console.warn(`Error processing entity ${entityId}:`, error);
            }
          }
          
          for (const [typeName, elements] of elementsByType.entries()) {
            const typeId = `type-${typeName}`;
            
            if (!savedVisibilitySet) {
              visibleSet.add(typeId);
            }
            
            modelNodes.push({
              id: typeId,
              name: typeName,
              count: elements.length,
              type: typeName,
              level: 0,
              children: elements
            });
          }
          
          modelNodes.sort((a, b) => (a.type || a.name).localeCompare(b.type || b.name));
        }
        
        setTreeData(modelNodes);
        setVisibleNodes(visibleSet);
        setIsLoading(false);
      } catch (error) {
        console.error("Error building tree:", error);
        toast.error("Failed to build object tree");
        setTreeData([]);
        setIsLoading(false);
      }
    };

    buildTree();
  }, [model, viewer, savedModels]);

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const toggleVisibility = (node: any, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const newVisible = new Set(visibleNodes);
    const isVisible = visibleNodes.has(node.id);
    
    // Recursive function to toggle visibility of all descendants
    const toggleNodeAndChildren = (n: any, visible: boolean) => {
      if (visible) {
        newVisible.add(n.id);
      } else {
        newVisible.delete(n.id);
      }
      
      // If it has an entity, toggle its visibility
      if (n.entity) {
        n.entity.visible = visible;
      }
      
      // Recursively toggle children
      if (n.children) {
        n.children.forEach((child: any) => {
          toggleNodeAndChildren(child, visible);
        });
      }
    };
    
    // Toggle this node and all its descendants
    toggleNodeAndChildren(node, !isVisible);
    
    setVisibleNodes(newVisible);
  };

  const renderNode = (node: any) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isVisible = visibleNodes.has(node.id);
    const level = node.level || 0;

    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-2 px-6 py-3 hover:bg-accent/30 cursor-pointer transition-all duration-200 group ${
            node.isModel && node.isLoadedModel ? 'bg-luxury-gold/10 border-l-4 border-l-luxury-gold' : ''
          }`}
          style={{ paddingLeft: `${level * 16 + 24}px` }}
          onClick={() => {
            if (node.isModel && !node.isLoadedModel && onModelLoad && node.modelData) {
              onModelLoad(node.modelData.file_path, node.modelData.file_name);
            } else if (hasChildren) {
              toggleNode(node.id);
            }
          }}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 transition-transform duration-200" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 transition-transform duration-200" />
              )
            ) : node.isModel ? (
              <Package className="h-3.5 w-3.5 text-luxury-gold flex-shrink-0" />
            ) : (
              <Box className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            )}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className={`text-sm font-medium truncate ${node.isModel ? 'text-luxury-gold' : 'text-foreground'}`}>
                {node.name}
              </span>
              {node.count !== undefined && (
                <span className="text-xs text-muted-foreground/70 flex-shrink-0 font-mono">
                  ({node.count})
                </span>
              )}
              {node.isModel && node.isLoadedModel && (
                <span className="text-xs bg-luxury-gold/20 text-luxury-gold px-2 py-0.5 rounded-full font-medium">
                  Loaded
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {node.isModel ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (node.isLoadedModel && onModelUnload) {
                    onModelUnload();
                  } else if (!node.isLoadedModel && onModelLoad && node.modelData) {
                    onModelLoad(node.modelData.file_path, node.modelData.file_name);
                  }
                }}
                className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 hover:bg-accent/50 rounded-full flex-shrink-0"
                title={node.isLoadedModel ? "Unload model" : "Load model"}
              >
                {node.isLoadedModel ? (
                  <Eye className="h-3.5 w-3.5 text-luxury-gold" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </button>
            ) : node.entity && (
              <button
                onClick={(e) => toggleVisibility(node, e)}
                className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 hover:bg-accent/50 rounded-full flex-shrink-0"
                title={isVisible ? "Hide" : "Show"}
              >
                {isVisible ? (
                  <Eye className="h-3.5 w-3.5 text-luxury-gold" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </button>
            )}
            
            {node.isModel && node.modelData && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 hover:bg-accent/50 rounded-full flex-shrink-0"
                    title="Model actions"
                  >
                    <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onModelRename?.(node.modelData.id, node.modelData.file_name);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onModelReplace?.(node.modelData.id);
                    }}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Replace
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onModelDelete?.(node.modelData.id, node.modelData.file_name);
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {node.children.map((child: any) => renderNode(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white/80 backdrop-blur-xl">
      <div className="px-6 py-4 border-b border-border/30 flex items-center justify-between">
        <h3 className="text-[11px] font-semibold text-luxury-gold uppercase tracking-wider">Project Structure</h3>
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
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <Loader2 className="h-8 w-8 text-luxury-gold animate-spin mb-4" />
            <p className="text-sm font-medium text-muted-foreground mb-1">Processing model...</p>
            <p className="text-xs text-muted-foreground/60">This may take a moment</p>
          </div>
        ) : treeData.length > 0 ? (
          <div className="py-2">
            {treeData.map((node) => renderNode(node))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
              <Box className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">No model loaded</p>
            <p className="text-xs text-muted-foreground/60">Upload an IFC file to view the structure</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
