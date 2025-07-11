import React from 'react';

interface AISpeakingEffectsProps {
  isSpeaking: boolean;
  pulseIntensity: number;
  getGlowIntensity: () => number;
}

export const AISpeakingEffects = ({ isSpeaking, pulseIntensity, getGlowIntensity }: AISpeakingEffectsProps) => {
  if (!isSpeaking) return null;

  return (
    <>
      {/* Outer glow ring */}
      <div 
        className="absolute inset-0 rounded-full animate-pulse"
        style={{
          background: `radial-gradient(circle, rgba(59, 130, 246, ${getGlowIntensity()}) 0%, rgba(59, 130, 246, 0) 70%)`,
          filter: 'blur(20px)',
          transform: 'scale(2)',
        }}
      />
      
      {/* Inner glow ring */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, rgba(147, 197, 253, ${getGlowIntensity() * 0.6}) 0%, rgba(147, 197, 253, 0) 60%)`,
          filter: 'blur(10px)',
          transform: 'scale(1.5)',
        }}
      />

      {/* Particle effects */}
      <div className="absolute inset-0 overflow-hidden rounded-full">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-300 rounded-full animate-ping"
            style={{
              top: `${20 + Math.sin((pulseIntensity + i) * 0.5) * 30}%`,
              left: `${20 + Math.cos((pulseIntensity + i) * 0.5) * 30}%`,
              animationDelay: `${i * 0.2}s`,
              opacity: getGlowIntensity(),
            }}
          />
        ))}
      </div>
    </>
  );
};