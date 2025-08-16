import { useState, useRef, useCallback, useEffect } from 'react';
import { invokeEdge } from '@/lib/invokeEdge';
import { toast } from 'sonner';

export interface VoiceChatState {
  isConnected: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  canInterrupt: boolean;
}

export function useVoiceChat() {
  const [state, setState] = useState<VoiceChatState>({
    isConnected: false,
    isListening: false,
    isSpeaking: false,
    isProcessing: false,
    canInterrupt: false
  });

  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const isActiveRef = useRef<boolean>(false);
  const silenceDetectionRef = useRef<NodeJS.Timeout | null>(null);

  const updateState = useCallback((updates: Partial<VoiceChatState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const startContinuousListening = useCallback(async () => {
    if (!isActiveRef.current) return;
    
    try {
      console.log('Starting continuous voice listening...');
      
      // Request microphone access if not already available
      if (!audioStreamRef.current) {
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
      }

      audioChunksRef.current = [];

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(audioStreamRef.current, {
        mimeType: 'audio/webm;codecs=opus'
      });

      audioRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && isActiveRef.current) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('Recording stopped, processing audio...');
        if (audioChunksRef.current.length > 0 && isActiveRef.current) {
          await processAudioChunks();
        }
        
        // Restart listening immediately after processing (continuous mode)
        setTimeout(() => {
          if (isActiveRef.current && !state.isProcessing) {
            startContinuousListening();
          }
        }, 500);
      };

      // Start recording with short intervals for interrupt capability
      mediaRecorder.start(1000); // Record in 1-second chunks
      updateState({ isListening: true });

      // Stop recording after 3 seconds of audio to process (allows for interruption)
      speechTimeoutRef.current = setTimeout(() => {
        if (audioRecorderRef.current && audioRecorderRef.current.state === 'recording') {
          audioRecorderRef.current.stop();
        }
      }, 3000);

    } catch (error) {
      console.error('Failed to start continuous listening:', error);
      toast.error('Microphone access denied', {
        description: 'Please allow microphone access to use voice chat.'
      });
    }
  }, [state.isProcessing, updateState]);

  const initializeVoiceChat = useCallback(async () => {
    try {
      isActiveRef.current = true;
      updateState({ isConnected: true, canInterrupt: true });
      await startContinuousListening();
      
      toast.success('Continuous voice mode activated', {
        description: 'Always listening - speak anytime, even to interrupt!'
      });

    } catch (error) {
      console.error('Failed to initialize voice chat:', error);
      toast.error('Voice chat initialization failed');
    }
  }, [startContinuousListening, updateState]);

  const stopCurrentAudio = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    
    // Stop browser speech synthesis
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    
    updateState({ isSpeaking: false });
    console.log('Stopped current audio playback for interruption');
  }, [updateState]);

  const processAudioChunks = useCallback(async () => {
    try {
      updateState({ isProcessing: true, isListening: false });
      console.log('Processing audio chunks...');

      // If AI is speaking, interrupt it
      if (state.isSpeaking) {
        console.log('Interrupting AI speech...');
        stopCurrentAudio();
      }

      // Combine audio chunks
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Skip processing if audio is too short (likely silence)
      if (audioBlob.size < 1000) {
        console.log('Audio too short, skipping...');
        updateState({ isProcessing: false });
        return;
      }
      
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

      let transcribedText = transcriptionResult?.text?.trim();
      
      // Additional client-side filtering for safety
      if (transcribedText && /[^\x00-\x7F]/.test(transcribedText)) {
        console.warn('Client-side: Filtering non-English text from transcription');
        transcribedText = transcribedText.replace(/[^\x00-\x7F]/g, ' ').replace(/\s+/g, ' ').trim();
      }
      
      if (!transcribedText || transcribedText.length < 2) {
        console.log('No meaningful speech detected, continuing to listen...');
        updateState({ isProcessing: false });
        return;
      }

      console.log('Transcribed text:', transcribedText);
      toast.success('Speech recognized', {
        description: `"${transcribedText}"`
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
      updateState({ isProcessing: false });
      audioChunksRef.current = [];
    }
  }, [updateState, state.isSpeaking, stopCurrentAudio]);

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
      
      // Store reference for potential interruption
      currentAudioRef.current = audio;
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        updateState({ isSpeaking: false });
        currentAudioRef.current = null;
        console.log('AI finished speaking, continuing to listen...');
      };

      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
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
          console.log('Browser speech finished, continuing to listen...');
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
    
    isActiveRef.current = false;
    
    // Stop current recording
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
    
    // Stop any current audio
    stopCurrentAudio();
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    updateState({
      isConnected: false,
      isListening: false,
      isSpeaking: false,
      isProcessing: false,
      canInterrupt: false
    });
  }, [stopCurrentAudio, updateState]);

  return {
    state,
    initializeVoiceChat,
    stopCurrentAudio,
    disconnect,
    speakText
  };
}