import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Mic, MicOff, X, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { VoiceSphere } from './VoiceSphere';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useVoiceChat } from '@/hooks/useVoiceChat';

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
  const { state, startListening, stopListening, disconnect } = useVoiceChat();
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  // Auto-start when component becomes active
  useEffect(() => {
    if (isActive && !state.isConnected) {
      handleStartConversation();
    }
  }, [isActive]);

  // Cleanup on unmount or when not active
  useEffect(() => {
    if (!isActive) {
      disconnect();
    }
    return () => {
      disconnect();
    };
  }, [isActive, disconnect]);

  const handleStartConversation = async () => {
    try {
      await startListening();
      toast.success("Voice mode activated", {
        description: "Speak now to interact with SkAi",
      });
    } catch (error) {
      console.error('Failed to start conversation:', error);
      toast.error("Connection failed", {
        description: "Could not access microphone. Please try again.",
      });
    }
  };

  const handleEndConversation = async () => {
    try {
      disconnect();
      onEnd();
    } catch (error) {
      console.error('Failed to end conversation:', error);
      onEnd(); // Still close the interface
    }
  };

  const handleMicClick = () => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
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
        <VoiceSphere isListening={state.isListening} isSpeaking={state.isSpeaking} />
      </div>

      {/* Status Text */}
      <div className="text-center mb-6">
        <p className="text-sm font-medium text-foreground mb-1">
          {state.isProcessing
            ? 'Processing your voice...'
            : state.isSpeaking 
              ? 'SkAi is speaking...' 
              : state.isListening 
                ? 'Listening...' 
                : state.isConnected
                  ? 'Ready to listen'
                  : 'Voice Chat Ready'
          }
        </p>
        <p className="text-xs text-muted-foreground">
          {state.isProcessing
            ? 'Converting speech to text and thinking...'
            : state.isSpeaking 
              ? 'SkAi is responding to your question'
              : state.isListening 
                ? 'Speak naturally to SkAi' 
                : state.isConnected
                  ? 'Click microphone to start speaking'
                  : 'Click microphone to begin voice chat'
          }
        </p>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4">
        {/* Microphone Button */}
        <Button
          variant={state.isListening ? "default" : "outline"}
          size="sm"
          disabled={state.isProcessing || state.isSpeaking}
          onClick={handleMicClick}
          className={cn(
            "w-12 h-12 rounded-full p-0 transition-all duration-200",
            state.isListening && "bg-red-500 hover:bg-red-600 border-red-500",
            state.isConnected && !state.isListening && "bg-green-500 hover:bg-green-600 border-green-500"
          )}
        >
          {state.isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          ) : state.isListening ? (
            <MicOff className="h-4 w-4 text-white" />
          ) : (
            <Mic className={cn("h-4 w-4", state.isConnected ? "text-white" : "text-muted-foreground")} />
          )}
        </Button>

        {/* Volume Control */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleMute}
          className="w-12 h-12 rounded-full p-0"
          disabled={!state.isConnected}
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
      {state.isConnected && !isMuted && (
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

      {/* Debug Status */}
      <div className="mt-4 text-xs text-muted-foreground text-center">
        Status: {state.isConnected ? 'Connected' : 'Disconnected'} | 
        {state.isListening && ' Listening |'}
        {state.isProcessing && ' Processing |'}
        {state.isSpeaking && ' Speaking |'}
      </div>
    </div>
  );
}