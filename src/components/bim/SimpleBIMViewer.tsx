import { useRef, useEffect, useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Box, Plane } from "@react-three/drei";

interface SimpleBIMViewerProps {
  modelId: string;
  className?: string;
  performanceMode?: boolean;
}

// Ultra-lightweight Building Component
const SimpleBuilding = ({ performanceMode = false }: { performanceMode?: boolean }) => {
  return (
    <group position={[0, 0, 0]}>
      {/* Foundation */}
      <Box
        args={[10, 0.2, 8]}
        position={[0, -0.1, 0]}
        material-color="#A0A0A0"
      />
      
      {/* Main Structure - Simplified to just 4 walls */}
      <Box
        args={[0.2, 2, 8]}
        position={[-5, 1, 0]}
        material-color="#E0E0E0"
      />
      <Box
        args={[0.2, 2, 8]}
        position={[5, 1, 0]}
        material-color="#E0E0E0"
      />
      <Box
        args={[10, 2, 0.2]}
        position={[0, 1, -4]}
        material-color="#E0E0E0"
      />
      <Box
        args={[10, 2, 0.2]}
        position={[0, 1, 4]}
        material-color="#E0E0E0"
      />

      {/* Simple Roof */}
      <Box
        args={[10.2, 0.1, 8.2]}
        position={[0, 2.1, 0]}
        material-color="#8B4513"
      />

      {/* Only add door in performance mode to keep it minimal */}
      {!performanceMode && (
        <Box
          args={[0.8, 1.8, 0.05]}
          position={[0, 0.9, 4.05]}
          material-color="#654321"
        />
      )}
    </group>
  );
};

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full bg-slate-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
      <p className="text-sm text-slate-600">Loading 3D Model...</p>
    </div>
  </div>
);

export const SimpleBIMViewer = ({ modelId, className, performanceMode = true }: SimpleBIMViewerProps) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Reduced loading time

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
          shadows={false} // Disable shadows completely for stability
          camera={{ position: [15, 8, 15], fov: 45 }}
          gl={{ 
            antialias: false, // Disable antialiasing for performance
            alpha: false,
            powerPreference: "default" // Use default instead of high-performance
          }}
          style={{ background: '#f8fafc' }}
          performance={{ min: 0.8 }} // Higher minimum performance threshold
          frameloop="demand" // Only render when needed
        >
          {/* Minimal Lighting */}
          <ambientLight intensity={0.8} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={0.5}
            castShadow={false}
          />

          {/* Simple Ground */}
          <Plane
            args={[30, 30]}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.2, 0]}
            material-color="#f1f5f9"
          />

          {/* Simple Building Model */}
          <SimpleBuilding performanceMode={performanceMode} />

          {/* Basic Orbit Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={30}
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 2.5}
            enableDamping={false} // Disable damping to reduce calculations
            autoRotate={false}
          />
        </Canvas>
      </Suspense>
    </div>
  );
};
