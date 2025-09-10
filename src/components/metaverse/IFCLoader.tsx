import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { formatCurrency } from '@/utils/formatters';

interface IFCLoaderProps {
  url?: string;
  position: [number, number, number];
  scale?: number;
  onClick?: () => void;
  project: {
    id: string;
    name: string;
    status: string;
    contract_price?: string;
  };
}

// Mock IFC Building Component (since web-ifc would need special setup)
export function IFCBuilding({ url, position, scale = 1, onClick, project }: IFCLoaderProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useFrame((state) => {
    if (meshRef.current && hovered) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  if (loading) {
    return (
      <group position={position}>
        <Html center>
          <div className="bg-background/80 p-2 rounded text-xs text-foreground">
            Loading IFC Model...
          </div>
        </Html>
      </group>
    );
  }

  if (error) {
    return (
      <group position={position}>
        <Html center>
          <div className="bg-red-500/80 p-2 rounded text-xs text-white">
            Error loading model
          </div>
        </Html>
      </group>
    );
  }

  // Create a more complex building structure
  const buildingHeight = project.contract_price 
    ? Math.max(3, Math.min(15, parseFloat(project.contract_price) / 100000))
    : 5;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return '#10b981';
      case 'in_progress': return '#f59e0b';
      case 'pending': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <group
      ref={meshRef}
      position={position}
      scale={[scale, scale, scale]}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Main building structure */}
      <mesh position={[0, buildingHeight / 2, 0]}>
        <boxGeometry args={[2, buildingHeight, 2]} />
        <meshStandardMaterial 
          color={getStatusColor(project.status)}
          roughness={0.7}
          metalness={0.1}
          emissive={hovered ? getStatusColor(project.status) : '#000000'}
          emissiveIntensity={hovered ? 0.2 : 0}
        />
      </mesh>

      {/* Building details - windows */}
      {Array.from({ length: Math.floor(buildingHeight / 2) }, (_, i) => (
        <group key={i}>
          {/* Front windows */}
          <mesh position={[0.8, 1 + i * 2, 1.01]}>
            <boxGeometry args={[0.3, 0.4, 0.01]} />
            <meshStandardMaterial color="#87ceeb" transparent opacity={0.7} />
          </mesh>
          <mesh position={[-0.8, 1 + i * 2, 1.01]}>
            <boxGeometry args={[0.3, 0.4, 0.01]} />
            <meshStandardMaterial color="#87ceeb" transparent opacity={0.7} />
          </mesh>
          
          {/* Side windows */}
          <mesh position={[1.01, 1 + i * 2, 0.8]}>
            <boxGeometry args={[0.01, 0.4, 0.3]} />
            <meshStandardMaterial color="#87ceeb" transparent opacity={0.7} />
          </mesh>
          <mesh position={[1.01, 1 + i * 2, -0.8]}>
            <boxGeometry args={[0.01, 0.4, 0.3]} />
            <meshStandardMaterial color="#87ceeb" transparent opacity={0.7} />
          </mesh>
        </group>
      ))}

      {/* Roof */}
      <mesh position={[0, buildingHeight + 0.2, 0]}>
        <boxGeometry args={[2.2, 0.4, 2.2]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>

      {/* Foundation */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[2.5, 0.2, 2.5]} />
        <meshStandardMaterial color="#696969" />
      </mesh>

      {/* Project label */}
      <Html 
        position={[0, buildingHeight + 1.5, 0]}
        center
        distanceFactor={10}
      >
        <div className="bg-background/90 backdrop-blur-sm p-2 rounded-lg border border-border text-center min-w-[120px]">
          <div className="text-xs font-semibold text-foreground truncate">
            {project.name.substring(0, 20)}
          </div>
          <div className={`text-xs mt-1 px-2 py-1 rounded-full ${
            project.status.toLowerCase() === 'completed' ? 'bg-green-500/20 text-green-400' :
            project.status.toLowerCase() === 'in_progress' ? 'bg-orange-500/20 text-orange-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {project.status}
          </div>
           {project.contract_price && (
             <div className="text-xs text-muted-foreground mt-1">
               {formatCurrency(project.contract_price)}
             </div>
           )}
        </div>
      </Html>

      {/* Status indicator light */}
      <pointLight
        position={[0, buildingHeight + 0.5, 0]}
        color={getStatusColor(project.status)}
        intensity={hovered ? 2 : 1}
        distance={5}
      />
    </group>
  );
}

// Component for loading actual GLTF/GLB models if available
export function GLTFBuilding({ url, position, scale = 1, onClick, project }: IFCLoaderProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  let scene: THREE.Object3D | null = null;
  
  try {
    const gltf = useGLTF(url!);
    scene = gltf.scene;
  } catch (error) {
    console.error('Error loading GLTF model:', error);
    setLoadError('Failed to load model');
  }

  useFrame(() => {
    if (meshRef.current && hovered) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  if (loadError || !scene) {
    console.error('Error loading GLTF model:', loadError);
    return <IFCBuilding url={url} position={position} scale={scale} onClick={onClick} project={project} />;
  }

  return (
    <group
      ref={meshRef}
      position={position}
      scale={[scale, scale, scale]}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <primitive object={scene.clone()} />
      
      {/* Project info overlay */}
      <Html 
        position={[0, 3, 0]}
        center
        distanceFactor={10}
      >
        <div className="bg-background/90 backdrop-blur-sm p-2 rounded-lg border border-border text-center">
          <div className="text-xs font-semibold text-foreground">
            {project.name}
          </div>
          <div className="text-xs text-muted-foreground">
            3D Model Loaded
          </div>
        </div>
      </Html>
    </group>
  );
}

// Main IFC Loader component that chooses the appropriate loader
export function IFCLoader(props: IFCLoaderProps) {
  // If URL is provided and it's a GLTF/GLB file, use GLTFBuilding
  if (props.url && (props.url.endsWith('.gltf') || props.url.endsWith('.glb'))) {
    return <GLTFBuilding {...props} />;
  }
  
  // Otherwise, use the procedural IFC building
  return <IFCBuilding {...props} />;
}
