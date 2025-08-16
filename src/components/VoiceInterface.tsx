import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Mic, MicOff, X, Volume2, VolumeX, Loader2, Settings, Hand } from 'lucide-react';
import { VoiceSphere } from './VoiceSphere';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useVoiceChat } from '@/hooks/useVoiceChat';
import { Slider } from './ui/slider';

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
  const { 
    state, 
    settings, 
    initializeVoiceChat, 
    stopCurrentAudio, 
    disconnect, 
    updateSettings,
    startPushToTalk,
    stopPushToTalk
  } = useVoiceChat();
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isPushToTalkPressed, setIsPushToTalkPressed] = useState(false);

  // Auto-start when component becomes active
  useEffect(() => {
    if (isActive && !state.isConnected) {
      initializeVoiceChat();
    }
  }, [isActive, state.isConnected, initializeVoiceChat]);

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
      await initializeVoiceChat(state.listeningMode);
    } catch (error) {
      console.error('Failed to start conversation:', error);
      toast.error("Connection failed", {
        description: "Could not access microphone. Please try again.",
      });
    }
  };

  const handleModeToggle = () => {
    const newMode = state.listeningMode === 'continuous' ? 'push-to-talk' : 'continuous';
    if (state.isConnected) {
      disconnect();
      setTimeout(() => initializeVoiceChat(newMode), 500);
    }
  };

  const handlePushToTalkStart = () => {
    if (state.listeningMode === 'push-to-talk' && state.isConnected) {
      setIsPushToTalkPressed(true);
      startPushToTalk();
    }
  };

  const handlePushToTalkEnd = () => {
    if (isPushToTalkPressed) {
      setIsPushToTalkPressed(false);
      stopPushToTalk();
    }
  };

  const cancelCurrentTranscription = () => {
    if (state.isProcessing) {
      toast.info('Cancelled current transcription');
      // This would ideally cancel the ongoing transcription
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

  // Audio level visualization
  const audioLevelPercentage = Math.round(state.audioLevel * 100);

  if (!isActive) return null;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      {/* Voice Sphere */}
      <div className="w-32 h-32 mb-6 relative" onClick={handleInterrupt} style={{ cursor: state.isSpeaking ? 'pointer' : 'default' }}>
        <VoiceSphere 
          isListening={state.isListening || state.isConnected} 
          isSpeaking={state.isSpeaking} 
        />
        
        {/* Audio level indicator */}
        {state.isConnected && settings.enableVAD && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-1">
              <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all duration-100 rounded-full",
                    state.isVoiceActivated ? "bg-green-500" : "bg-blue-500"
                  )}
                  style={{ width: `${audioLevelPercentage}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-8">
                {audioLevelPercentage}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Status Text */}
      <div className="text-center mb-6">
        <p className="text-sm font-medium text-foreground mb-1">
          {state.isProcessing
            ? 'Processing your voice...'
            : state.isSpeaking 
              ? 'SkAi is speaking... (click to interrupt)' 
              : state.isConnected
                ? state.listeningMode === 'continuous' 
                  ? state.isVoiceActivated ? 'Voice detected!' : 'Smart listening active'
                  : isPushToTalkPressed ? 'Recording...' : 'Push-to-talk ready'
                : 'Voice Chat Ready'
          }
        </p>
        <p className="text-xs text-muted-foreground">
          {state.isProcessing
            ? state.listeningMode === 'continuous' 
              ? 'Converting speech with smart filtering...'
              : 'Processing your message...'
            : state.isSpeaking 
              ? 'Click the voice sphere or speak to interrupt SkAi'
              : state.isConnected
                ? state.listeningMode === 'continuous'
                  ? 'Advanced voice detection - filters background noise'
                  : 'Hold the mic button and speak'
                : 'Choose continuous or push-to-talk mode'
          }
        </p>
        
        {/* Voice activity status */}
        {state.isConnected && state.listeningMode === 'continuous' && (
          <div className="flex justify-center items-center gap-2 mt-2">
            <div className={cn(
              "w-2 h-2 rounded-full transition-all duration-200",
              state.isVoiceActivated ? "bg-green-500 animate-pulse" : "bg-gray-300"
            )} />
            <span className="text-xs text-muted-foreground">
              {state.isVoiceActivated ? 'Voice Active' : 'Monitoring'}
            </span>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex gap-3 flex-wrap justify-center">
        {/* Mode Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleModeToggle}
          disabled={state.isProcessing}
          className="w-12 h-12 rounded-full p-0"
        >
          {state.listeningMode === 'continuous' ? (
            <Mic className="h-4 w-4" />
          ) : (
            <Hand className="h-4 w-4" />
          )}
        </Button>

        {/* Main Voice Button */}
        {state.listeningMode === 'continuous' ? (
          <Button
            variant={state.isConnected ? "default" : "outline"}
            size="sm"
            disabled={state.isProcessing}
            onClick={handleStartConversation}
            className={cn(
              "w-12 h-12 rounded-full p-0 transition-all duration-200",
              state.isConnected && state.isVoiceActivated && "bg-green-500 hover:bg-green-600 border-green-500 animate-pulse",
              state.isConnected && !state.isVoiceActivated && "bg-blue-500 hover:bg-blue-600 border-blue-500"
            )}
          >
            {state.isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <Mic className={cn("h-4 w-4", state.isConnected ? "text-white" : "text-muted-foreground")} />
            )}
          </Button>
        ) : (
          <Button
            variant={isPushToTalkPressed ? "default" : "outline"}
            size="sm"
            disabled={!state.isConnected}
            onMouseDown={handlePushToTalkStart}
            onMouseUp={handlePushToTalkEnd}
            onMouseLeave={handlePushToTalkEnd}
            onTouchStart={handlePushToTalkStart}
            onTouchEnd={handlePushToTalkEnd}
            className={cn(
              "w-12 h-12 rounded-full p-0 transition-all duration-200",
              isPushToTalkPressed && "bg-red-500 hover:bg-red-600 border-red-500"
            )}
          >
            <Mic className={cn("h-4 w-4", isPushToTalkPressed ? "text-white" : "text-muted-foreground")} />
          </Button>
        )}

        {/* Settings */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className="w-12 h-12 rounded-full p-0"
        >
          <Settings className="h-4 w-4" />
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

        {/* Cancel Processing */}
        {state.isProcessing && (
          <Button
            variant="outline"
            size="sm"
            onClick={cancelCurrentTranscription}
            className="w-12 h-12 rounded-full p-0"
          >
            <X className="h-4 w-4 text-red-500" />
          </Button>
        )}

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

      {/* Advanced Settings Panel */}
      {showSettings && (
        <div className="mt-6 p-4 bg-muted rounded-lg w-full max-w-sm space-y-4">
          <h3 className="text-sm font-medium">Voice Settings</h3>
          
          {/* Sensitivity Control */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Voice Sensitivity: {Math.round(settings.sensitivity * 100)}%
            </label>
            <Slider
              value={[settings.sensitivity]}
              onValueChange={([value]) => updateSettings({ sensitivity: value })}
              max={1}
              min={0.1}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Minimum Duration */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Min Recording: {settings.minimumDuration}ms
            </label>
            <Slider
              value={[settings.minimumDuration]}
              onValueChange={([value]) => updateSettings({ minimumDuration: value })}
              max={3000}
              min={500}
              step={250}
              className="w-full"
            />
          </div>

          {/* Voice Activity Detection Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Smart Detection</span>
            <Button
              variant={settings.enableVAD ? "default" : "outline"}
              size="sm"
              onClick={() => updateSettings({ enableVAD: !settings.enableVAD })}
              className="h-8 w-16 text-xs"
            >
              {settings.enableVAD ? "ON" : "OFF"}
            </Button>
          </div>
        </div>
      )}

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
        Mode: {state.listeningMode} | 
        Status: {state.isConnected ? 'Connected' : 'Disconnected'} | 
        {state.isProcessing && ' Processing |'}
        {state.isSpeaking && ' Speaking |'}
        {state.isVoiceActivated && ' Voice Active'}
      </div>
    </div>
  );
}