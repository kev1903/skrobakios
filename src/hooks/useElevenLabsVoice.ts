import { useConversation } from '@11labs/react';
import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UseElevenLabsVoiceProps {
  onMessage?: (message: string) => void;
  onStatusChange?: (status: 'connected' | 'disconnected') => void;
  onSpeakingChange?: (isSpeaking: boolean) => void;
  onListeningChange?: (isListening: boolean) => void;
}

export const useElevenLabsVoice = ({
  onMessage,
  onStatusChange,
  onSpeakingChange,
  onListeningChange
}: UseElevenLabsVoiceProps) => {
  const { user } = useAuth();
  const conversationIdRef = useRef<string | null>(null);

  const conversation = useConversation({
    onConnect: () => {
      console.log('ElevenLabs conversation connected');
      onStatusChange?.('connected');
    },
    onDisconnect: () => {
      console.log('ElevenLabs conversation disconnected');
      onStatusChange?.('disconnected');
      conversationIdRef.current = null;
    },
    onMessage: (message) => {
      console.log('ElevenLabs message received:', message);
      
      // Handle different message types
      if (message.type === 'user_transcript') {
        // User's speech was transcribed
        onMessage?.(message.message);
      } else if (message.type === 'agent_response') {
        // Agent's text response (for chat history)
        onMessage?.(message.message);
      }
    },
    onError: (error) => {
      console.error('ElevenLabs conversation error:', error);
    },
    // Client tools for integration with the app
    clientTools: {
      sendChatMessage: (parameters: { message: string }) => {
        console.log('Agent wants to send chat message:', parameters.message);
        onMessage?.(parameters.message);
        return "Message sent to chat";
      },
      getCurrentContext: () => {
        const context = {
          user: user?.email || 'Anonymous',
          currentPage: window.location.pathname,
          timestamp: new Date().toISOString()
        };
        console.log('Providing context to agent:', context);
        return JSON.stringify(context);
      }
    },
    overrides: {
      agent: {
        prompt: {
          prompt: `You are SkAi, an intelligent AI assistant integrated into a project management platform. 

PERSONALITY:
- Professional yet friendly and approachable
- Concise but thorough in responses
- Proactive in suggesting helpful actions
- Always maintain context of the current conversation

CAPABILITIES:
- Help with project management tasks
- Answer questions about the platform
- Provide guidance and suggestions
- Maintain conversation context from text chat

GUIDELINES:
- Keep responses conversational and natural for voice interaction
- Be concise but informative
- Ask clarifying questions when needed
- Reference previous conversation context when relevant
- Use the user's name when you know it: ${user?.email || 'there'}

CURRENT CONTEXT:
- User: ${user?.email || 'Anonymous'}
- Platform: Project Management System
- Mode: Voice Conversation

Respond naturally as if having a conversation with the user.`
        },
        firstMessage: `Hi ${user?.email ? user.email.split('@')[0] : 'there'}! I'm SkAi, your AI assistant. I can help you with your projects, answer questions, or just chat. What would you like to talk about?`,
        language: "en"
      },
      tts: {
        voiceId: "9BWtsMINqrJLrRacOk9x" // Aria voice
      }
    }
  });

  // Monitor speaking state
  useEffect(() => {
    onSpeakingChange?.(conversation.isSpeaking);
  }, [conversation.isSpeaking, onSpeakingChange]);

  const startConversation = useCallback(async () => {
    try {
      console.log('Starting ElevenLabs conversation...');
      
      // Request microphone access first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Get signed URL from our edge function
      const response = await fetch('https://xtawnkhvxgxylhxwqnmm.supabase.co/functions/v1/elevenlabs-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to get ElevenLabs signed URL');
      }
      
      const { signedUrl } = await response.json();
      
      // Start the conversation with the signed URL
      const conversationId = await conversation.startSession({ 
        url: signedUrl 
      });
      
      conversationIdRef.current = conversationId;
      console.log('ElevenLabs conversation started with ID:', conversationId);
      
      return conversationId;
    } catch (error) {
      console.error('Error starting ElevenLabs conversation:', error);
      throw error;
    }
  }, [conversation]);

  const endConversation = useCallback(async () => {
    try {
      console.log('Ending ElevenLabs conversation...');
      await conversation.endSession();
      conversationIdRef.current = null;
    } catch (error) {
      console.error('Error ending ElevenLabs conversation:', error);
    }
  }, [conversation]);

  const setVolume = useCallback(async (volume: number) => {
    try {
      await conversation.setVolume({ volume });
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  }, [conversation]);

  return {
    startConversation,
    endConversation,
    setVolume,
    status: conversation.status,
    isSpeaking: conversation.isSpeaking,
    conversationId: conversationIdRef.current
  };
};