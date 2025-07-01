
import { useRef, useEffect, useState, Suspense } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as THREE from "three";

interface UltraLightBIMViewerProps {
  modelId: string;
  className?: string;
  performanceMode?: boolean;
  modelFile?: File | null;
}

// Component to load and display uploaded 3D model
const UploadedModel = ({ modelFile }: { modelFile: File }) => {
  const [modelUrl, setModelUrl] = useState<string>("");

  useEffect(() => {
    if (modelFile) {
      const url = URL.createObjectURL(modelFile);
      setModelUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [modelFile]);

  try {
    if (!modelUrl) return null;
    
    const gltf = useLoader(GLTFLoader, modelUrl);
    
    // Scale and position the model
    const model = gltf.scene.clone();
    model.scale.setScalar(1);
    model.position.set(0, 0, 0);
    
    return <primitive object={model} />;
  } catch (error) {
    console.error("Error loading model:", error);
    return null;
  }
};

const SimpleLoadingFallback = () => (
  <div className="flex items-center justify-center h-full bg-gray-50">
    <div className="text-center">
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
      <p className="text-sm text-gray-600">Loading...</p>
    </div>
  </div>
);

const NoModelPlaceholder = () => (
  <div className="flex items-center justify-center h-full bg-gray-50">
    <div className="text-center">
      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
        <div className="w-8 h-8 border-2 border-gray-400 border-dashed rounded"></div>
      </div>
      <p className="text-gray-600">No model uploaded</p>
      <p className="text-sm text-gray-500">Upload a 3D model to view it here</p>
    </div>
  </div>
);

export const UltraLightBIMViewer = ({ 
  modelId, 
  className, 
  performanceMode = true, 
  modelFile 
}: UltraLightBIMViewerProps) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [modelId, modelFile]);

  if (isLoading) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-50`}>
        <SimpleLoadingFallback />
      </div>
    );
  }

  // Show placeholder if no model is uploaded
  if (!modelFile) {
    return (
      <div className={className}>
        <NoModelPlaceholder />
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
          <directionalLight position={[5, 5, 5]} intensity={0.4} />
          
          {/* Simple ground plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <planeGeometry args={[20, 20]} />
            <meshBasicMaterial color="#f1f5f9" />
          </mesh>

          {/* Uploaded model */}
          <UploadedModel modelFile={modelFile} />

          {/* Basic controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={30}
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
