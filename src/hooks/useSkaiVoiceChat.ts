import { useState, useRef, useCallback } from 'react';
import { invokeEdge } from '@/lib/invokeEdge';

export const useSkaiVoiceChat = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

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

  return {
    isRecording,
    isProcessing,
    isSpeaking,
    startRecording,
    stopRecording,
    speakText,
    stopSpeaking
  };
};