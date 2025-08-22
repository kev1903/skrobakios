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
        "bg-gradient-to-br from-background/80 to-background/60",
        "backdrop-blur-xl border border-border/30",
        onClick && "cursor-pointer hover:border-primary/40 hover:shadow-lg hover:scale-105 active:scale-95",
        onClick && "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2",
        (isActive || isListening) && "border-primary/60 shadow-xl",
        isSpeaking && "animate-pulse",
        className
      )}
      style={{
        transform: `scale(${getScaleIntensity()})`,
        boxShadow: isSpeaking 
          ? `0 0 ${20 + getGlowIntensity() * 30}px rgba(59, 130, 246, ${getGlowIntensity()})` 
          : undefined
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

      {/* Background glow when listening */}
      {isListening && !isSpeaking && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 animate-pulse" />
      )}

      {/* Inner gradient */}
      <div className="absolute inset-1 rounded-full bg-gradient-to-br from-background/40 to-background/20 backdrop-blur-sm" />

      {/* Icon */}
      <div className="relative z-10 flex items-center justify-center">
        {isActive ? (
          <MicOff className={cn(
            "w-6 h-6 text-destructive transition-all duration-300",
            isSpeaking && "animate-pulse"
          )} />
        ) : (
          <Mic className={cn(
            "w-6 h-6 text-primary transition-all duration-300",
            "group-hover:text-primary group-hover:scale-110"
          )} />
        )}
      </div>

      {/* Outer ring animation for listening state */}
      {isListening && !isSpeaking && (
        <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
      )}

      {/* Audio level visualization ring */}
      {audioLevel > 0 && isListening && (
        <div 
          className="absolute inset-0 rounded-full border-2 border-green-400 transition-all duration-100"
          style={{
            transform: `scale(${1 + audioLevel * 0.2})`,
            opacity: audioLevel
          }}
        />
      )}

      {/* Status indicator dot */}
      {onClick && (
        <div className={cn(
          "absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-background transition-all duration-300",
          isActive && isSpeaking ? "bg-green-400 animate-pulse" : 
          isActive && isListening ? "bg-blue-400 animate-pulse" :
          isActive ? "bg-orange-400" : "bg-muted"
        )} />
      )}
    </div>
  );
};