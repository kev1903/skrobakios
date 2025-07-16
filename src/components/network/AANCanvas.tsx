import React, { useState, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import { NetworkNode3D } from './NetworkNode3D';
import { NetworkConnection3D } from './NetworkConnection3D';
import { ProjectCore3D } from './ProjectCore3D';
import { useProjectNetwork, NetworkNode, NetworkDependency } from '@/hooks/useProjectNetwork';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface AANCanvasProps {
  projectId: string;
  onNodeSelect: (node: NetworkNode | null) => void;
  selectedNode: NetworkNode | null;
}

export const AANCanvas: React.FC<AANCanvasProps> = ({
  projectId,
  onNodeSelect,
  selectedNode,
}) => {
  const { nodes, dependencies, isLoading, error, updateNode } = useProjectNetwork(projectId);
  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);
  const controlsRef = useRef<any>();

  const handleNodeClick = (node: NetworkNode) => {
    onNodeSelect(node.id === selectedNode?.id ? null : node);
  };

  const handleNodeDrag = async (nodeId: string, position: [number, number, number]) => {
    await updateNode(nodeId, {
      position_x: position[0],
      position_y: position[1],
      position_z: position[2],
    });
  };

  const handleConnectionClick = (dependency: NetworkDependency) => {
    console.log('Connection clicked:', dependency);
    // Could open a dependency editor modal here
  };

  const calculateProjectProgress = () => {
    if (nodes.length === 0) return 0;
    const totalProgress = nodes.reduce((sum, node) => sum + node.progress_percentage, 0);
    return totalProgress / nodes.length;
  };

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="h-full w-full relative bg-gradient-to-br from-slate-900 to-slate-800">
      <Canvas
        camera={{ 
          position: [0, 10, 20], 
          fov: 60,
          near: 0.1,
          far: 1000
        }}
        dpr={[1, 2]}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.3} color="#ffffff" />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            color="#ffffff"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[0, 0, 0]} intensity={0.5} color="#3b82f6" />

          {/* Environment */}
          <Environment preset="night" />
          <Stars
            radius={300}
            depth={50}
            count={1000}
            factor={10}
            saturation={0}
            fade
            speed={0.5}
          />

          {/* Project Core - Central orb representing project health */}
          <ProjectCore3D 
            progress={calculateProjectProgress()}
            status={nodes.some(n => n.status === 'delayed') ? 'delayed' : 
                   nodes.some(n => n.status === 'in_progress') ? 'active' : 'pending'}
            pulse={true}
          />

          {/* Network Nodes */}
          {nodes.map((node) => (
            <NetworkNode3D
              key={node.id}
              node={node}
              onNodeClick={handleNodeClick}
              onNodeDrag={handleNodeDrag}
              isSelected={selectedNode?.id === node.id}
            />
          ))}

          {/* Network Connections */}
          {dependencies.map((dependency) => {
            const predecessorNode = nodes.find(n => n.id === dependency.predecessor_node_id);
            const successorNode = nodes.find(n => n.id === dependency.successor_node_id);
            
            if (!predecessorNode || !successorNode) return null;

            return (
              <NetworkConnection3D
                key={dependency.id}
                dependency={dependency}
                predecessorNode={predecessorNode}
                successorNode={successorNode}
                onConnectionClick={handleConnectionClick}
              />
            );
          })}

          {/* Controls */}
          <OrbitControls
            ref={controlsRef}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={100}
            autoRotate={false}
            autoRotateSpeed={0.5}
            dampingFactor={0.05}
            enableDamping={true}
          />
        </Suspense>
      </Canvas>

      {/* Overlay Information */}
      <div className="absolute top-4 left-4 bg-black/30 backdrop-blur-sm rounded-lg p-4 text-white">
        <div className="text-sm font-medium mb-2">Network Statistics</div>
        <div className="space-y-1 text-xs">
          <div>Nodes: {nodes.length}</div>
          <div>Dependencies: {dependencies.length}</div>
          <div>Progress: {Math.round(calculateProjectProgress())}%</div>
          <div>
            Status: {nodes.filter(n => n.status === 'completed').length} completed,{' '}
            {nodes.filter(n => n.status === 'in_progress').length} active,{' '}
            {nodes.filter(n => n.status === 'pending').length} pending
          </div>
        </div>
      </div>

      {/* Controls Help */}
      <div className="absolute bottom-4 left-4 bg-black/30 backdrop-blur-sm rounded-lg p-3 text-white text-xs">
        <div className="font-medium mb-1">Controls</div>
        <div>Mouse: Rotate view</div>
        <div>Scroll: Zoom in/out</div>
        <div>Drag nodes: Reposition</div>
        <div>Click: Select/deselect</div>
      </div>

      {/* Selected Node Info */}
      {selectedNode && (
        <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm rounded-lg p-4 text-white max-w-xs">
          <div className="text-sm font-medium mb-2">{selectedNode.task_name}</div>
          <div className="space-y-1 text-xs">
            <div>Duration: {selectedNode.duration_days} days</div>
            <div>Progress: {selectedNode.progress_percentage}%</div>
            <div>Status: {selectedNode.status}</div>
            {selectedNode.description && (
              <div className="mt-2 text-gray-300">{selectedNode.description}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};