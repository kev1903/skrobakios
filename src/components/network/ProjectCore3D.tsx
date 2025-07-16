import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import { Mesh } from 'three';

interface ProjectCore3DProps {
  progress: number;
  status: 'pending' | 'active' | 'delayed' | 'completed';
  pulse: boolean;
}

export const ProjectCore3D: React.FC<ProjectCore3DProps> = ({
  progress,
  status,
  pulse,
}) => {
  const coreRef = useRef<Mesh>(null);
  const pulseRingRef = useRef<Mesh>(null);

  // Get color based on status
  const getCoreColor = () => {
    switch (status) {
      case 'completed': return '#10b981'; // green
      case 'active': return '#3b82f6'; // blue
      case 'delayed': return '#dc2626'; // red
      default: return '#6b7280'; // gray
    }
  };

  // Animate the core
  useFrame((state) => {
    if (coreRef.current) {
      // Rotate the core slowly
      coreRef.current.rotation.y += 0.005;
      coreRef.current.rotation.x += 0.002;

      if (pulse) {
        // Pulsing based on progress and status
        const baseScale = 1;
        const pulseAmount = status === 'delayed' ? 0.3 : 0.15;
        const pulseSpeed = status === 'delayed' ? 4 : 2;
        const scale = baseScale + Math.sin(state.clock.elapsedTime * pulseSpeed) * pulseAmount;
        coreRef.current.scale.setScalar(scale);
      }
    }

    if (pulseRingRef.current && pulse) {
      // Pulse rings radiating outward
      const time = state.clock.elapsedTime;
      const ringScale = 1 + (Math.sin(time * 2) + 1) * 2;
      pulseRingRef.current.scale.setScalar(ringScale);
      
      // Fade the ring as it expands
      const material = pulseRingRef.current.material as any;
      if (material) {
        material.opacity = Math.max(0, 0.3 - (ringScale - 1) * 0.1);
      }
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Main project core */}
      <Sphere ref={coreRef} args={[1.5, 32, 32]}>
        <meshStandardMaterial
          color={getCoreColor()}
          emissive={getCoreColor()}
          emissiveIntensity={0.4}
          metalness={0.3}
          roughness={0.2}
          transparent
          opacity={0.8}
        />
      </Sphere>

      {/* Progress ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry 
          args={[2, 2.2, 32, 1, 0, (progress / 100) * Math.PI * 2]} 
        />
        <meshBasicMaterial
          color="#10b981"
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Pulse ring */}
      {pulse && (
        <mesh ref={pulseRingRef} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.8, 2, 32]} />
          <meshBasicMaterial
            color={getCoreColor()}
            transparent
            opacity={0.3}
          />
        </mesh>
      )}

      {/* Inner glow */}
      <Sphere args={[2, 16, 16]}>
        <meshBasicMaterial
          color={getCoreColor()}
          transparent
          opacity={0.1}
        />
      </Sphere>

      {/* Outer glow for delayed status */}
      {status === 'delayed' && (
        <Sphere args={[3, 16, 16]}>
          <meshBasicMaterial
            color="#dc2626"
            transparent
            opacity={0.05}
          />
        </Sphere>
      )}
    </group>
  );
};