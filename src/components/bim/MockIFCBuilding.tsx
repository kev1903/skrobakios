
import { useRef } from "react";
import { Box, Cylinder } from "@react-three/drei";
import * as THREE from "three";

export const MockIFCBuilding = () => {
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
