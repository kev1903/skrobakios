
import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { IFCLoadingFallback } from "./IFCLoadingFallback";
import { IFCScene } from "./IFCScene";

interface IFCModelViewerProps {
  modelId: string;
  className?: string;
}

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
    return <IFCLoadingFallback className={className} />;
  }

  return (
    <div className={className}>
      <Canvas
        shadows
        camera={{ position: [25, 15, 25], fov: 60 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: 'linear-gradient(to bottom, #87CEEB 0%, #E0F6FF 50%, #F0F8FF 100%)' }}
      >
        <IFCScene />

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
