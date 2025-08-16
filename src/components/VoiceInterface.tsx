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
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      {/* Voice Sphere */}
      <div className="w-64 h-64 mb-8">
        <VoiceSphere isListening={isListening} isSpeaking={isSpeaking} />
      </div>

      {/* Status Text */}
      <div className="text-center mb-8">
        <p className="text-lg font-medium text-foreground mb-2">
          {isSpeaking ? 'SkAi is speaking...' : isListening ? 'Listening...' : 'Advanced Voice is now ChatGPT Voice'}
        </p>
        <p className="text-sm text-muted-foreground">
          {isListening ? 'Speak now or tap to interrupt' : 'Tap the microphone to start speaking'}
        </p>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-6">
        {/* Microphone Button */}
        <Button
          variant={isListening ? "default" : "outline"}
          size="lg"
          onClick={onToggle}
          className={cn(
            "w-16 h-16 rounded-full p-0 transition-all duration-200",
            isListening && "bg-red-500 hover:bg-red-600 border-red-500"
          )}
        >
          {isListening ? (
            <MicOff className="h-6 w-6 text-white" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </Button>

        {/* Close Button */}
        <Button
          variant="outline"
          size="lg"
          onClick={onEnd}
          className="w-16 h-16 rounded-full p-0"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}