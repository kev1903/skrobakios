
import { useRef, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Grid, Box, Cylinder, Plane } from "@react-three/drei";
import { Mesh, BoxGeometry, CylinderGeometry, PlaneGeometry } from "three";
import * as THREE from "three";

interface IFCModelViewerProps {
  modelId: string;
  className?: string;
}

// Mock IFC Building Component - represents a simplified building structure
const MockIFCBuilding = () => {
  const buildingRef = useRef<THREE.Group>(null);

  return (
    <group ref={buildingRef} position={[0, 0, 0]}>
      {/* Foundation */}
      <Box
        args={[20, 0.5, 12]}
        position={[0, -0.25, 0]}
        material-color="#8B7355"
        castShadow
        receiveShadow
      />
      
      {/* Main Structure - Walls */}
      <Box
        args={[0.3, 4, 12]}
        position={[-10, 2, 0]}
        material-color="#E8E8E8"
        castShadow
        receiveShadow
      />
      <Box
        args={[0.3, 4, 12]}
        position={[10, 2, 0]}
        material-color="#E8E8E8"
        castShadow
        receiveShadow
      />
      <Box
        args={[20, 4, 0.3]}
        position={[0, 2, -6]}
        material-color="#E8E8E8"
        castShadow
        receiveShadow
      />
      <Box
        args={[20, 4, 0.3]}
        position={[0, 2, 6]}
        material-color="#E8E8E8"
        castShadow
        receiveShadow
      />

      {/* Internal Walls */}
      <Box
        args={[0.2, 4, 8]}
        position={[0, 2, -2]}
        material-color="#F0F0F0"
        castShadow
        receiveShadow
      />
      <Box
        args={[8, 4, 0.2]}
        position={[-6, 2, 2]}
        material-color="#F0F0F0"
        castShadow
        receiveShadow
      />

      {/* Roof Structure */}
      <Box
        args={[20.5, 0.3, 12.5]}
        position={[0, 4.5, 0]}
        material-color="#A0522D"
        castShadow
        receiveShadow
      />

      {/* Roof Beams */}
      {Array.from({ length: 5 }, (_, i) => (
        <Box
          key={i}
          args={[0.2, 0.4, 12]}
          position={[-8 + i * 4, 4.8, 0]}
          material-color="#8B4513"
          castShadow
        />
      ))}

      {/* Columns */}
      <Cylinder
        args={[0.3, 0.3, 4]}
        position={[-8, 2, -4]}
        material-color="#B0B0B0"
        castShadow
        receiveShadow
      />
      <Cylinder
        args={[0.3, 0.3, 4]}
        position={[8, 2, -4]}
        material-color="#B0B0B0"
        castShadow
        receiveShadow
      />
      <Cylinder
        args={[0.3, 0.3, 4]}
        position={[-8, 2, 4]}
        material-color="#B0B0B0"
        castShadow
        receiveShadow
      />
      <Cylinder
        args={[0.3, 0.3, 4]}
        position={[8, 2, 4]}
        material-color="#B0B0B0"
        castShadow
        receiveShadow
      />

      {/* Windows */}
      <Box
        args={[0.1, 2, 1.5]}
        position={[-10.1, 2.5, -3]}
        material-color="#87CEEB"
        material-transparent
        material-opacity={0.7}
      />
      <Box
        args={[0.1, 2, 1.5]}
        position={[-10.1, 2.5, 3]}
        material-color="#87CEEB"
        material-transparent
        material-opacity={0.7}
      />
      <Box
        args={[0.1, 2, 1.5]}
        position={[10.1, 2.5, -3]}
        material-color="#87CEEB"
        material-transparent
        material-opacity={0.7}
      />
      <Box
        args={[0.1, 2, 1.5]}
        position={[10.1, 2.5, 3]}
        material-color="#87CEEB"
        material-transparent
        material-opacity={0.7}
      />

      {/* Door */}
      <Box
        args={[1.2, 3, 0.1]}
        position={[0, 1.5, 6.1]}
        material-color="#8B4513"
      />
    </group>
  );
};

export const IFCModelViewer = ({ modelId, className }: IFCModelViewerProps) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [modelId]);

  if (isLoading) {
    return (
      <div className={`${className} flex items-center justify-center bg-slate-100`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading IFC Model...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Canvas
        shadows
        camera={{ position: [25, 15, 25], fov: 60 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: 'linear-gradient(to bottom, #87CEEB 0%, #E0F6FF 50%, #F0F8FF 100%)' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[20, 20, 10]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />
        <directionalLight
          position={[-10, 10, -10]}
          intensity={0.3}
        />

        {/* Environment */}
        <Environment preset="city" />
        
        {/* Ground Grid */}
        <Grid
          args={[50, 50]}
          position={[0, -0.5, 0]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#D3D3D3"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#A9A9A9"
          fadeDistance={30}
          fadeStrength={1}
        />

        {/* Ground Plane for shadows */}
        <Plane
          args={[100, 100]}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.51, 0]}
          receiveShadow
          material-color="#F5F5F5"
        />

        {/* IFC Building Model */}
        <MockIFCBuilding />

        {/* Orbit Controls for navigation */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={100}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
          autoRotate={false}
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
};
