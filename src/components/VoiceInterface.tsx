import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Mic, MicOff, X, Volume2, VolumeX, Loader2, Settings, Hand } from 'lucide-react';

import { VoiceDebugPanel } from './VoiceDebugPanel';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useSkaiVoiceChat } from '@/hooks/useSkaiVoiceChat';
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
  // Voice interface stub implementation
  const state = { 
    isConnected: false, 
    isConnecting: false, 
    error: null,
    connectionState: 'disconnected',
    isRecording: false,
    isPlaying: false,
    isSpeaking: false,
    audioLevel: 0,
    lastTranscript: '',
    lastResponse: '',
    conversationId: null,
    isListening: false,
    isVoiceActivated: false,
    isProcessing: false,
    listeningMode: 'pushToTalk'
  };
  const settings = { 
    voice: 'alloy', 
    temperature: 0.8, 
    volume: 0.8,
    inputGainControl: true,
    pushToTalk: false,
    autoSpeak: true,
    enableVAD: false,
    sensitivity: 0.5,
    minimumDuration: 1000
  };
  const initializeVoiceChat = (mode?: string) => {};
  const stopCurrentAudio = () => {};
  const disconnect = () => {};
  const updateSettings = (newSettings: any) => {};
  const startPushToTalk = () => {};
  const stopPushToTalk = () => {};
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
      <VoiceDebugPanel />
      {/* Enhanced AI Voice Sphere */}
      <div className="w-32 h-32 mb-6 relative" onClick={handleInterrupt} style={{ cursor: state.isSpeaking ? 'pointer' : 'default' }}>
        <div 
          className={cn(
            "w-full h-full rounded-full border-4 transition-all duration-300 flex items-center justify-center relative",
            state.isConnected 
              ? state.isSpeaking 
                ? "border-green-500 bg-green-500/20 animate-pulse"
                : state.isListening || state.isVoiceActivated 
                  ? "border-blue-500 bg-blue-500/20"
                  : "border-gray-300 bg-gray-300/20"
              : "border-gray-400 bg-gray-400/10"
          )}
        >
          <Mic className={cn(
            "w-12 h-12 transition-colors",
            state.isConnected 
              ? state.isSpeaking 
                ? "text-green-500"
                : state.isListening || state.isVoiceActivated
                  ? "text-blue-500"
                  : "text-gray-500"
              : "text-gray-400"
          )} />
        </div>
        
        {/* Enhanced audio level indicator with modern styling */}
        {state.isConnected && settings.enableVAD && (
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-full px-3 py-1">
              <div className="w-16 h-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all duration-100 rounded-full",
                    state.isVoiceActivated 
                      ? "bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg shadow-green-500/50" 
                      : "bg-gradient-to-r from-blue-400 to-cyan-500 shadow-lg shadow-blue-500/50"
                  )}
                  style={{ 
                    width: `${audioLevelPercentage}%`,
                    boxShadow: state.isVoiceActivated 
                      ? `0 0 8px rgba(34, 197, 94, ${audioLevelPercentage / 100})`
                      : `0 0 8px rgba(59, 130, 246, ${audioLevelPercentage / 100})`
                  }}
                />
              </div>
              <span className="text-xs text-white/80 font-medium w-8">
                {audioLevelPercentage}%
              </span>
            </div>
          </div>
        )}
        
        {/* Interactive glow effect */}
        {(state.isVoiceActivated || state.isSpeaking) && (
          <div 
            className={cn(
              "absolute inset-0 rounded-full transition-all duration-300",
              state.isSpeaking 
                ? "bg-green-500/20 shadow-2xl shadow-green-500/40 animate-pulse" 
                : "bg-blue-500/20 shadow-2xl shadow-blue-500/40"
            )}
            style={{
              filter: `blur(8px)`,
              transform: `scale(${1.2 + state.audioLevel * 0.3})`
            }}
          />
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
        {/* Unified Voice Button - handles both modes */}
        <Button
          variant={state.isConnected ? "default" : "outline"}
          size="sm"
          disabled={state.isProcessing}
          onClick={state.listeningMode === 'continuous' ? handleStartConversation : handleModeToggle}
          onMouseDown={state.listeningMode === 'push-to-talk' && state.isConnected ? handlePushToTalkStart : undefined}
          onMouseUp={state.listeningMode === 'push-to-talk' && state.isConnected ? handlePushToTalkEnd : undefined}
          onMouseLeave={state.listeningMode === 'push-to-talk' && state.isConnected ? handlePushToTalkEnd : undefined}
          onTouchStart={state.listeningMode === 'push-to-talk' && state.isConnected ? handlePushToTalkStart : undefined}
          onTouchEnd={state.listeningMode === 'push-to-talk' && state.isConnected ? handlePushToTalkEnd : undefined}
          className={cn(
            "w-16 h-16 rounded-full p-0 transition-all duration-200 relative",
            // Continuous mode styling
            state.listeningMode === 'continuous' && state.isConnected && state.isVoiceActivated && "bg-green-500 hover:bg-green-600 border-green-500 animate-pulse",
            state.listeningMode === 'continuous' && state.isConnected && !state.isVoiceActivated && "bg-blue-500 hover:bg-blue-600 border-blue-500",
            // Push-to-talk mode styling
            state.listeningMode === 'push-to-talk' && isPushToTalkPressed && "bg-red-500 hover:bg-red-600 border-red-500",
            state.listeningMode === 'push-to-talk' && !state.isConnected && "border-dashed"
          )}
        >
          {state.isProcessing ? (
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          ) : (
            <Mic className={cn(
              "h-5 w-5", 
              state.isConnected ? "text-white" : "text-muted-foreground"
            )} />
          )}
          
          {/* Mode indicator */}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-background border-2 border-current flex items-center justify-center">
            {state.listeningMode === 'continuous' ? (
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            ) : (
              <Hand className="h-2 w-2 text-orange-500" />
            )}
          </div>
        </Button>

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

      {/* Mode Instructions */}
      <div className="mt-2 text-xs text-muted-foreground text-center">
        {state.listeningMode === 'continuous' 
          ? 'Click mic to start/stop • Blue dot = Continuous mode'
          : 'Click mic to switch modes • Hand icon = Push-to-talk • Hold mic to record'
        }
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