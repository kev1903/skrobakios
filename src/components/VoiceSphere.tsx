import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AnimatedSphereProps {
  intensity: number;
  audioLevel: number;
  isListening: boolean;
  isSpeaking: boolean;
}

function AnimatedSphere({ intensity, audioLevel, isListening, isSpeaking }: AnimatedSphereProps) {
  const groupRef = useRef<THREE.Group>(null);
  const innerSphereRef = useRef<THREE.Mesh>(null);
  const outerRingsRef = useRef<THREE.Mesh[]>([]);
  const particlesRef = useRef<THREE.Points>(null);

  // Create particles for the AI effect
  const particlesGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(200 * 3);
    const colors = new Float32Array(200 * 3);
    
    for (let i = 0; i < 200; i++) {
      const radius = 1.2 + Math.random() * 0.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Color variation
      colors[i * 3] = 0.2 + Math.random() * 0.8;     // Red
      colors[i * 3 + 1] = 0.4 + Math.random() * 0.6; // Green  
      colors[i * 3 + 2] = 1.0;                       // Blue
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    return geometry;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;
    
    // Main rotation
    groupRef.current.rotation.y += 0.002;
    
    // Inner sphere pulsing based on audio level
    if (innerSphereRef.current) {
      const baseScale = 1 + Math.sin(time * 3) * 0.02;
      const audioScale = isListening ? 1 + audioLevel * 0.3 : 1;
      const speakingScale = isSpeaking ? 1 + Math.sin(time * 8) * 0.1 : 1;
      
      const finalScale = baseScale * audioScale * speakingScale;
      innerSphereRef.current.scale.setScalar(finalScale);
      
      // Change opacity based on state
      if (innerSphereRef.current.material instanceof THREE.MeshPhongMaterial) {
        innerSphereRef.current.material.opacity = isListening ? 0.8 + audioLevel * 0.2 : 0.6;
      }
    }

    // Animate outer rings
    outerRingsRef.current.forEach((ring, index) => {
      if (ring) {
        const offset = index * 0.5;
        const ringScale = 1 + Math.sin(time * 2 + offset) * 0.05;
        const audioInfluence = isListening ? 1 + audioLevel * 0.2 : 1;
        
        ring.scale.setScalar(ringScale * audioInfluence);
        ring.rotation.x += 0.001 * (index + 1);
        ring.rotation.z += 0.002 * (index + 1);
        
        // Fade rings based on audio
        if (ring.material instanceof THREE.MeshPhongMaterial) {
          ring.material.opacity = (0.1 + audioLevel * 0.3) * (1 - index * 0.2);
        }
      }
    });

    // Animate particles
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        const index = i / 3;
        const baseRadius = 1.2 + (index % 10) * 0.08;
        const audioInfluence = isListening ? audioLevel * 0.5 : 0.1;
        const speakingInfluence = isSpeaking ? Math.sin(time * 10 + index) * 0.2 : 0;
        
        const radius = baseRadius + audioInfluence + speakingInfluence;
        const theta = time * 0.5 + index * 0.1;
        const phi = Math.sin(time * 0.3 + index * 0.05) * 0.5;
        
        positions[i] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i + 2] = radius * Math.cos(phi);
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      particlesRef.current.rotation.y += 0.001;
      
      // Adjust particle opacity based on state
      if (particlesRef.current.material instanceof THREE.PointsMaterial) {
        particlesRef.current.material.opacity = isListening 
          ? 0.6 + audioLevel * 0.4 
          : isSpeaking 
            ? 0.8 
            : 0.3;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main inner sphere */}
      <mesh ref={innerSphereRef}>
        <sphereGeometry args={[0.8, 64, 64]} />
        <meshPhongMaterial 
          color={isSpeaking ? "#10B981" : isListening ? "#3B82F6" : "#6366F1"}
          transparent
          opacity={0.8}
          shininess={100}
        />
      </mesh>

      {/* Outer rings */}
      {[0, 1, 2].map((index) => (
        <mesh 
          key={index}
          ref={(el) => {
            if (el) outerRingsRef.current[index] = el;
          }}
        >
          <ringGeometry args={[1.1 + index * 0.2, 1.3 + index * 0.2, 32]} />
          <meshPhongMaterial 
            color={isSpeaking ? "#34D399" : isListening ? "#60A5FA" : "#A78BFA"}
            transparent
            opacity={0.2 - index * 0.05}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Particles */}
      <points ref={particlesRef} geometry={particlesGeometry}>
        <pointsMaterial
          size={0.02}
          vertexColors
          transparent
          opacity={0.6}
          sizeAttenuation={true}
        />
      </points>
    </group>
  );
}

interface VoiceSphereProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  audioLevel?: number;
}

export function VoiceSphere({ 
  isListening = false, 
  isSpeaking = false, 
  audioLevel = 0 
}: VoiceSphereProps) {
  // Calculate intensity based on state
  const intensity = useMemo(() => {
    if (isSpeaking) return 1.8;
    if (isListening) return 1.2 + audioLevel;
    return 1.0;
  }, [isListening, isSpeaking, audioLevel]);

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
      >
        {/* Enhanced lighting setup */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3B82F6" />
        <pointLight position={[0, 0, 5]} intensity={0.6} color="#8B5CF6" />
        
        <AnimatedSphere 
          intensity={intensity} 
          audioLevel={audioLevel}
          isListening={isListening}
          isSpeaking={isSpeaking}
        />
      </Canvas>
      
      {/* Audio level visualization overlay */}
      {isListening && audioLevel > 0.1 && (
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping"
            style={{
              animationDuration: `${Math.max(0.5, 2 - audioLevel * 1.5)}s`,
              opacity: audioLevel * 0.6,
              transform: `scale(${1 + audioLevel * 0.2})`
            }}
          />
        </div>
      )}
      
      {/* Speaking visualization overlay */}
      {isSpeaking && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-pulse" />
          <div className="absolute inset-0 rounded-full border border-green-300 animate-ping opacity-50" />
        </div>
      )}
    </div>
  );
}