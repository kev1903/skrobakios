import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { AISpeakingEffects } from '@/components/company/AISpeakingEffects';
import { useAISpeakingEffects } from '@/components/company/useAISpeakingEffects';
import { cn } from '@/lib/utils';

interface VoiceSphereProps {
  isActive?: boolean;
  isSpeaking?: boolean;
  isListening?: boolean;
  onClick?: () => void;
  audioLevel?: number;
  className?: string;
}

export const VoiceSphere = ({ 
  isActive = false, 
  isSpeaking = false, 
  isListening = false, 
  onClick, 
  audioLevel = 0,
  className 
}: VoiceSphereProps) => {
  const { pulseIntensity, getGlowIntensity, getScaleIntensity } = useAISpeakingEffects(isSpeaking);

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center w-full h-full rounded-full transition-all duration-500 ease-out group",
        "bg-gradient-to-br from-green-400 via-green-500 to-green-600",
        onClick && "cursor-pointer hover:shadow-lg hover:scale-105 active:scale-95",
        onClick && "focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:ring-offset-2",
        (isActive || isListening) && "shadow-xl ring-2 ring-green-300/50",
        isSpeaking && "animate-pulse",
        className
      )}
      style={{
        transform: `scale(${getScaleIntensity()})`,
        boxShadow: isSpeaking 
          ? `0 0 ${20 + getGlowIntensity() * 30}px rgba(34, 197, 94, ${getGlowIntensity()})` 
          : "0 8px 25px rgba(34, 197, 94, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.6)"
      }}
      title={onClick ? (isActive ? "Stop Voice Chat" : "Start Voice Chat with SkAi") : undefined}
    >
      {/* AI Speaking Effects */}
      {isSpeaking && (
        <AISpeakingEffects 
          isSpeaking={isSpeaking}
          pulseIntensity={pulseIntensity}
          getGlowIntensity={getGlowIntensity}
        />
      )}

      {/* Inner glossy highlight */}
      <div 
        className="absolute inset-2 rounded-full opacity-60"
        style={{
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.3) 30%, transparent 70%)"
        }}
      />

      {/* Background glow when listening */}
      {isListening && !isSpeaking && (
        <div className="absolute inset-0 rounded-full bg-green-300/30 animate-pulse" />
      )}

      {/* Icon */}
      <div className="relative z-10 flex items-center justify-center">
        {isActive ? (
          <MicOff className={cn(
            "w-6 h-6 text-white drop-shadow-sm transition-all duration-300",
            isSpeaking && "animate-pulse"
          )} />
        ) : (
          <Mic className={cn(
            "w-6 h-6 text-white drop-shadow-sm transition-all duration-300",
            "group-hover:scale-110"
          )} />
        )}
      </div>

      {/* Outer ring animation for listening state */}
      {isListening && !isSpeaking && (
        <div className="absolute inset-0 rounded-full border-2 border-green-300/30 animate-ping" />
      )}

      {/* Audio level visualization ring */}
      {audioLevel > 0 && isListening && (
        <div 
          className="absolute inset-0 rounded-full border-2 border-green-300 transition-all duration-100"
          style={{
            transform: `scale(${1 + audioLevel * 0.2})`,
            opacity: audioLevel
          }}
        />
      )}

      {/* Status indicator dot */}
      {onClick && (
        <div className={cn(
          "absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white transition-all duration-300 shadow-sm",
          isActive && isSpeaking ? "bg-green-300 animate-pulse" : 
          isActive && isListening ? "bg-blue-300 animate-pulse" :
          isActive ? "bg-orange-300" : "bg-gray-400"
        )} />
      )}
    </div>
  );
};