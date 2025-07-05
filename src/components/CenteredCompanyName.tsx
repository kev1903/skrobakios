import React, { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';

interface CenteredCompanyNameProps {
  isSpeaking?: boolean;
  onNavigate: (page: string) => void;
}

export const CenteredCompanyName = ({ isSpeaking = false, onNavigate }: CenteredCompanyNameProps) => {
  const { userProfile } = useUser();
  const [pulseIntensity, setPulseIntensity] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isSpeaking) {
      // Create animated pulsing effect when AI is speaking
      interval = setInterval(() => {
        setPulseIntensity(prev => (prev + 0.1) % (Math.PI * 2));
      }, 50);
    } else {
      setPulseIntensity(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSpeaking]);

  const getGlowIntensity = () => {
    if (!isSpeaking) return 0;
    return 0.3 + Math.sin(pulseIntensity) * 0.2; // Oscillates between 0.1 and 0.5
  };

  const getScaleIntensity = () => {
    if (!isSpeaking) return 1;
    return 1 + Math.sin(pulseIntensity * 1.5) * 0.05; // Slight scale animation
  };

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
      <button
        onClick={() => onNavigate('home')}
        className="pointer-events-auto relative group"
        style={{
          transform: `scale(${getScaleIntensity()})`,
          transition: isSpeaking ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {/* AI Speaking Glow Effects */}
        {isSpeaking && (
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
        )}

        {/* Company Name */}
        <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-8 py-4 shadow-2xl hover:bg-white/15 transition-all duration-300">
          <h1 
            className="text-white font-bold text-3xl tracking-wide text-center whitespace-nowrap"
            style={{
              textShadow: isSpeaking 
                ? `0 0 ${10 + getGlowIntensity() * 20}px rgba(59, 130, 246, ${getGlowIntensity()})` 
                : '0 2px 4px rgba(0,0,0,0.3)',
              transition: isSpeaking ? 'none' : 'text-shadow 0.3s ease-out'
            }}
          >
            {userProfile.companyName || "Company Name"}
          </h1>
          
          {/* AI Status Indicator */}
          {isSpeaking && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <div className="flex items-center gap-1 bg-blue-500/20 backdrop-blur-sm rounded-full px-3 py-1 border border-blue-400/30">
                <div 
                  className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                  style={{ opacity: getGlowIntensity() }}
                />
                <span className="text-xs text-blue-200 font-medium">AI Speaking</span>
              </div>
            </div>
          )}

          {/* Hover effect hint */}
          <div className="absolute inset-0 rounded-2xl border border-white/0 group-hover:border-white/40 transition-all duration-300" />
        </div>
      </button>
    </div>
  );
};