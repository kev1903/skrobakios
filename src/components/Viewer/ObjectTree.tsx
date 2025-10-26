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

    const buildTree = () => {
      console.log("Building tree from IFC model");
      
      try {
        // Count all mesh children first
        let totalMeshes = 0;
        const allMeshes: THREE.Mesh[] = [];
        
        model.traverse((child) => {
          if (child !== model && child instanceof THREE.Mesh) {
            totalMeshes++;
            allMeshes.push(child);
          }
        });
        
        console.log(`Found ${totalMeshes} total meshes in model`);
        
        // Group elements by IFC type
        const elementsByType = new Map<string, any[]>();
        
        allMeshes.forEach((mesh, index) => {
          // Try to extract IFC type from various properties
          let ifcType = "IfcBuildingElement";
          
          // Check expressID which is commonly used by web-ifc
          if (mesh.userData?.expressID !== undefined) {
            // Check for IFC type in userData
            if (mesh.userData.ifcType) {
              ifcType = mesh.userData.ifcType;
            } else if (mesh.userData.type) {
              ifcType = mesh.userData.type;
            }
          }
          
          // Try to extract from mesh name
          if (mesh.name && mesh.name.includes('Ifc')) {
            const match = mesh.name.match(/(Ifc[A-Za-z]+)/);
            if (match) {
              ifcType = match[1];
            }
          }
          
          // Add to grouped elements
          if (!elementsByType.has(ifcType)) {
            elementsByType.set(ifcType, []);
          }
          
          elementsByType.get(ifcType)!.push({
            id: mesh.uuid,
            name: mesh.name || `${ifcType} ${elementsByType.get(ifcType)!.length + 1}`,
            object: mesh,
            level: 1
          });
        });
        
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
          totalElements: totalMeshes,
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
