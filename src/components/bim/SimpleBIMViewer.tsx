
import { useRef, useEffect, useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Box, Plane } from "@react-three/drei";
import * as THREE from "three";

interface SimpleBIMViewerProps {
  modelId: string;
  className?: string;
  performanceMode?: boolean;
}

// Lightweight Building Component
const SimpleBuilding = ({ performanceMode = false }: { performanceMode?: boolean }) => {
  const buildingRef = useRef<THREE.Group>(null);

  return (
    <group ref={buildingRef} position={[0, 0, 0]}>
      {/* Foundation */}
      <Box
        args={[15, 0.3, 10]}
        position={[0, -0.15, 0]}
        material-color="#A0A0A0"
      />
      
      {/* Main Walls - Simplified */}
      <Box
        args={[0.2, 3, 10]}
        position={[-7.5, 1.5, 0]}
        material-color="#E0E0E0"
      />
      <Box
        args={[0.2, 3, 10]}
        position={[7.5, 1.5, 0]}
        material-color="#E0E0E0"
      />
      <Box
        args={[15, 3, 0.2]}
        position={[0, 1.5, -5]}
        material-color="#E0E0E0"
      />
      <Box
        args={[15, 3, 0.2]}
        position={[0, 1.5, 5]}
        material-color="#E0E0E0"
      />

      {/* Roof */}
      <Box
        args={[15.5, 0.2, 10.5]}
        position={[0, 3.2, 0]}
        material-color="#8B4513"
      />

      {!performanceMode && (
        <>
          {/* Windows - Only in normal mode */}
          <Box
            args={[0.05, 1.5, 1]}
            position={[-7.55, 2, -2]}
            material-color="#87CEEB"
            material-transparent
            material-opacity={0.6}
          />
          <Box
            args={[0.05, 1.5, 1]}
            position={[7.55, 2, -2]}
            material-color="#87CEEB"
            material-transparent
            material-opacity={0.6}
          />

          {/* Door */}
          <Box
            args={[1, 2.5, 0.05]}
            position={[0, 1.25, 5.05]}
            material-color="#8B4513"
          />
        </>
      )}
    </group>
  );
};

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
      <p className="text-sm text-slate-600">Loading 3D Model...</p>
    </div>
  </div>
);

export const SimpleBIMViewer = ({ modelId, className, performanceMode = false }: SimpleBIMViewerProps) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [modelId]);

  if (isLoading) {
    return (
      <div className={`${className} flex items-center justify-center bg-slate-50`}>
        <LoadingFallback />
      </div>
    );
  }

  return (
    <div className={className}>
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          shadows={!performanceMode}
          camera={{ position: [20, 12, 20], fov: 50 }}
          gl={{ 
            antialias: !performanceMode, 
            alpha: false,
            powerPreference: "high-performance"
          }}
          style={{ background: 'linear-gradient(to bottom, #e0f2fe 0%, #f8fafc 100%)' }}
          performance={{ min: 0.5 }}
        >
          {/* Simplified Lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={0.8}
            castShadow={!performanceMode}
            shadow-mapSize-width={performanceMode ? 512 : 1024}
            shadow-mapSize-height={performanceMode ? 512 : 1024}
          />

          {/* Ground Plane */}
          <Plane
            args={[50, 50]}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.2, 0]}
            receiveShadow={!performanceMode}
            material-color="#f1f5f9"
          />

          {/* Simple Grid Lines */}
          {!performanceMode && (
            <gridHelper args={[30, 10, "#cbd5e1", "#e2e8f0"]} position={[0, -0.1, 0]} />
          )}

          {/* Building Model */}
          <SimpleBuilding performanceMode={performanceMode} />

          {/* Orbit Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={8}
            maxDistance={50}
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 2.2}
            enableDamping={true}
            dampingFactor={0.1}
          />
        </Canvas>
      </Suspense>
    </div>
  );
};
