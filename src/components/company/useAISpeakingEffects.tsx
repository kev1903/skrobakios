import { useState, useEffect } from 'react';

export const useAISpeakingEffects = (isSpeaking: boolean) => {
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

  return {
    pulseIntensity,
    getGlowIntensity,
    getScaleIntensity
  };
};