import { useState, useRef, useCallback, useEffect } from 'react';
import { useConversation } from '@elevenlabs/react';
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

  const connectedToastShownRef = useRef(false);
  const startInProgressRef = useRef(false);
  const hasStartedRef = useRef(false);

  const conversation = useConversation({
    onConnect: () => {
      console.log('ElevenLabs conversation connected');
      setState(prev => ({ ...prev, isConnected: true }));
      if (!connectedToastShownRef.current) {
        toast.success('Voice chat connected', {
          description: 'ElevenLabs AI is ready to talk!'
        });
        connectedToastShownRef.current = true;
      }
    },
    onDisconnect: () => {
      console.log('ElevenLabs conversation disconnected');
      hasStartedRef.current = false;
      startInProgressRef.current = false;
      setState(prev => ({ 
        ...prev, 
        isConnected: false, 
        isListening: false, 
        isSpeaking: false,
        isProcessing: false 
      }));
      connectedToastShownRef.current = false;
    },
    onMessage: (message) => {
      console.log('ElevenLabs message:', message);
    },
    onError: (error) => {
      console.error('ElevenLabs error:', error);
      toast.error('Voice chat error', {
        description: 'Connection failed. Please try again.'
      });
      setState(prev => ({ 
        ...prev, 
        isConnected: false, 
        isListening: false, 
        isSpeaking: false,
        isProcessing: false 
      }));
    }
  });

  const updateState = useCallback((updates: Partial<VoiceChatState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const initializeVoiceChat = useCallback(async () => {
    if (startInProgressRef.current) {
      console.log('Voice chat start already in progress');
      return;
    }
    if (state.isConnected || conversation.status === 'connected') {
      console.log('Voice chat already connected');
      return;
    }
    startInProgressRef.current = true;
    try {
      console.log('Initializing ElevenLabs voice chat...');
      
      // Get signed URL from our edge function
      const { signedUrl } = await invokeEdge('elevenlabs-auth', {});
      console.log('Got signed URL from ElevenLabs');
      
      // Start the conversation with the signed URL
      await (conversation as any).startSession({ url: signedUrl });
      hasStartedRef.current = true;
      console.log('ElevenLabs conversation started');
      
    } catch (error) {
      console.error('Failed to initialize ElevenLabs voice chat:', error);
      toast.error('Voice chat initialization failed', {
        description: 'Please check your ElevenLabs connection.'
      });
      setState(prev => ({ ...prev, isConnected: false }));
    } finally {
      startInProgressRef.current = false;
    }
  }, [conversation, state.isConnected]);

  const stopCurrentAudio = useCallback(() => {
    // ElevenLabs handles audio interruption internally
    console.log('Interrupting current audio playback');
  }, []);

  const disconnect = useCallback(async () => {
    try {
      console.log('Disconnecting ElevenLabs voice chat...');
      await conversation.endSession();
      setState(prev => ({ 
        ...prev, 
        isConnected: false, 
        isListening: false, 
        isSpeaking: false,
        isProcessing: false 
      }));
    } catch (error) {
      console.error('Error disconnecting:', error);
    } finally {
      hasStartedRef.current = false;
      startInProgressRef.current = false;
    }
  }, [conversation]);

  const speakText = useCallback(async (text: string) => {
    // ElevenLabs handles TTS through the conversation
    console.log('Speaking text via ElevenLabs:', text);
  }, []);

  // Update state based on ElevenLabs conversation status
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isListening: conversation.status === 'connected' && !conversation.isSpeaking,
      isSpeaking: conversation.isSpeaking || false,
      isProcessing: false, // ElevenLabs handles processing internally
      canInterrupt: conversation.isSpeaking || false
    }));
  }, [conversation.status, conversation.isSpeaking]);

  return {
    state,
    initializeVoiceChat,
    stopCurrentAudio,
    disconnect,
    speakText
  };
}