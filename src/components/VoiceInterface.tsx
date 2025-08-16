import React from 'react';
import { Button } from './ui/button';
import { Mic, MicOff, X } from 'lucide-react';
import { VoiceSphere } from './VoiceSphere';
import { cn } from '@/lib/utils';

interface VoiceInterfaceProps {
  isActive: boolean;
  isListening?: boolean;
  isSpeaking?: boolean;
  onToggle: () => void;
  onEnd: () => void;
}

export function VoiceInterface({ 
  isActive, 
  isListening = false, 
  isSpeaking = false, 
  onToggle, 
  onEnd 
}: VoiceInterfaceProps) {
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
          {isSpeaking ? 'SkAi is speaking...' : isListening ? 'Listening...' : 'Voice Chat Active'}
        </p>
        <p className="text-xs text-muted-foreground">
          {isListening ? 'Speak now or tap to interrupt' : 'Tap the microphone to start speaking'}
        </p>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4">
        {/* Microphone Button */}
        <Button
          variant={isListening ? "default" : "outline"}
          size="sm"
          onClick={onToggle}
          className={cn(
            "w-12 h-12 rounded-full p-0 transition-all duration-200",
            isListening && "bg-red-500 hover:bg-red-600 border-red-500"
          )}
        >
          {isListening ? (
            <MicOff className="h-4 w-4 text-white" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>

        {/* Close Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onEnd}
          className="w-12 h-12 rounded-full p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}