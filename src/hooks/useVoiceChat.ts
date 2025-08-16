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

  const conversation = useConversation({
    onConnect: () => {
      console.log('ElevenLabs conversation connected');
      setState(prev => ({ ...prev, isConnected: true }));
      toast.success('Voice chat connected', {
        description: 'ElevenLabs AI is ready to talk!'
      });
    },
    onDisconnect: () => {
      console.log('ElevenLabs conversation disconnected');
      setState(prev => ({ 
        ...prev, 
        isConnected: false, 
        isListening: false, 
        isSpeaking: false,
        isProcessing: false 
      }));
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
    try {
      console.log('Initializing ElevenLabs voice chat...');
      
      // Get signed URL from our edge function
      const { signedUrl } = await invokeEdge('elevenlabs-auth', {});
      console.log('Got signed URL from ElevenLabs');
      
      // Start the conversation with the signed URL
      await conversation.startSession({ signedUrl });
      console.log('ElevenLabs conversation started');
      
    } catch (error) {
      console.error('Failed to initialize ElevenLabs voice chat:', error);
      toast.error('Voice chat initialization failed', {
        description: 'Please check your ElevenLabs connection.'
      });
      setState(prev => ({ ...prev, isConnected: false }));
    }
  }, [conversation]);

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