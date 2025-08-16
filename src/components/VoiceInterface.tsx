import React, { useEffect, useState, useRef } from 'react';
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
  const { state, initializeVoiceChat, stopCurrentAudio, disconnect } = useVoiceChat();
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  // Track session start to avoid repeated initializations
  const startedRef = useRef(false);

  // Auto-start once per activation
  useEffect(() => {
    if (isActive && !startedRef.current && !state.isConnected) {
      startedRef.current = true;
      initializeVoiceChat();
    }
  }, [isActive, initializeVoiceChat, state.isConnected]);

  // Cleanup on unmount or when not active
  useEffect(() => {
    if (!isActive) {
      startedRef.current = false;
      disconnect();
    }
    return () => {
      startedRef.current = false;
      disconnect();
    };
  }, [isActive, disconnect]);

  const handleStartConversation = async () => {
    try {
      if (state.isConnected) return;
      await initializeVoiceChat();
    } catch (error) {
      console.error('Failed to start conversation:', error);
      toast.error("Connection failed", {
        description: "Could not access microphone. Please try again.",
      });
    }
  };

  const handleEndConversation = async () => {
    try {
      startedRef.current = false;
      disconnect();
      onEnd();
    } catch (error) {
      console.error('Failed to end conversation:', error);
      onEnd(); // Still close the interface
    }
  };

  const handleInterrupt = () => {
    if (state.isSpeaking) {
      console.log('User interrupting SkAi...');
      stopCurrentAudio();
      toast.info('Interrupted SkAi', {
        description: 'Speak now for your new command'
      });
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  if (!isActive) return null;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      {/* Voice Sphere */}
      <div className="w-32 h-32 mb-6" onClick={handleInterrupt} style={{ cursor: state.isSpeaking ? 'pointer' : 'default' }}>
        <VoiceSphere isListening={state.isListening || state.isConnected} isSpeaking={state.isSpeaking} />
      </div>

      {/* Status Text */}
      <div className="text-center mb-6">
        <p className="text-sm font-medium text-foreground mb-1">
          {state.isProcessing
            ? 'Processing your voice...'
            : state.isSpeaking 
              ? 'SkAi is speaking... (click to interrupt)' 
              : state.isConnected
                ? 'Always listening - speak anytime!'
                : 'Voice Chat Ready'
          }
        </p>
        <p className="text-xs text-muted-foreground">
          {state.isProcessing
            ? 'Converting speech and thinking...'
            : state.isSpeaking 
              ? 'Click the voice sphere or speak to interrupt SkAi'
              : state.isConnected
                ? 'Continuous listening active - just speak naturally'
                : 'Click microphone to start always-on voice chat'
          }
        </p>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4">
        {/* Always-On Listening Indicator */}
        <Button
          variant={state.isConnected ? "default" : "outline"}
          size="sm"
          disabled={state.isProcessing}
          onClick={handleStartConversation}
          className={cn(
            "w-12 h-12 rounded-full p-0 transition-all duration-200",
            state.isConnected && "bg-green-500 hover:bg-green-600 border-green-500 animate-pulse"
          )}
        >
          {state.isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin text-white" />
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
        Status: {state.isConnected ? 'Always Listening' : 'Disconnected'} | 
        {state.isProcessing && ' Processing |'}
        {state.isSpeaking && ' Speaking (interruptible) |'}
        {state.canInterrupt && ' Can Interrupt |'}
      </div>
    </div>
  );
}