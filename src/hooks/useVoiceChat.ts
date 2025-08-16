import { useState, useRef, useCallback } from 'react';
import { invokeEdge } from '@/lib/invokeEdge';
import { toast } from 'sonner';

export interface VoiceChatState {
  isConnected: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
}

export function useVoiceChat() {
  const [state, setState] = useState<VoiceChatState>({
    isConnected: false,
    isListening: false,
    isSpeaking: false,
    isProcessing: false
  });

  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateState = useCallback((updates: Partial<VoiceChatState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const startListening = useCallback(async () => {
    try {
      console.log('Starting voice listening...');
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      audioStreamRef.current = stream;
      audioChunksRef.current = [];

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      audioRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('Recording stopped, processing audio...');
        if (audioChunksRef.current.length > 0) {
          await processAudioChunks();
        }
      };

      // Start recording
      mediaRecorder.start();
      updateState({ isConnected: true, isListening: true });

      // Auto-stop after 10 seconds (or when user stops speaking)
      speechTimeoutRef.current = setTimeout(() => {
        stopListening();
      }, 10000);

      toast.success('Listening started', {
        description: 'Speak now, I\'m listening...'
      });

    } catch (error) {
      console.error('Failed to start listening:', error);
      toast.error('Microphone access denied', {
        description: 'Please allow microphone access to use voice chat.'
      });
    }
  }, [updateState]);

  const stopListening = useCallback(() => {
    console.log('Stopping voice listening...');
    
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }

    if (audioRecorderRef.current && audioRecorderRef.current.state === 'recording') {
      audioRecorderRef.current.stop();
    }

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }

    updateState({ isListening: false });
  }, [updateState]);

  const processAudioChunks = useCallback(async () => {
    try {
      updateState({ isProcessing: true });
      console.log('Processing audio chunks...');

      // Combine audio chunks
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Convert to base64
      const base64Audio = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1] || '';
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      console.log('Sending audio to voice-transcribe function...');

      // Transcribe speech to text
      const transcriptionResult = await invokeEdge('voice-transcribe', {
        audio: base64Audio
      });

      const transcribedText = transcriptionResult?.text?.trim();
      
      if (!transcribedText) {
        toast.error('No speech detected', {
          description: 'Please speak clearly and try again.'
        });
        updateState({ isProcessing: false });
        return;
      }

      console.log('Transcribed text:', transcribedText);
      toast.success('Speech recognized', {
        description: `You said: "${transcribedText}"`
      });

      // Send to SkAi for processing
      console.log('Sending to SkAi...');
      updateState({ isSpeaking: true });

      const aiResponse = await invokeEdge('ai-chat', {
        message: transcribedText,
        conversationHistory: []
      });

      const aiText = aiResponse?.response;
      
      if (!aiText) {
        toast.error('No response from SkAi');
        updateState({ isProcessing: false, isSpeaking: false });
        return;
      }

      console.log('SkAi response:', aiText);

      // Convert AI response to speech
      await speakText(aiText);

    } catch (error) {
      console.error('Error processing audio:', error);
      toast.error('Voice processing failed', {
        description: 'Please try again.'
      });
    } finally {
      updateState({ isProcessing: false, isSpeaking: false });
      audioChunksRef.current = [];
    }
  }, [updateState]);

  const speakText = useCallback(async (text: string) => {
    try {
      console.log('Converting text to speech:', text);
      
      // Use our text-to-speech edge function
      const ttsResult = await invokeEdge('text-to-speech', {
        text: text,
        voice: 'alloy'
      });

      if (!ttsResult?.audioContent) {
        throw new Error('No audio content received from TTS');
      }

      // Convert base64 to blob and play
      const binaryString = atob(ttsResult.audioContent);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const audioBlob = new Blob([bytes], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        updateState({ isSpeaking: false });
      };

      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        throw new Error('Audio playback failed');
      };

      await audio.play();
      
    } catch (error) {
      console.error('Error in text-to-speech:', error);
      
      // Fallback: Use browser's speech synthesis
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        
        utterance.onend = () => {
          updateState({ isSpeaking: false });
        };
        
        speechSynthesis.speak(utterance);
      } else {
        updateState({ isSpeaking: false });
        toast.error('Text-to-speech not available');
      }
    }
  }, [updateState]);

  const disconnect = useCallback(() => {
    console.log('Disconnecting voice chat...');
    
    stopListening();
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Stop any ongoing speech
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }

    updateState({
      isConnected: false,
      isListening: false,
      isSpeaking: false,
      isProcessing: false
    });
  }, [stopListening, updateState]);

  return {
    state,
    startListening,
    stopListening,
    disconnect,
    speakText
  };
}