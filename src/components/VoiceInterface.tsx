import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Mic, MicOff, X, Volume2, VolumeX } from 'lucide-react';
import { VoiceSphere } from './VoiceSphere';
import { useElevenLabsVoice } from '@/hooks/useElevenLabsVoice';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  const {
    startConversation,
    endConversation,
    setVolume: setElevenLabsVolume,
    status,
    isSpeaking: elevenLabsIsSpeaking
  } = useElevenLabsVoice({
    onMessage: (message) => {
      console.log('Voice message received:', message);
      onMessage?.(message);
    },
    onStatusChange: (status) => {
      setIsConnected(status === 'connected');
      if (status === 'connected') {
        setIsListening(true);
      } else {
        setIsListening(false);
        setIsSpeaking(false);
      }
    },
    onSpeakingChange: (speaking) => {
      setIsSpeaking(speaking);
      setIsListening(!speaking && isConnected);
    }
  });

  // Auto-start conversation when component becomes active
  useEffect(() => {
    if (isActive && !isConnected && status === 'disconnected') {
      handleStartConversation();
    }
  }, [isActive, isConnected, status]);

  // Handle volume changes
  useEffect(() => {
    const effectiveVolume = isMuted ? 0 : volume;
    setElevenLabsVolume(effectiveVolume);
  }, [volume, isMuted, setElevenLabsVolume]);

  const handleStartConversation = async () => {
    try {
      toast({
        title: "Starting voice chat...",
        description: "Connecting to SkAi voice assistant",
      });
      
      await startConversation();
      
      toast({
        title: "Voice chat active",
        description: "You can now speak to SkAi naturally",
      });
    } catch (error) {
      console.error('Failed to start conversation:', error);
      toast({
        title: "Connection failed",
        description: "Could not connect to voice assistant. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEndConversation = async () => {
    try {
      await endConversation();
      setIsConnected(false);
      setIsListening(false);
      setIsSpeaking(false);
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
          {!isConnected 
            ? 'Connecting to SkAi...' 
            : isSpeaking 
              ? 'SkAi is speaking...' 
              : isListening 
                ? 'Listening...' 
                : 'Voice Chat Active'
          }
        </p>
        <p className="text-xs text-muted-foreground">
          {!isConnected 
            ? 'Please wait while we connect' 
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
          disabled
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