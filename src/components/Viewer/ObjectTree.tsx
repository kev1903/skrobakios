import { useState, useEffect } from "react";
import * as THREE from "three";
import { IFCLoader } from "web-ifc-three/IFCLoader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, ChevronDown, Box, Eye, EyeOff } from "lucide-react";

interface ObjectTreeProps {
  model: THREE.Object3D | null;
  ifcLoader: IFCLoader | null;
}

export const ObjectTree = ({ model, ifcLoader }: ObjectTreeProps) => {
  const [treeData, setTreeData] = useState<any[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [visibleNodes, setVisibleNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!model || !ifcLoader) {
      setTreeData([]);
      return;
    }

    const buildTree = async () => {
      console.log("Building tree from IFC model", model);
      
      try {
        // Log model structure for debugging
        console.log("Model type:", model.type);
        console.log("Model children count:", model.children?.length);
        console.log("Model constructor:", model.constructor.name);
        
        // Count all objects (not just Mesh type)
        let totalObjects = 0;
        const allObjects: THREE.Object3D[] = [];
        
        model.traverse((child) => {
          if (child !== model) {
            totalObjects++;
            console.log(`Child ${totalObjects}: type=${child.type}, name=${child.name}, constructor=${child.constructor.name}`);
            // Accept any Object3D that's not the root model
            allObjects.push(child);
          }
        });
        
        console.log(`Found ${totalObjects} total objects in model`);
        
        if (totalObjects === 0) {
          console.warn("No objects found in model - showing model itself");
          // Show the model itself as a single entry
          setTreeData([{
            id: model.uuid,
            name: model.name || "IFC Model",
            count: 1,
            type: "IFCModel",
            level: 0,
            children: []
          }]);
          setVisibleNodes(new Set([model.uuid]));
          return;
        }
        
        // Group elements by IFC type
        const elementsByType = new Map<string, any[]>();
        
        // Try to get model ID from the model
        const modelID = (model as any).modelID ?? 0;
        console.log("Model ID:", modelID);
        
        for (let i = 0; i < allObjects.length; i++) {
          const obj = allObjects[i];
          let ifcType = "IfcBuildingElement";
          let elementName = `Element ${i + 1}`;
          
          try {
            // Check if object has expressID
            const expressID = obj.userData?.expressID;
            
            if (expressID !== undefined && ifcLoader) {
              // Try to get IFC properties using the loader
              try {
                const props = await ifcLoader.ifcManager.getItemProperties(modelID, expressID);
                
                if (props && props.type !== undefined) {
                  // Get the type name from the type number
                  const typeName = await ifcLoader.ifcManager.getIfcType(modelID, expressID);
                  if (typeName) {
                    ifcType = typeName;
                  }
                }
                
                // Try to get name property
                if (props && props.Name) {
                  elementName = props.Name.value || elementName;
                }
              } catch (propError) {
                console.warn(`Could not get properties for expressID ${expressID}:`, propError);
              }
            }
            
            // Fallback: try to extract from object name or type
            if (ifcType === "IfcBuildingElement") {
              if (obj.name && obj.name.includes('Ifc')) {
                const match = obj.name.match(/(Ifc[A-Za-z]+)/);
                if (match) {
                  ifcType = match[1];
                }
              } else if (obj.type) {
                // Use the Three.js type as a fallback
                ifcType = obj.type;
              }
            }
          } catch (error) {
            console.warn(`Error processing object ${i}:`, error);
          }
          
          // Add to grouped elements
          if (!elementsByType.has(ifcType)) {
            elementsByType.set(ifcType, []);
          }
          
          const typeElements = elementsByType.get(ifcType)!;
          elementName = obj.name || `${ifcType} ${typeElements.length + 1}`;
          
          typeElements.push({
            id: obj.uuid,
            name: elementName,
            object: obj,
            expressID: obj.userData?.expressID,
            level: 1
          });
        }
        
        // Convert to tree structure with parent nodes
        const nodes: any[] = [];
        const visibleSet = new Set<string>();
        
        for (const [typeName, elements] of elementsByType.entries()) {
          const typeId = `type-${typeName}`;
          
          // Mark all nodes as visible initially
          visibleSet.add(typeId);
          elements.forEach(el => visibleSet.add(el.id));
          
          nodes.push({
            id: typeId,
            name: typeName,
            count: elements.length,
            type: typeName,
            level: 0,
            children: elements
          });
        }
        
        // Sort parent nodes alphabetically
        nodes.sort((a, b) => a.type.localeCompare(b.type));
        
        console.log("Tree structure:", {
          types: nodes.length,
          totalElements: totalObjects,
          typeNames: Array.from(elementsByType.keys())
        });
        
        setTreeData(nodes);
        setVisibleNodes(visibleSet);
      } catch (error) {
        console.error("Error building IFC tree:", error);
        setTreeData([{
          id: "error-node",
          name: "Error loading model structure",
          count: 0,
          type: "Error",
          level: 0,
          children: []
        }]);
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
    
    // Toggle visibility for this node and all its children
    if (isVisible) {
      newVisible.delete(node.id);
      if (node.children) {
        node.children.forEach((child: any) => {
          newVisible.delete(child.id);
          if (child.object) {
            child.object.visible = false;
          }
        });
      }
    } else {
      newVisible.add(node.id);
      if (node.children) {
        node.children.forEach((child: any) => {
          newVisible.add(child.id);
          if (child.object) {
            child.object.visible = true;
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
          className="flex items-center gap-2 px-3 py-2 hover:bg-accent/50 cursor-pointer transition-colors group"
          style={{ paddingLeft: `${level * 16 + 12}px` }}
        >
          <div 
            className="flex items-center gap-2 flex-1 min-w-0"
            onClick={() => hasChildren && toggleNode(node.id)}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )
            ) : (
              <Box className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-sm font-medium text-foreground truncate">
                {node.name}
              </span>
              {node.count !== undefined && (
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  ({node.count})
                </span>
              )}
            </div>
          </div>
          <button
            onClick={(e) => toggleVisibility(node, e)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent rounded flex-shrink-0"
            title={isVisible ? "Hide" : "Show"}
          >
            {isVisible ? (
              <Eye className="h-4 w-4 text-luxury-gold" />
            ) : (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
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
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-border/30">
        <h3 className="text-[11px] font-semibold text-foreground uppercase tracking-wider">Object Tree</h3>
      </div>
      <ScrollArea className="flex-1">
        {treeData.length > 0 ? (
          <div className="py-2">
            {treeData.map((node) => renderNode(node))}
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-sm text-muted-foreground">No model loaded</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Upload an IFC file to view the structure</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
