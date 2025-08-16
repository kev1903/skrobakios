import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AnimatedSphereProps {
  intensity: number;
}

function AnimatedSphere({ intensity }: AnimatedSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle rotation
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.x += 0.002;
      
      // Scale pulsing based on intensity
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05 * intensity;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshPhongMaterial 
        color="#4A90E2"
        transparent
        opacity={0.9}
        shininess={100}
      />
    </mesh>
  );
}

interface VoiceSphereProps {
  isListening?: boolean;
  isSpeaking?: boolean;
}

export function VoiceSphere({ isListening = false, isSpeaking = false }: VoiceSphereProps) {
  // Calculate intensity based on state
  const intensity = React.useMemo(() => {
    if (isSpeaking) return 1.5;
    if (isListening) return 1.2;
    return 1.0;
  }, [isListening, isSpeaking]);

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4A90E2" />
        
        <AnimatedSphere intensity={intensity} />
      </Canvas>
    </div>
  );
}