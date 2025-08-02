import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Building component for creating architectural structures
const Building = ({ position, height = 2, color = "#f5f5f5", ...props }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Subtle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  return (
    <mesh ref={meshRef} position={position} {...props}>
      <boxGeometry args={[1, height, 1]} />
      <meshLambertMaterial color={color} />
    </mesh>
  );
};

// Tree component for landscaping
const Tree = ({ position, ...props }) => {
  const trunkRef = useRef<THREE.Mesh>(null);
  const leavesRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (leavesRef.current) {
      // Gentle swaying animation
      leavesRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
    }
  });

  return (
    <group position={position} {...props}>
      {/* Trunk */}
      <mesh ref={trunkRef} position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.05, 0.08, 0.6]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      {/* Leaves */}
      <mesh ref={leavesRef} position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.25]} />
        <meshLambertMaterial color="#228B22" />
      </mesh>
    </group>
  );
};

// Ground plane
const Ground = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry args={[20, 20]} />
      <meshLambertMaterial color="#f8f8f8" />
    </mesh>
  );
};

// Main scene composition
const Scene = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      // Slow rotation of the entire scene
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <Ground />
      
      {/* Main building complex */}
      <Building position={[0, 0, 0]} height={3} color="#e8e8e8" />
      <Building position={[1.5, 0, 0]} height={2.5} color="#f0f0f0" />
      <Building position={[-1.5, 0, 0]} height={2} color="#f5f5f5" />
      
      {/* Secondary buildings */}
      <Building position={[3, 0, -2]} height={1.5} color="#eeeeee" />
      <Building position={[-3, 0, -2]} height={1.8} color="#f2f2f2" />
      <Building position={[0, 0, -4]} height={4} color="#e5e5e5" />
      
      {/* Smaller structures */}
      <Building position={[2, 0, 2]} height={1} color="#f8f8f8" />
      <Building position={[-2, 0, 2]} height={1.2} color="#f6f6f6" />
      
      {/* Trees for landscaping */}
      <Tree position={[2.5, 0, 1]} />
      <Tree position={[-2.5, 0, 1]} />
      <Tree position={[4, 0, -1]} />
      <Tree position={[-4, 0, -1]} />
      <Tree position={[1, 0, 3]} />
      <Tree position={[-1, 0, 3]} />
    </group>
  );
};

// Loading fallback
const Loader = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-muted-foreground/20 border-t-foreground rounded-full animate-spin" />
  </div>
);

interface Architectural3DSceneProps {
  className?: string;
}

export const Architectural3DScene: React.FC<Architectural3DSceneProps> = ({ className = "" }) => {
  return (
    <div className={`relative ${className}`}>
      <Canvas>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[8, 6, 8]} fov={45} />
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            enableRotate={true}
            autoRotate={true}
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI / 2.2}
            minPolarAngle={Math.PI / 4}
          />
          
          {/* Lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={0.8}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-10, 10, -10]} intensity={0.3} />
          
          {/* Environment */}
          <Environment preset="city" />
          
          <Scene />
        </Suspense>
      </Canvas>
      <Suspense fallback={<Loader />}>
        {/* Additional loading state if needed */}
      </Suspense>
    </div>
  );
};