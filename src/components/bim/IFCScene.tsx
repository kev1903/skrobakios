
import { Environment, Grid, Plane } from "@react-three/drei";
import { MockIFCBuilding } from "./MockIFCBuilding";

export const IFCScene = () => {
  return (
    <>
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
    </>
  );
};
