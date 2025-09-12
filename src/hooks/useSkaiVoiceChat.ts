import { useState, useRef, useCallback } from 'react';
import { invokeEdge } from '@/lib/invokeEdge';

interface SpeechQueueItem {
  text: string;
  voice: string;
  id: string;
}

export const useSkaiVoiceChat = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const speechQueueRef = useRef<SpeechQueueItem[]>([]);
  const isProcessingSpeechRef = useRef(false);
  const vadThreshold = 0.01;

  // Process audio blob for transcription
  const processAudioBlob = useCallback(async (audioBlob: Blob): Promise<string> => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onloadend = async () => {
        try {
          const base64Audio = (reader.result as string).split(',')[1];
          
          const response = await invokeEdge('voice-transcribe', {
            audio: base64Audio
          });

          if (response.error) {
            throw new Error(response.error);
          }

          resolve(response.text || '');
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsDataURL(audioBlob);
    });
  }, []);

  // Seamless voice activation detection
  const startListening = useCallback(async (onTranscription?: (text: string) => void): Promise<void> => {
    try {
      console.log('🎤 Starting voice listening...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      console.log('🎤 Microphone access granted');
      setMediaStream(stream);
      setIsListening(true);

      // Create audio context for VAD
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.3;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let silenceCount = 0;
      let speechCount = 0;
      let isCurrentlyRecording = false;
      let currentRecorder: MediaRecorder | null = null;
      let audioChunks: Blob[] = [];
      let isActive = true;

      const vadThresholdAdjusted = 30; // Lowered threshold for better detection

      const checkVoiceActivity = () => {
        if (!isActive) {
          console.log('🔇 Voice activity check stopped');
          return;
        }

        analyser.getByteFrequencyData(dataArray);
        
        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;

        // Debug voice levels every 30 frames (~1 second)
        if (Math.random() < 0.03) {
          console.log('🔊 Voice level:', average, 'Threshold:', vadThresholdAdjusted);
        }

        if (average > vadThresholdAdjusted) {
          speechCount++;
          silenceCount = 0;

          // Start recording if we detect speech and aren't already recording
          if (!isCurrentlyRecording && speechCount > 3) { // Reduced from 5 to 3 for faster detection
            console.log('🎤 Voice detected - starting recording (level:', average, 'speech count:', speechCount, ')');
            isCurrentlyRecording = true;
            audioChunks = [];
            speechCount = 0; // Reset counter
            
            try {
              currentRecorder = new MediaRecorder(stream, { 
                mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
                  ? 'audio/webm;codecs=opus' 
                  : 'audio/webm' 
              });
              
              currentRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                  audioChunks.push(event.data);
                }
              };
              
              currentRecorder.onstop = async () => {
                console.log('🎤 Recording stopped, processing audio...');
                if (audioChunks.length > 0) {
                  setIsProcessing(true);
                  try {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    console.log('🔄 Audio blob size:', audioBlob.size, 'bytes');
                    const transcribedText = await processAudioBlob(audioBlob);
                    console.log('📝 Transcribed text:', transcribedText);
                    if (transcribedText.trim() && onTranscription) {
                      onTranscription(transcribedText);
                    }
                  } catch (error) {
                    console.error('❌ Error processing audio:', error);
                  } finally {
                    setIsProcessing(false);
                  }
                }
                // Continue listening after processing - don't stop the VAD loop
                console.log('🎧 Ready for next voice input...');
              };
              
              currentRecorder.start(100);
              setIsRecording(true);
            } catch (error) {
              console.error('❌ Error starting MediaRecorder:', error);
            }
          }
        } else {
          speechCount = 0;
          silenceCount++;

          // Stop recording if we detect silence for a while
          if (isCurrentlyRecording && silenceCount > 30) { // Increased to ~1 second of silence
            console.log('🔇 Silence detected - stopping recording (after', silenceCount, 'silent frames)');
            isCurrentlyRecording = false;
            if (currentRecorder && currentRecorder.state === 'recording') {
              currentRecorder.stop();
            }
            setIsRecording(false);
            // Reset counters for next detection
            speechCount = 0;
            silenceCount = 0;
          }
        }

        requestAnimationFrame(checkVoiceActivity);
      };

      // Store cleanup function
      const cleanup = () => {
        isActive = false;
        if (currentRecorder && currentRecorder.state === 'recording') {
          currentRecorder.stop();
        }
        if (audioContext.state !== 'closed') {
          audioContext.close();
        }
      };

      // Store cleanup in ref for later use
      (stream as any)._cleanup = cleanup;

      checkVoiceActivity();
      console.log('🎧 Voice activity detection started');

    } catch (error) {
      console.error('❌ Error starting voice listening:', error);
      setIsListening(false);
      throw new Error('Failed to access microphone. Please ensure you have granted microphone permissions and try again.');
    }
  }, [processAudioBlob, isListening]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.start(100); // Collect data every 100ms
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      throw new Error('Failed to start recording. Please check microphone permissions.');
    }
  }, []);

  const stopRecording = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorderRef.current) {
        reject(new Error('No recording in progress'));
        return;
      }

      mediaRecorderRef.current.onstop = async () => {
        try {
          setIsRecording(false);
          setIsProcessing(true);

          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // Convert to base64
          const reader = new FileReader();
          reader.onloadend = async () => {
            try {
              const base64Audio = (reader.result as string).split(',')[1];
              
              // Send to transcription service
              const response = await invokeEdge('voice-transcribe', {
                audio: base64Audio
              });

              if (response.error) {
                throw new Error(response.error);
              }

              setIsProcessing(false);
              resolve(response.text || '');
            } catch (error) {
              setIsProcessing(false);
              reject(error);
            }
          };
          reader.readAsDataURL(audioBlob);

          // Clean up media stream
          if (mediaRecorderRef.current?.stream) {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
          }
        } catch (error) {
          setIsProcessing(false);
          reject(error);
        }
      };

      mediaRecorderRef.current.stop();
    });
  }, []);

  // Process the speech queue
  const processSpeechQueue = useCallback(async () => {
    if (isProcessingSpeechRef.current || speechQueueRef.current.length === 0) {
      return;
    }

    isProcessingSpeechRef.current = true;
    setIsSpeaking(true);

    const queueItem = speechQueueRef.current.shift()!;
    console.log(`🗣️ Processing speech queue item: "${queueItem.text.substring(0, 50)}..."`);

    try {
      // Stop any currently playing audio
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      }

      const response = await invokeEdge('text-to-speech', {
        text: queueItem.text,
        voice: queueItem.voice
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // Create audio element and play
      const audioBlob = new Blob([
        Uint8Array.from(atob(response.audioContent), c => c.charCodeAt(0))
      ], { type: 'audio/mp3' });
      
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      currentAudioRef.current = audio;

      audio.onended = () => {
        console.log('🗣️ Speech finished, checking for next item in queue');
        URL.revokeObjectURL(audioUrl);
        isProcessingSpeechRef.current = false;
        
        // Check if there are more items in the queue
        if (speechQueueRef.current.length > 0) {
          // Process next item
          processSpeechQueue();
        } else {
          // Queue is empty, stop speaking
          setIsSpeaking(false);
        }
      };

      audio.onerror = () => {
        console.error('🗣️ Audio playback error');
        URL.revokeObjectURL(audioUrl);
        isProcessingSpeechRef.current = false;
        
        // Continue with next item or stop
        if (speechQueueRef.current.length > 0) {
          processSpeechQueue();
        } else {
          setIsSpeaking(false);
        }
      };

      await audio.play();
    } catch (error) {
      console.error('🗣️ Error processing speech queue:', error);
      isProcessingSpeechRef.current = false;
      
      // Continue with next item or stop
      if (speechQueueRef.current.length > 0) {
        processSpeechQueue();
      } else {
        setIsSpeaking(false);
      }
    }
  }, []);

  const speakText = useCallback(async (text: string, voice: string = 'alloy') => {
    const queueItem: SpeechQueueItem = {
      text,
      voice,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    };

    console.log(`🗣️ Adding to speech queue: "${text.substring(0, 50)}..." (Queue length: ${speechQueueRef.current.length})`);
    
    // Add to queue
    speechQueueRef.current.push(queueItem);
    
    // Start processing if not already processing
    processSpeechQueue();
  }, [processSpeechQueue]);

  const stopSpeaking = useCallback(() => {
    console.log('🗣️ Stopping speech and clearing queue');
    
    // Clear the speech queue
    speechQueueRef.current = [];
    isProcessingSpeechRef.current = false;
    
    // Stop current audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }
    
    setIsSpeaking(false);
  }, []);

  const stopListening = useCallback(() => {
    console.log('🔇 Stopping voice listening...');
    setIsListening(false);
    setIsRecording(false);
    if (mediaStream) {
      // Call cleanup function if available
      if ((mediaStream as any)._cleanup) {
        (mediaStream as any)._cleanup();
      }
      mediaStream.getTracks().forEach(track => {
        console.log('🔇 Stopping track:', track.kind);
        track.stop();
      });
      setMediaStream(null);
    }
  }, [mediaStream]);

  return {
    isRecording,
    isProcessing,
    isSpeaking,
    isListening,
    startRecording,
    stopRecording,
    startListening,
    stopListening,
    speakText,
    stopSpeaking
  };
};