import React, { useEffect, useState } from 'react';
import { Mic, MicOff, X, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface VoiceUIProps {
  projectName: string;
  isListening: boolean;
  isRecording: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  onToggleListening: () => void;
  onExit: () => void;
  onToggleSpeaking: () => void;
}

export const VoiceUI = ({
  projectName,
  isListening,
  isRecording,
  isProcessing,
  isSpeaking,
  onToggleListening,
  onExit,
  onToggleSpeaking
}: VoiceUIProps) => {
  const [visualizerData, setVisualizerData] = useState<number[]>(new Array(20).fill(0));

  // Simulate audio visualization
  useEffect(() => {
    if (isRecording || isSpeaking) {
      const interval = setInterval(() => {
        setVisualizerData(prev => 
          prev.map(() => Math.random() * (isRecording ? 80 : 40) + (isRecording ? 20 : 10))
        );
      }, 100);
      return () => clearInterval(interval);
    } else {
      setVisualizerData(new Array(20).fill(0));
    }
  }, [isRecording, isSpeaking]);

  const getStatusText = () => {
    if (isProcessing) return "Processing your voice...";
    if (isRecording) return "Listening... Keep speaking";
    if (isSpeaking) return "SkAi is responding...";
    if (isListening) return "Ready to listen. Start speaking naturally.";
    return "Voice mode ready";
  };

  const getStatusColor = () => {
    if (isProcessing) return "text-blue-400";
    if (isRecording) return "text-green-400";
    if (isSpeaking) return "text-purple-400";
    if (isListening) return "text-primary";
    return "text-muted-foreground";
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 ring-2 ring-primary/20">
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                AI
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-lg">Voice Chat</h2>
              <p className="text-sm text-muted-foreground">{projectName}</p>
            </div>
          </div>
          <Button
            onClick={onExit}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Voice Visualization Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8">
        {/* Central AI Avatar with Glow Effect */}
        <div className="relative">
          <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
            isRecording ? 'animate-pulse bg-green-400/30 scale-110' :
            isSpeaking ? 'animate-pulse bg-purple-400/30 scale-110' :
            isListening ? 'bg-primary/20 scale-105' : 'bg-muted/20'
          } blur-xl`} />
          <Avatar className={`relative w-24 h-24 transition-all duration-300 ${
            isRecording ? 'ring-4 ring-green-400/50 scale-110' :
            isSpeaking ? 'ring-4 ring-purple-400/50 scale-110' :
            isListening ? 'ring-4 ring-primary/50 scale-105' : 'ring-2 ring-border'
          }`}>
            <AvatarFallback className={`text-2xl font-bold transition-colors duration-300 ${
              isRecording ? 'bg-green-400 text-white' :
              isSpeaking ? 'bg-purple-400 text-white' :
              isListening ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              AI
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Audio Visualizer */}
        <div className="flex items-end justify-center gap-1 h-16">
          {visualizerData.map((height, index) => (
            <div
              key={index}
              className={`w-2 rounded-full transition-all duration-150 ${
                isRecording ? 'bg-green-400' :
                isSpeaking ? 'bg-purple-400' :
                isListening ? 'bg-primary' : 'bg-muted'
              }`}
              style={{ height: `${Math.max(4, height)}%` }}
            />
          ))}
        </div>

        {/* Status Text */}
        <div className="text-center space-y-2">
          <p className={`text-lg font-medium transition-colors duration-300 ${getStatusColor()}`}>
            {getStatusText()}
          </p>
          {isListening && !isRecording && (
            <p className="text-sm text-muted-foreground max-w-md">
              Speak naturally when you're ready. I'll automatically detect when you start and stop speaking.
            </p>
          )}
        </div>

      </div>

      {/* Controls */}
      <div className="flex-shrink-0 p-6 border-t border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={onToggleListening}
            size="lg"
            variant={isListening ? "default" : "outline"}
            className={`w-16 h-16 rounded-full transition-all duration-300 ${
              isListening ? 'bg-primary hover:bg-primary/90 scale-105' : ''
            } ${isRecording ? 'animate-pulse bg-green-500 hover:bg-green-600' : ''}`}
            disabled={isProcessing}
          >
            {isRecording ? (
              <MicOff className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </Button>

          <Button
            onClick={onToggleSpeaking}
            size="lg"
            variant="outline"
            className="w-16 h-16 rounded-full"
            disabled={isProcessing || !isSpeaking}
          >
            {isSpeaking ? (
              <VolumeX className="w-6 h-6" />
            ) : (
              <Volume2 className="w-6 h-6" />
            )}
          </Button>
        </div>

        <div className="text-center mt-4">
          <p className="text-xs text-muted-foreground">
            {isListening ? 'Click mic to stop listening' : 'Click mic to start voice conversation'}
          </p>
        </div>
      </div>
    </div>
  );
};