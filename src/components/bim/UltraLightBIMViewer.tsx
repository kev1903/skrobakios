
import { useRef, useEffect, useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface UltraLightBIMViewerProps {
  modelId: string;
  className?: string;
  performanceMode?: boolean;
}

// Extremely lightweight single-mesh building
const MinimalBuilding = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (!meshRef.current) return;

    // Create a single combined geometry for the entire building
    const geometry = new THREE.BoxGeometry(8, 2, 6);
    
    // Simple material with minimal features
    const material = new THREE.MeshBasicMaterial({ 
      color: 0xcccccc,
      transparent: false,
      fog: false
    });

    meshRef.current.geometry = geometry;
    meshRef.current.material = material;
  }, []);

  return (
    <mesh ref={meshRef} position={[0, 1, 0]}>
      <boxGeometry args={[8, 2, 6]} />
      <meshBasicMaterial color="#cccccc" />
    </mesh>
  );
};

const SimpleLoadingFallback = () => (
  <div className="flex items-center justify-center h-full bg-gray-50">
    <div className="text-center">
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
      <p className="text-sm text-gray-600">Loading...</p>
    </div>
  </div>
);

export const UltraLightBIMViewer = ({ modelId, className, performanceMode = true }: UltraLightBIMViewerProps) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [modelId]);

  if (isLoading) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-50`}>
        <SimpleLoadingFallback />
      </div>
    );
  }

  return (
    <div className={className}>
      <Suspense fallback={<SimpleLoadingFallback />}>
        <Canvas
          camera={{ position: [10, 6, 10], fov: 50 }}
          gl={{ 
            antialias: false,
            alpha: false,
            powerPreference: "low-power",
            stencil: false,
            depth: true
          }}
          style={{ background: '#f8fafc' }}
          frameloop="demand"
          performance={{ min: 0.9 }}
        >
          {/* Minimal lighting */}
          <ambientLight intensity={0.6} />
          
          {/* Simple ground plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <planeGeometry args={[20, 20]} />
            <meshBasicMaterial color="#f1f5f9" />
          </mesh>

          {/* Ultra-simple building */}
          <MinimalBuilding />

          {/* Basic controls */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            minDistance={8}
            maxDistance={20}
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 2.2}
            enableDamping={false}
            autoRotate={false}
            zoomSpeed={0.5}
            rotateSpeed={0.5}
          />
        </Canvas>
      </Suspense>
    </div>
  );
};
