import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ArrowLeft, Plus, Save, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface BusinessMapPageProps {
  onNavigate: (page: string) => void;
}

// Initial business system nodes
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'default',
    position: { x: 250, y: 50 },
    data: { label: 'Customer Management' },
    style: { background: '#E3F2FD', border: '2px solid #2196F3', borderRadius: '8px' },
  },
  {
    id: '2',
    type: 'default',
    position: { x: 100, y: 200 },
    data: { label: 'Sales Pipeline' },
    style: { background: '#E8F5E8', border: '2px solid #4CAF50', borderRadius: '8px' },
  },
  {
    id: '3',
    type: 'default',
    position: { x: 400, y: 200 },
    data: { label: 'Project Management' },
    style: { background: '#FFF3E0', border: '2px solid #FF9800', borderRadius: '8px' },
  },
  {
    id: '4',
    type: 'default',
    position: { x: 250, y: 350 },
    data: { label: 'Financial System' },
    style: { background: '#F3E5F5', border: '2px solid #9C27B0', borderRadius: '8px' },
  },
  {
    id: '5',
    type: 'default',
    position: { x: 550, y: 100 },
    data: { label: 'Team Collaboration' },
    style: { background: '#FFEBEE', border: '2px solid #F44336', borderRadius: '8px' },
  },
];

// Initial connections between systems
const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', animated: true },
  { id: 'e1-3', source: '1', target: '3', type: 'smoothstep' },
  { id: 'e2-4', source: '2', target: '4', type: 'smoothstep', animated: true },
  { id: 'e3-4', source: '3', target: '4', type: 'smoothstep' },
  { id: 'e3-5', source: '3', target: '5', type: 'smoothstep' },
];

export const BusinessMapPage = ({ onNavigate }: BusinessMapPageProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeId, setNodeId] = useState(6);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const addNewNode = useCallback(() => {
    const newNode: Node = {
      id: `${nodeId}`,
      type: 'default',
      position: { x: Math.random() * 500 + 100, y: Math.random() * 400 + 100 },
      data: { label: `New System ${nodeId}` },
      style: { 
        background: '#F5F5F5', 
        border: '2px solid #757575', 
        borderRadius: '8px' 
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setNodeId((id) => id + 1);
    toast.success('New system node added');
  }, [nodeId, setNodes]);

  const saveMap = useCallback(() => {
    const mapData = { nodes, edges };
    localStorage.setItem('businessMap', JSON.stringify(mapData));
    toast.success('Business map saved successfully');
  }, [nodes, edges]);

  const exportMap = useCallback(() => {
    const mapData = { nodes, edges };
    const dataStr = JSON.stringify(mapData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'business-map.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast.success('Business map exported');
  }, [nodes, edges]);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('home')}
            className="hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Business Systems Map</h1>
            <p className="text-sm text-muted-foreground">Interactive visualization of your business ecosystem</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={addNewNode}
            className="hover:bg-muted"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add System
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={saveMap}
            className="hover:bg-muted"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportMap}
            className="hover:bg-muted"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          className="bg-background"
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
        >
          <Controls 
            className="bg-background border border-border rounded-lg shadow-lg"
            showZoom={true}
            showFitView={true}
            showInteractive={true}
          />
          <MiniMap 
            className="bg-background border border-border rounded-lg shadow-lg"
            nodeColor={(node) => {
              if (node.style?.background) {
                return node.style.background as string;
              }
              return '#e2e8f0';
            }}
            nodeStrokeWidth={2}
            zoomable
            pannable
          />
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={20} 
            size={1}
            className="text-muted-foreground/20"
          />
        </ReactFlow>
      </div>

      {/* Instructions Panel */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm border border-border rounded-lg p-4 max-w-sm shadow-lg">
        <h3 className="font-semibold text-sm text-foreground mb-2">How to use:</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Drag nodes to reposition systems</li>
          <li>• Connect nodes by dragging from connection points</li>
          <li>• Use controls to zoom and navigate</li>
          <li>• Add new systems with the "Add System" button</li>
          <li>• Save your progress or export the map</li>
        </ul>
      </div>
    </div>
  );
};