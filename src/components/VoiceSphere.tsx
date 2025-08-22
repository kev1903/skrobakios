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
        "relative flex items-center justify-center w-full h-full rounded-full transition-all duration-700 ease-out group",
        "bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500",
        "backdrop-blur-xl border border-white/20 shadow-2xl",
        onClick && "cursor-pointer hover:shadow-[0_0_40px_rgba(147,51,234,0.6)] hover:scale-110 hover:border-white/40 active:scale-95",
        onClick && "focus:outline-none focus:ring-4 focus:ring-purple-400/30 focus:ring-offset-2",
        (isActive || isListening) && "shadow-[0_0_50px_rgba(147,51,234,0.8)] ring-4 ring-purple-300/50",
        isSpeaking && "animate-pulse",
        className
      )}
      style={{
        transform: `scale(${getScaleIntensity()}) rotate(${isSpeaking ? pulseIntensity * 2 : 0}deg)`,
        boxShadow: isSpeaking 
          ? `0 0 ${40 + getGlowIntensity() * 60}px rgba(147, 51, 234, ${0.6 + getGlowIntensity() * 0.4}), 
             0 0 ${80 + getGlowIntensity() * 40}px rgba(59, 130, 246, ${0.3 + getGlowIntensity() * 0.3}),
             inset 0 2px 4px rgba(255, 255, 255, 0.3)` 
          : "0 20px 40px rgba(147, 51, 234, 0.4), 0 10px 20px rgba(59, 130, 246, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.3)"
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

      {/* Enhanced inner glow layer */}
      <div 
        className="absolute inset-1 rounded-full opacity-40 animate-pulse"
        style={{
          background: "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.4) 40%, transparent 70%)"
        }}
      />

      {/* Sophisticated glossy highlight */}
      <div 
        className="absolute inset-2 rounded-full opacity-80"
        style={{
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.4) 25%, rgba(147, 51, 234, 0.1) 50%, transparent 75%)"
        }}
      />

      {/* Dynamic particles effect */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div className="absolute w-1 h-1 bg-white/60 rounded-full animate-ping" style={{top: '20%', left: '30%', animationDelay: '0s'}} />
        <div className="absolute w-1 h-1 bg-white/40 rounded-full animate-ping" style={{top: '70%', right: '25%', animationDelay: '1s'}} />
        <div className="absolute w-0.5 h-0.5 bg-purple-200/80 rounded-full animate-ping" style={{bottom: '30%', left: '60%', animationDelay: '2s'}} />
      </div>

      {/* Enhanced listening glow */}
      {isListening && !isSpeaking && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400/40 via-blue-400/30 to-pink-400/20 animate-pulse" />
      )}

      {/* Center focal point */}
      <div className="relative z-10 flex items-center justify-center">
        <div className={cn(
          "w-2 h-2 rounded-full bg-white/90 shadow-lg transition-all duration-300",
          "group-hover:scale-125 group-hover:bg-white",
          isSpeaking && "animate-pulse scale-150"
        )} />
      </div>

      {/* Sophisticated outer ring animation for listening state */}
      {isListening && !isSpeaking && (
        <div className="absolute inset-0 rounded-full border-2 border-purple-300/50 animate-ping" />
      )}

      {/* Enhanced audio level visualization ring */}
      {audioLevel > 0 && isListening && (
        <div 
          className="absolute inset-0 rounded-full border-2 border-gradient-to-r from-purple-400 to-blue-400 transition-all duration-100 shadow-lg"
          style={{
            transform: `scale(${1 + audioLevel * 0.3})`,
            opacity: audioLevel * 0.8 + 0.2,
            boxShadow: `0 0 ${10 + audioLevel * 20}px rgba(147, 51, 234, ${audioLevel * 0.6})`
          }}
        />
      )}

      {/* Sophisticated status indicator dot */}
      {onClick && (
        <div className={cn(
          "absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white/80 transition-all duration-500 shadow-lg backdrop-blur-sm",
          isActive && isSpeaking ? "bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse shadow-purple-400/50" : 
          isActive && isListening ? "bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse shadow-blue-400/50" :
          isActive ? "bg-gradient-to-r from-orange-400 to-yellow-400 shadow-orange-400/50" : "bg-gradient-to-r from-gray-400 to-gray-500"
        )} />
      )}
    </div>
  );
};