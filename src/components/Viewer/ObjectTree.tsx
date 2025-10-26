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

    const metaModels = (viewer.metaScene as any).metaModels || {};
    const metaModelIds = Object.keys(metaModels);
    const metaModel = metaModelIds.length > 0 ? metaModels[metaModelIds[0]] : null;

    if (!metaModel) {
      setTreeData([]);
      return;
    }

    const metaObjects = (metaModel as any).metaObjects || {};
    const rootNodes: any[] = [];

    Object.values(metaObjects).forEach((obj: any) => {
      if (!obj.parent) {
        rootNodes.push({
          id: obj.id,
          name: obj.name || obj.id,
          type: obj.type,
          children: [],
        });
      }
    });

    setTreeData(rootNodes);
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
          className="flex items-center gap-2 px-3 py-2 hover:bg-accent/30 cursor-pointer transition-colors"
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
          <span className="text-sm truncate">{node.name}</span>
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
      <div className="p-4 border-b border-border/30">
        <h3 className="text-sm font-semibold text-foreground">Object Tree</h3>
      </div>
      <ScrollArea className="flex-1">
        {treeData.length > 0 ? (
          <div className="py-2">
            {treeData.map((node) => renderNode(node))}
          </div>
        ) : (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No model loaded
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
