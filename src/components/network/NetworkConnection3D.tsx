import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Text } from '@react-three/drei';
import { NetworkNode, NetworkDependency } from '@/hooks/useProjectNetwork';
import * as THREE from 'three';

interface NetworkConnection3DProps {
  dependency: NetworkDependency;
  predecessorNode: NetworkNode;
  successorNode: NetworkNode;
  onConnectionClick: (dependency: NetworkDependency) => void;
}

export const NetworkConnection3D: React.FC<NetworkConnection3DProps> = ({
  dependency,
  predecessorNode,
  successorNode,
  onConnectionClick,
}) => {
  const lineRef = useRef<any>(null);

  // Calculate connection path
  const connectionPath = useMemo(() => {
    const start = new THREE.Vector3(
      predecessorNode.position_x,
      predecessorNode.position_y,
      predecessorNode.position_z
    );
    
    const end = new THREE.Vector3(
      successorNode.position_x,
      successorNode.position_y,
      successorNode.position_z
    );

    // Create a slight curve for better visualization
    const mid1 = start.clone().lerp(end, 0.33);
    const mid2 = start.clone().lerp(end, 0.66);
    
    // Add some curve offset based on dependency type
    const offset = dependency.dependency_type === 'FS' ? 0.5 : 
                   dependency.dependency_type === 'SS' ? 0.3 :
                   dependency.dependency_type === 'FF' ? -0.3 : -0.5;
    
    mid1.y += offset;
    mid2.y += offset * 0.5;

    return [start, mid1, mid2, end];
  }, [predecessorNode, successorNode, dependency.dependency_type]);

  // Calculate connection color based on criticality and type
  const getConnectionColor = () => {
    const baseColor = dependency.criticality > 0.8 ? '#dc2626' : // high criticality - red
                      dependency.criticality > 0.5 ? '#f97316' : // medium criticality - orange
                      '#10b981'; // low criticality - green
    
    return baseColor;
  };

  // Calculate line width based on criticality
  const lineWidth = Math.max(0.02, dependency.criticality * 0.1);

  // Animate the connection with a flowing effect
  useFrame((state) => {
    if (lineRef.current) {
      const material = lineRef.current.material as THREE.LineBasicMaterial;
      if (material) {
        // Pulsing effect for critical connections
        if (dependency.criticality > 0.8) {
          const pulse = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.5;
          material.opacity = pulse;
        }
      }
    }
  });

  // Calculate midpoint for label
  const midpoint = useMemo(() => {
    const start = connectionPath[0];
    const end = connectionPath[connectionPath.length - 1];
    return start.clone().lerp(end, 0.5);
  }, [connectionPath]);

  // Dependency type labels
  const getDependencyTypeLabel = () => {
    switch (dependency.dependency_type) {
      case 'FS': return 'Finish-Start';
      case 'SS': return 'Start-Start';
      case 'FF': return 'Finish-Finish';
      case 'SF': return 'Start-Finish';
      default: return dependency.dependency_type;
    }
  };

  return (
    <group>
      {/* Main connection line */}
      <Line
        ref={lineRef}
        points={connectionPath}
        color={getConnectionColor()}
        lineWidth={lineWidth}
        transparent
        opacity={0.8}
        onClick={(e) => {
          e.stopPropagation();
          onConnectionClick(dependency);
        }}
      />

      {/* Glowing effect for critical connections */}
      {dependency.criticality > 0.7 && (
        <Line
          points={connectionPath}
          color={getConnectionColor()}
          lineWidth={lineWidth * 3}
          transparent
          opacity={0.2}
        />
      )}

      {/* Arrow head at the end */}
      <mesh 
        position={[
          connectionPath[connectionPath.length - 1].x,
          connectionPath[connectionPath.length - 1].y,
          connectionPath[connectionPath.length - 1].z
        ]}
      >
        <coneGeometry args={[0.1, 0.3, 8]} />
        <meshBasicMaterial color={getConnectionColor()} />
      </mesh>

      {/* Dependency type label */}
      <Text
        position={[midpoint.x, midpoint.y, midpoint.z]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {dependency.dependency_type}
        {dependency.lag_days > 0 && ` +${dependency.lag_days}d`}
      </Text>

      {/* Lag indicator */}
      {dependency.lag_days > 0 && (
        <mesh position={[midpoint.x, midpoint.y, midpoint.z]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
      )}

      {/* Critical path indicator */}
      {dependency.criticality > 0.8 && (
        <Text
          position={[midpoint.x, midpoint.y - 0.3, midpoint.z]}
          fontSize={0.12}
          color="#dc2626"
          anchorX="center"
          anchorY="middle"
        >
          CRITICAL
        </Text>
      )}
    </group>
  );
};