import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, ChevronDown, Box } from "lucide-react";

interface ObjectTreeProps {
  model: any;
  viewer: any;
  nameProperty: string;
}

export const ObjectTree = ({ model, viewer, nameProperty }: ObjectTreeProps) => {
  const [treeData, setTreeData] = useState<any[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!model || !viewer) {
      setTreeData([]);
      return;
    }

    console.log("Building object tree from model:", model.id);

    // Get all entities from the model
    const entities = model.entities;
    if (!entities || Object.keys(entities).length === 0) {
      console.log("No entities found in model");
      setTreeData([]);
      return;
    }

    console.log("Found entities:", Object.keys(entities).length);

    // Build a simple flat tree of all objects
    const nodes: any[] = [];
    Object.values(entities).forEach((entity: any) => {
      if (entity && entity.id) {
        nodes.push({
          id: entity.id,
          name: entity.id,
          type: "Object",
          children: [],
        });
      }
    });

    console.log("Built tree with", nodes.length, "nodes");
    setTreeData(nodes);
  }, [model, viewer, nameProperty]);

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderNode = (node: any, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id}>
        <div
          className="flex items-center gap-2 px-4 py-2.5 hover:bg-accent/30 cursor-pointer transition-all duration-200 group"
          style={{ paddingLeft: `${level * 16 + 16}px` }}
          onClick={() => hasChildren && toggleNode(node.id)}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-luxury-gold transition-colors" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-luxury-gold transition-colors" />
            )
          ) : (
            <Box className="h-3.5 w-3.5 text-muted-foreground/60" />
          )}
          <span className="text-sm truncate group-hover:text-foreground transition-colors">{node.name}</span>
        </div>
        {isExpanded && hasChildren && (
          <div>
            {node.children.map((child: any) => renderNode(child, level + 1))}
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
