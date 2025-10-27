import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, ChevronDown, Box, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ObjectTreeProps {
  model: any;
  ifcLoader: any;
}

export const ObjectTree = ({ model, ifcLoader }: ObjectTreeProps) => {
  const [treeData, setTreeData] = useState<any[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [visibleNodes, setVisibleNodes] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!model || !ifcLoader) {
      setTreeData([]);
      return;
    }

    const buildTree = async () => {
      setIsLoading(true);
      
      try {
        const modelID = model.id;
        
        console.log("Building tree for model:", modelID);
        console.log("Model structure:", model);
        
        // Get all entities from the xeokit model
        const entities = model.scene ? model.scene.models[modelID]?.objects : {};
        
        if (!entities || Object.keys(entities).length === 0) {
          console.log("No entities found in model");
          setTreeData([]);
          setIsLoading(false);
          return;
        }

        console.log(`Found ${Object.keys(entities).length} entities`);
        
        // Group entities by type
        const elementsByType = new Map<string, any[]>();
        const visibleSet = new Set<string>();
        let processedCount = 0;
        const MAX_OBJECTS = 500; // Limit for performance
        
        for (const [entityId, entity] of Object.entries(entities)) {
          if (processedCount >= MAX_OBJECTS) break;
          
          try {
            const ifcType = (entity as any).type || "Unknown";
            const entityName = (entity as any).name || `${ifcType} ${processedCount + 1}`;
            
            if (!elementsByType.has(ifcType)) {
              elementsByType.set(ifcType, []);
            }
            
            const nodeId = `entity-${entityId}`;
            elementsByType.get(ifcType)!.push({
              id: nodeId,
              name: entityName,
              entity: entity,
              entityId: entityId,
              level: 1
            });
            
            visibleSet.add(nodeId);
            processedCount++;
            
            // Allow UI to breathe every 50 items
            if (processedCount % 50 === 0) {
              await new Promise(resolve => setTimeout(resolve, 0));
            }
          } catch (error) {
            console.warn(`Error processing entity ${entityId}:`, error);
          }
        }
        
        // Convert to tree structure
        const nodes: any[] = [];
        
        for (const [typeName, elements] of elementsByType.entries()) {
          const typeId = `type-${typeName}`;
          visibleSet.add(typeId);
          
          nodes.push({
            id: typeId,
            name: typeName,
            count: elements.length,
            type: typeName,
            level: 0,
            children: elements
          });
        }
        
        // Sort alphabetically
        nodes.sort((a, b) => a.type.localeCompare(b.type));
        
        console.log(`Tree built with ${nodes.length} types, ${processedCount} total objects`);
        
        setTreeData(nodes);
        setVisibleNodes(visibleSet);
        setIsLoading(false);
        
        if (Object.keys(entities).length > MAX_OBJECTS) {
          toast.info(`Showing first ${MAX_OBJECTS} of ${Object.keys(entities).length} objects`);
        }
      } catch (error) {
        console.error("Error building tree:", error);
        toast.error("Failed to build object tree");
        setTreeData([]);
        setIsLoading(false);
      }
    };

    buildTree();
  }, [model, ifcLoader]);

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
    
    if (isVisible) {
      newVisible.delete(node.id);
      if (node.children) {
        node.children.forEach((child: any) => {
          newVisible.delete(child.id);
          if (child.entity) {
            child.entity.visible = false;
          }
        });
      }
    } else {
      newVisible.add(node.id);
      if (node.children) {
        node.children.forEach((child: any) => {
          newVisible.add(child.id);
          if (child.entity) {
            child.entity.visible = true;
          }
        });
      }
    }
    
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
          className="flex items-center gap-2 px-6 py-3 hover:bg-accent/30 cursor-pointer transition-all duration-200 group"
          style={{ paddingLeft: `${level * 16 + 24}px` }}
        >
          <div 
            className="flex items-center gap-2 flex-1 min-w-0"
            onClick={() => hasChildren && toggleNode(node.id)}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 transition-transform duration-200" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 transition-transform duration-200" />
              )
            ) : (
              <Box className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            )}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-sm font-medium text-foreground truncate">
                {node.name}
              </span>
              {node.count !== undefined && (
                <span className="text-xs text-muted-foreground/70 flex-shrink-0 font-mono">
                  ({node.count})
                </span>
              )}
            </div>
          </div>
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
      <div className="px-6 py-4 border-b border-border/30">
        <h3 className="text-[11px] font-semibold text-luxury-gold uppercase tracking-wider">Project Structure</h3>
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
