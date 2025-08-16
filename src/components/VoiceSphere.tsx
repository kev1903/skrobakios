import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';

// Custom shader material for the gradient sphere
const GradientMaterial = shaderMaterial(
  {
    time: 0,
    intensity: 1.0,
  },
  // Vertex shader
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform float time;
    
    void main() {
      vUv = uv;
      vPosition = position;
      
      // Add subtle vertex displacement for organic feel
      vec3 pos = position;
      pos += normal * sin(time * 2.0 + position.y * 5.0) * 0.02;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform float time;
    uniform float intensity;
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      // Create gradient from white to blue
      vec3 topColor = vec3(0.9, 0.95, 1.0);  // Light blue/white
      vec3 bottomColor = vec3(0.2, 0.5, 1.0); // Bright blue
      
      // Create gradient based on Y position
      float gradientFactor = (vPosition.y + 1.0) * 0.5;
      vec3 color = mix(bottomColor, topColor, gradientFactor);
      
      // Add pulsing effect
      float pulse = sin(time * 3.0) * 0.1 + 0.9;
      color *= pulse * intensity;
      
      // Add rim lighting effect
      vec3 viewDirection = normalize(cameraPosition - vPosition);
      vec3 normal = normalize(vPosition);
      float rimLight = 1.0 - max(0.0, dot(viewDirection, normal));
      rimLight = pow(rimLight, 2.0);
      color += rimLight * vec3(0.3, 0.6, 1.0) * 0.5;
      
      gl_FragColor = vec4(color, 0.9);
    }
  `
);

// Extend the JSX namespace to include our custom material
declare global {
  namespace JSX {
    interface IntrinsicElements {
      gradientMaterial: any;
    }
  }
}

extend({ GradientMaterial });

interface AnimatedSphereProps {
  intensity: number;
}

function AnimatedSphere({ intensity }: AnimatedSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.time = state.clock.elapsedTime;
      materialRef.current.intensity = intensity;
    }
    
    if (meshRef.current) {
      // Gentle rotation
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.x += 0.002;
      
      // Scale pulsing based on intensity
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05 * intensity;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]}>
      <gradientMaterial 
        ref={materialRef}
        transparent
        side={THREE.DoubleSide}
      />
    </Sphere>
  );
}

interface VoiceSphereProps {
  isListening?: boolean;
  isSpeaking?: boolean;
}

export function VoiceSphere({ isListening = false, isSpeaking = false }: VoiceSphereProps) {
  // Calculate intensity based on state
  const intensity = useMemo(() => {
    if (isSpeaking) return 1.5;
    if (isListening) return 1.2;
    return 1.0;
  }, [isListening, isSpeaking]);

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#4A90E2" />
        
        <AnimatedSphere intensity={intensity} />
      </Canvas>
    </div>
  );
}