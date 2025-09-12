import { useState, useRef, useCallback } from 'react';
import { invokeEdge } from '@/lib/invokeEdge';

export const useSkaiVoiceChat = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
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
  const startListening = useCallback(async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      setMediaStream(stream);
      setIsListening(true);

      // Create audio context for VAD
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let silenceCount = 0;
      let speechCount = 0;
      let isCurrentlyRecording = false;
      let currentRecorder: MediaRecorder | null = null;
      let audioChunks: Blob[] = [];

      const checkVoiceActivity = () => {
        if (!isListening) return;

        analyser.getByteFrequencyData(dataArray);
        
        // Calculate RMS (Root Mean Square) for voice activity
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i] * dataArray[i];
        }
        const rms = Math.sqrt(sum / bufferLength) / 255;

        if (rms > vadThreshold) {
          speechCount++;
          silenceCount = 0;

          // Start recording if we detect speech and aren't already recording
          if (!isCurrentlyRecording && speechCount > 3) {
            console.log('🎤 Voice detected - starting recording');
            isCurrentlyRecording = true;
            audioChunks = [];
            
            currentRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            
            currentRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                audioChunks.push(event.data);
              }
            };
            
            currentRecorder.onstop = async () => {
              if (audioChunks.length > 0) {
                setIsProcessing(true);
                try {
                  const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                  const transcribedText = await processAudioBlob(audioBlob);
                  if (transcribedText.trim()) {
                    // Trigger callback for seamless conversation
                    console.log('Transcribed text:', transcribedText);
                  }
                } catch (error) {
                  console.error('Error processing audio:', error);
                } finally {
                  setIsProcessing(false);
                }
              }
            };
            
            currentRecorder.start();
            setIsRecording(true);
          }
        } else {
          speechCount = 0;
          silenceCount++;

          // Stop recording if we detect silence for a while
          if (isCurrentlyRecording && silenceCount > 30) { // ~1 second of silence at 30fps
            console.log('🔇 Silence detected - stopping recording');
            isCurrentlyRecording = false;
            if (currentRecorder && currentRecorder.state === 'recording') {
              currentRecorder.stop();
            }
            setIsRecording(false);
          }
        }

        requestAnimationFrame(checkVoiceActivity);
      };

      checkVoiceActivity();
    } catch (error) {
      console.error('Error starting voice listening:', error);
      throw new Error('Failed to access microphone. Please ensure you have granted microphone permissions.');
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

  const speakText = useCallback(async (text: string, voice: string = 'alloy') => {
    try {
      setIsSpeaking(true);

      // Stop any currently playing audio
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      }

      const response = await invokeEdge('text-to-speech', {
        text,
        voice
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
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      setIsSpeaking(false);
      console.error('Error speaking text:', error);
      throw error;
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      setIsSpeaking(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
    setIsRecording(false);
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
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