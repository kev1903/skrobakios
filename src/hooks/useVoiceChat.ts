import { useState, useRef, useCallback, useEffect } from 'react';
import { invokeEdge } from '@/lib/invokeEdge';
import { toast } from 'sonner';

export interface VoiceChatState {
  isConnected: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  canInterrupt: boolean;
  listeningMode: 'continuous' | 'push-to-talk';
  isVoiceActivated: boolean;
  audioLevel: number;
}

export interface VoiceChatSettings {
  sensitivity: number; // 0-1
  minimumDuration: number; // milliseconds
  silenceThreshold: number; // milliseconds
  enableVAD: boolean;
}

export function useVoiceChat() {
  const [state, setState] = useState<VoiceChatState>({
    isConnected: false,
    isListening: false,
    isSpeaking: false,
    isProcessing: false,
    canInterrupt: false,
    listeningMode: 'continuous',
    isVoiceActivated: false,
    audioLevel: 0
  });

  const [settings, setSettings] = useState<VoiceChatSettings>({
    sensitivity: 0.3,
    minimumDuration: 1500,
    silenceThreshold: 2000,
    enableVAD: true
  });

  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const isActiveRef = useRef<boolean>(false);
  const silenceDetectionRef = useRef<NodeJS.Timeout | null>(null);
  const voiceActivityRef = useRef<NodeJS.Timeout | null>(null);
  const recordingStartTimeRef = useRef<number>(0);
  const lastVoiceDetectionRef = useRef<number>(0);
  const isPushToTalkActiveRef = useRef<boolean>(false);

  const updateState = useCallback((updates: Partial<VoiceChatState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateSettings = useCallback((updates: Partial<VoiceChatSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  // Voice Activity Detection
  const detectVoiceActivity = useCallback(() => {
    if (!analyserRef.current || !settings.enableVAD) return false;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate average amplitude
    const average = dataArray.reduce((a, b) => a + b) / bufferLength;
    const audioLevel = average / 255;

    updateState({ audioLevel });

    // Check if audio level exceeds sensitivity threshold
    const hasVoice = audioLevel > settings.sensitivity;
    
    if (hasVoice) {
      lastVoiceDetectionRef.current = Date.now();
    }

    return hasVoice;
  }, [settings.enableVAD, settings.sensitivity, updateState]);

  // Filter common media phrases that shouldn't trigger the AI
  const filterMediaPhrases = useCallback((text: string): string | null => {
    if (!text || text.length < 3) return null;

    const mediaPhrases = [
      'thank you for watching',
      'like and subscribe', 
      'hit the bell',
      'don\'t forget to',
      'see you next time',
      'thanks for tuning in',
      'leave a comment',
      'share this video',
      'follow me on',
      'check out the link'
    ];

    const lowerText = text.toLowerCase().trim();
    
    // Check if text contains common media phrases
    if (mediaPhrases.some(phrase => lowerText.includes(phrase))) {
      console.log('Filtered media phrase:', text);
      return null;
    }

    // Minimum word count check
    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount < 2) {
      console.log('Text too short, filtered:', text);
      return null;
    }

    return text;
  }, []);

  const setupAudioAnalysis = useCallback(async () => {
    if (!audioStreamRef.current) return;

    try {
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(audioStreamRef.current);
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;
      source.connect(analyserRef.current);

      console.log('Audio analysis setup complete');
    } catch (error) {
      console.error('Failed to setup audio analysis:', error);
    }
  }, []);

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
      
      // Enhanced audio filtering
      const minSize = settings.enableVAD ? 5000 : 1000;
      if (audioBlob.size < minSize) {
        console.log(`Audio too short (${audioBlob.size} bytes), skipping...`);
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
      
      // Apply media phrase filtering
      transcribedText = filterMediaPhrases(transcribedText);
      
      if (!transcribedText || transcribedText.length < 2) {
        console.log('No meaningful speech detected after filtering, continuing to listen...');
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
  }, [updateState, state.isSpeaking, stopCurrentAudio, filterMediaPhrases, settings.enableVAD, speakText]);

  const startContinuousListening = useCallback(async () => {
    if (!isActiveRef.current || state.listeningMode !== 'continuous') return;
    
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
        await setupAudioAnalysis();
      }

      audioChunksRef.current = [];
      recordingStartTimeRef.current = Date.now();

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
        console.log('Recording stopped, analyzing audio...');
        
        const recordingDuration = Date.now() - recordingStartTimeRef.current;
        const timeSinceLastVoice = Date.now() - lastVoiceDetectionRef.current;
        
        // Only process if we have meaningful audio
        if (audioChunksRef.current.length > 0 && isActiveRef.current) {
          // Enhanced filtering - check duration and voice activity
          if (settings.enableVAD) {
            if (recordingDuration < settings.minimumDuration) {
              console.log('Recording too short, skipping...');
              audioChunksRef.current = [];
              if (isActiveRef.current && state.listeningMode === 'continuous') {
                setTimeout(() => startContinuousListening(), 500);
              }
              return;
            }
            
            if (timeSinceLastVoice > settings.silenceThreshold) {
              console.log('No recent voice activity, skipping...');
              audioChunksRef.current = [];
              if (isActiveRef.current && state.listeningMode === 'continuous') {
                setTimeout(() => startContinuousListening(), 500);
              }
              return;
            }
          }
          
          await processAudioChunks();
        }
        
        // Restart listening immediately after processing (continuous mode)
        setTimeout(() => {
          if (isActiveRef.current && !state.isProcessing && state.listeningMode === 'continuous') {
            startContinuousListening();
          }
        }, 500);
      };

      // Start recording with voice activity detection
      mediaRecorder.start(1000); // Record in 1-second chunks
      updateState({ isListening: true, isVoiceActivated: false });

      // Enhanced voice activity monitoring
      if (settings.enableVAD) {
        const monitorVoiceActivity = () => {
          if (!isActiveRef.current || !audioRecorderRef.current) return;
          
          const hasVoice = detectVoiceActivity();
          updateState({ isVoiceActivated: hasVoice });
          
          if (isActiveRef.current) {
            requestAnimationFrame(monitorVoiceActivity);
          }
        };
        requestAnimationFrame(monitorVoiceActivity);
      }

      // Dynamic recording duration based on voice activity
      speechTimeoutRef.current = setTimeout(() => {
        if (audioRecorderRef.current && audioRecorderRef.current.state === 'recording') {
          audioRecorderRef.current.stop();
        }
      }, settings.enableVAD ? 4000 : 3000);

    } catch (error) {
      console.error('Failed to start continuous listening:', error);
      toast.error('Microphone access denied', {
        description: 'Please allow microphone access to use voice chat.'
      });
    }
  }, [state.isProcessing, state.listeningMode, settings, updateState, setupAudioAnalysis, detectVoiceActivity, processAudioChunks]);

  const startPushToTalk = useCallback(async () => {
    if (!isActiveRef.current || isPushToTalkActiveRef.current) return;
    
    try {
      isPushToTalkActiveRef.current = true;
      
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
        await setupAudioAnalysis();
      }

      audioChunksRef.current = [];
      recordingStartTimeRef.current = Date.now();

      const mediaRecorder = new MediaRecorder(audioStreamRef.current, {
        mimeType: 'audio/webm;codecs=opus'
      });

      audioRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && isPushToTalkActiveRef.current) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length > 0) {
          await processAudioChunks();
        }
        isPushToTalkActiveRef.current = false;
        updateState({ isListening: false });
      };

      mediaRecorder.start();
      updateState({ isListening: true });
      
      toast.success('Recording...', {
        description: 'Release to send your message'
      });

    } catch (error) {
      console.error('Failed to start push-to-talk:', error);
      isPushToTalkActiveRef.current = false;
      updateState({ isListening: false });
    }
  }, [setupAudioAnalysis, updateState, processAudioChunks]);

  const stopPushToTalk = useCallback(() => {
    if (audioRecorderRef.current && isPushToTalkActiveRef.current) {
      audioRecorderRef.current.stop();
    }
  }, []);

  const initializeVoiceChat = useCallback(async (mode: 'continuous' | 'push-to-talk' = 'continuous') => {
    try {
      isActiveRef.current = true;
      updateState({ 
        isConnected: true, 
        canInterrupt: true, 
        listeningMode: mode 
      });
      
      // Create a local function to handle text-to-speech to avoid dependency issues
      const handleSpeech = async (text: string) => {
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
      };
      
      // Trigger SkAi greeting
      console.log('Triggering SkAi greeting...');
      updateState({ isSpeaking: true });
      
      try {
        const greetingResponse = await invokeEdge('ai-chat', {
          message: 'Hello! I just activated voice chat. Please greet me warmly and let me know you\'re ready to help.',
          conversationHistory: []
        });

        const greetingText = greetingResponse?.response;
        
        if (greetingText) {
          console.log('SkAi greeting:', greetingText);
          await handleSpeech(greetingText);
        } else {
          // Fallback greeting if AI doesn't respond
          await handleSpeech('Hello! SkAi is ready to help you. How can I assist you today?');
        }
      } catch (greetingError) {
        console.error('Failed to get SkAi greeting:', greetingError);
        // Fallback greeting
        await handleSpeech('Hello! SkAi voice interface is now active. How can I help you?');
      }
      
      if (mode === 'continuous') {
        await startContinuousListening();
        toast.success('Continuous voice mode activated', {
          description: 'SkAi is ready and listening!'
        });
      } else {
        toast.success('Push-to-talk mode activated', {
          description: 'SkAi is ready - hold the mic button to speak'
        });
      }

    } catch (error) {
      console.error('Failed to initialize voice chat:', error);
      toast.error('Voice chat initialization failed');
    }
  }, [startContinuousListening, updateState]);

  const disconnect = useCallback(() => {
    console.log('Disconnecting voice chat...');
    
    isActiveRef.current = false;
    isPushToTalkActiveRef.current = false;
    
    // Clear all timeouts
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }
    if (voiceActivityRef.current) {
      clearTimeout(voiceActivityRef.current);
      voiceActivityRef.current = null;
    }
    if (silenceDetectionRef.current) {
      clearTimeout(silenceDetectionRef.current);
      silenceDetectionRef.current = null;
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
      canInterrupt: false,
      isVoiceActivated: false,
      audioLevel: 0
    });
  }, [stopCurrentAudio, updateState]);

  return {
    state,
    settings,
    initializeVoiceChat,
    stopCurrentAudio,
    disconnect,
    speakText,
    updateSettings,
    startPushToTalk,
    stopPushToTalk
  };
}