import { useState, useEffect } from "react";
import * as THREE from "three";
import { IFCLoader } from "web-ifc-three/IFCLoader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, ChevronDown, Box } from "lucide-react";

interface ObjectTreeProps {
  model: THREE.Object3D | null;
  ifcLoader: IFCLoader | null;
}

export const ObjectTree = ({ model, ifcLoader }: ObjectTreeProps) => {
  const [treeData, setTreeData] = useState<any[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!model || !ifcLoader) {
      setTreeData([]);
      return;
    }

    const buildTree = async () => {
      console.log("Building tree from IFC model");
      const nodes: any[] = [];
      
      try {
        const modelID = (model as any).modelID || 0;
        
        // Get all spatial structure elements
        const spatialStructure = await ifcLoader.ifcManager.getSpatialStructure(modelID);
        
        console.log("Spatial structure:", spatialStructure);
        
        // Flatten structure for display
        const flattenNode = (node: any, level: number = 0) => {
          if (!node) return;
          
          nodes.push({
            id: node.expressID?.toString() || Math.random().toString(),
            name: node.Name?.value || node.type || `Element ${node.expressID}`,
            type: node.type || "Unknown",
            level,
            children: node.children || []
          });
          
          if (node.children && node.children.length > 0) {
            node.children.forEach((child: any) => flattenNode(child, level + 1));
          }
        };
        
        flattenNode(spatialStructure);
        
        console.log("Tree nodes created:", nodes.length);
        setTreeData(nodes);
      } catch (error) {
        console.error("Error building IFC tree:", error);
        // Fallback: show basic model info
        nodes.push({
          id: "model",
          name: "IFC Model",
          type: "Model",
          level: 0,
          children: []
        });
        setTreeData(nodes);
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

  const renderNode = (node: any) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const level = node.level || 0;

    return (
      <div key={node.id}>
        <div
          className="flex items-center gap-2 px-3 py-2 hover:bg-accent/50 cursor-pointer transition-colors"
          style={{ paddingLeft: `${level * 16 + 12}px` }}
          onClick={() => hasChildren && toggleNode(node.id)}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )
          ) : (
            <Box className="h-4 w-4 text-muted-foreground" />
          )}
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-medium text-foreground truncate">
              {node.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {node.type}
            </span>
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
