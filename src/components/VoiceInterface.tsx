import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Mic, MicOff, X, Volume2, VolumeX } from 'lucide-react';
import { VoiceSphere } from './VoiceSphere';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface VoiceInterfaceProps {
  isActive: boolean;
  onMessage?: (message: string) => void;
  onEnd: () => void;
}

export function VoiceInterface({ 
  isActive,
  onMessage,
  onEnd 
}: VoiceInterfaceProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Auto-start conversation when component becomes active
  useEffect(() => {
    if (isActive && !isConnected && !isConnecting) {
      handleStartConversation();
    }
  }, [isActive, isConnected, isConnecting]);

  const handleStartConversation = async () => {
    setIsConnecting(true);
    try {
      toast.success("Voice chat activated", {
        description: "ElevenLabs integration will be available soon",
      });
      
      // Simulate connection for now
      setTimeout(() => {
        setIsConnected(true);
        setIsListening(true);
        setIsConnecting(false);
      }, 1000);
      
    } catch (error) {
      console.error('Failed to start conversation:', error);
      setIsConnecting(false);
      toast.error("Connection failed", {
        description: "Could not connect to voice assistant. Please try again.",
      });
    }
  };

  const handleEndConversation = async () => {
    try {
      setIsConnected(false);
      setIsListening(false);
      setIsSpeaking(false);
      setIsConnecting(false);
      onEnd();
    } catch (error) {
      console.error('Failed to end conversation:', error);
      onEnd(); // Still close the interface
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  if (!isActive) return null;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      {/* Voice Sphere */}
      <div className="w-32 h-32 mb-6">
        <VoiceSphere isListening={isListening} isSpeaking={isSpeaking} />
      </div>

      {/* Status Text */}
      <div className="text-center mb-6">
        <p className="text-sm font-medium text-foreground mb-1">
          {isConnecting 
            ? 'Connecting to SkAi...' 
            : !isConnected 
              ? 'Voice Chat Ready' 
              : isSpeaking 
                ? 'SkAi is speaking...' 
                : isListening 
                  ? 'Listening...' 
                  : 'Voice Chat Active'
          }
        </p>
        <p className="text-xs text-muted-foreground">
          {isConnecting 
            ? 'Please wait while we connect' 
            : !isConnected 
              ? 'Click the microphone to start'
              : isSpeaking 
                ? 'SkAi is responding to you'
                : isListening 
                  ? 'Speak naturally to SkAi' 
                  : 'Voice conversation ready'
          }
        </p>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4">
        {/* Connection Status Indicator */}
        <Button
          variant={isConnected ? "default" : "outline"}
          size="sm"
          disabled={isConnecting}
          className={cn(
            "w-12 h-12 rounded-full p-0 transition-all duration-200",
            isConnected && "bg-green-500 hover:bg-green-600 border-green-500",
            isListening && "animate-pulse"
          )}
        >
          <Mic className={cn("h-4 w-4", isConnected ? "text-white" : "text-muted-foreground")} />
        </Button>

        {/* Volume Control */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleMute}
          className="w-12 h-12 rounded-full p-0"
          disabled={!isConnected}
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>

        {/* Close Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleEndConversation}
          className="w-12 h-12 rounded-full p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Volume Slider */}
      {isConnected && !isMuted && (
        <div className="mt-4 flex items-center gap-2 w-32">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-muted-foreground w-8">
            {Math.round(volume * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}