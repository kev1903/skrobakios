import React, { useRef, useState } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Text, Sphere } from '@react-three/drei';
import { Mesh } from 'three';
import { NetworkNode } from '@/hooks/useProjectNetwork';

interface NetworkNode3DProps {
  node: NetworkNode;
  onNodeClick: (node: NetworkNode) => void;
  onNodeDrag: (nodeId: string, position: [number, number, number]) => void;
  isSelected: boolean;
}

export const NetworkNode3D: React.FC<NetworkNode3DProps> = ({
  node,
  onNodeClick,
  onNodeDrag,
  isSelected,
}) => {
  const meshRef = useRef<Mesh>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Calculate node size based on duration and progress
  const baseSize = 0.5;
  const sizeMultiplier = Math.max(0.5, Math.min(2, node.duration_days / 5));
  const nodeSize = baseSize * sizeMultiplier;

  // Calculate color based on progress and status
  const getNodeColor = () => {
    if (isSelected) return '#fbbf24'; // amber
    if (hovered) return '#60a5fa'; // blue
    
    const progress = node.progress_percentage / 100;
    if (node.status === 'completed') return '#10b981'; // green
    if (node.status === 'in_progress') {
      // Gradient from red to orange to green based on progress
      if (progress < 0.33) return '#ef4444'; // red
      if (progress < 0.66) return '#f97316'; // orange
      return '#eab308'; // yellow
    }
    if (node.status === 'delayed') return '#dc2626'; // dark red
    return node.color || '#6b7280'; // gray
  };

  // Animation for pulsing effect
  useFrame((state) => {
    if (meshRef.current && !isDragging) {
      // Gentle floating animation
      meshRef.current.position.y = node.position_y + Math.sin(state.clock.elapsedTime + node.position_x) * 0.1;
      
      // Pulsing for active nodes
      if (node.status === 'in_progress') {
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
        meshRef.current.scale.setScalar(pulse);
      }
    }
  });

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setIsDragging(true);
    (event.target as any).setPointerCapture(event.pointerId);
  };

  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    setIsDragging(false);
    (event.target as any).releasePointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (isDragging) {
      const newPosition: [number, number, number] = [
        event.point.x,
        event.point.y,
        event.point.z,
      ];
      onNodeDrag(node.id, newPosition);
    }
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (!isDragging) {
      onNodeClick(node);
    }
  };

  return (
    <group position={[node.position_x, node.position_y, node.position_z]}>
      {/* Main node sphere */}
      <Sphere
        ref={meshRef}
        args={[nodeSize, 32, 32]}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={handleClick}
      >
        <meshStandardMaterial
          color={getNodeColor()}
          emissive={isSelected ? '#422006' : hovered ? '#1e3a8a' : '#000000'}
          emissiveIntensity={isSelected ? 0.3 : hovered ? 0.2 : 0}
          metalness={0.1}
          roughness={0.4}
          transparent
          opacity={0.9}
        />
      </Sphere>

      {/* Progress ring */}
      {node.progress_percentage > 0 && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[nodeSize + 0.1, nodeSize + 0.15, 32]} />
          <meshBasicMaterial
            color="#10b981"
            transparent
            opacity={0.6}
          />
        </mesh>
      )}

      {/* Task name label */}
      <Text
        position={[0, nodeSize + 0.5, 0]}
        fontSize={0.3}
        color={hovered || isSelected ? '#ffffff' : '#e5e7eb'}
        anchorX="center"
        anchorY="middle"
        maxWidth={3}
        textAlign="center"
      >
        {node.task_name}
      </Text>

      {/* Duration label */}
      <Text
        position={[0, -nodeSize - 0.3, 0]}
        fontSize={0.2}
        color="#9ca3af"
        anchorX="center"
        anchorY="middle"
      >
        {node.duration_days}d
      </Text>

      {/* Progress percentage */}
      {node.progress_percentage > 0 && (
        <Text
          position={[0, 0, nodeSize + 0.1]}
          fontSize={0.25}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {Math.round(node.progress_percentage)}%
        </Text>
      )}

      {/* Critical path indicator */}
      {node.metadata?.isCritical && (
        <Sphere args={[nodeSize + 0.3, 16, 16]} position={[0, 0, 0]}>
          <meshBasicMaterial
            color="#dc2626"
            transparent
            opacity={0.2}
            wireframe
          />
        </Sphere>
      )}
    </group>
  );
};