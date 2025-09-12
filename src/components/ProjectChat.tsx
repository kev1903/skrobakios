import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { invokeEdge } from '@/lib/invokeEdge';
import { useToast } from '@/hooks/use-toast';
import { useSkaiVoiceChat } from '@/hooks/useSkaiVoiceChat';
import { VoiceUI } from './VoiceUI';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ProjectChatProps {
  projectId: string;
  projectName: string;
}

export const ProjectChat = ({ projectId, projectName }: ProjectChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hello! I'm your AI assistant for ${projectName}. I can help you with project management, answer questions about your WBS, tasks, costs, and more. How can I assist you today?`,
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const {
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
  } = useSkaiVoiceChat();

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText?: string, speakResponse: boolean = false) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: textToSend.trim(),
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await invokeEdge('ai-chat', {
        message: textToSend.trim(),
        conversation: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        context: {
          currentPage: 'project-control',
          projectId: projectId,
          projectName: projectName
        }
      });

      const responseText = response.response || response.message || 'Sorry, I encountered an error processing your request.';
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseText,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Speak the response if requested
      if (speakResponse && responseText) {
        try {
          await speakText(responseText);
        } catch (speechError) {
          console.error('Error speaking response:', speechError);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleVoiceRecording = async () => {
    try {
      if (!isVoiceMode) {
        // Enter voice mode
        setIsVoiceMode(true);
        
        // Start with greeting message
        try {
          await speakText("Hey Kevin, how can I help?");
        } catch (speechError) {
          console.error('Error speaking greeting:', speechError);
        }
        
        await startListening(handleVoiceTranscription);
      } else if (isListening) {
        // Exit voice mode
        stopListening();
        setIsVoiceMode(false);
      } else {
        // Start listening in voice mode
        await startListening(handleVoiceTranscription);
      }
    } catch (error) {
      console.error('Voice recording error:', error);
      toast({
        title: "Voice Error",
        description: error instanceof Error ? error.message : "Failed to process voice input",
        variant: "destructive",
      });
    }
  };

  // Handle seamless voice transcription callback
  const handleVoiceTranscription = async (transcribedText: string) => {
    if (transcribedText.trim()) {
      console.log('Processing voice input:', transcribedText);
      
      // Add user message to conversation
      const userMessage: Message = {
        id: Date.now().toString(),
        content: transcribedText.trim(),
        role: 'user',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);

      try {
        // Send to AI chat
        const response = await invokeEdge('ai-chat', {
          message: transcribedText.trim(),
          conversation: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          context: {
            currentPage: 'project-control',
            projectId: projectId,
            projectName: projectName
          }
        });

        const responseText = response.response || response.message || 'Sorry, I encountered an error processing your request.';
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: responseText,
          role: 'assistant',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Automatically speak the AI response
        try {
          await speakText(responseText);
        } catch (speechError) {
          console.error('Error speaking response:', speechError);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const exitVoiceMode = () => {
    stopListening();
    setIsVoiceMode(false);
  };

  const handleSpeakToggle = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      // Find the last assistant message and speak it
      const lastAssistantMessage = [...messages].reverse().find(msg => msg.role === 'assistant');
      if (lastAssistantMessage) {
        speakText(lastAssistantMessage.content).catch(error => {
          console.error('Error speaking message:', error);
          toast({
            title: "Speech Error",
            description: "Failed to speak message",
            variant: "destructive",
          });
        });
      }
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Render Voice UI when in voice mode
  if (isVoiceMode) {
    return (
      <VoiceUI
        projectName={projectName}
        isListening={isListening}
        isRecording={isRecording}
        isProcessing={isProcessing}
        isSpeaking={isSpeaking}
        onToggleListening={() => handleVoiceRecording()}
        onExit={exitVoiceMode}
        onToggleSpeaking={handleSpeakToggle}
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-background border-l border-border">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border bg-muted/50">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary text-primary-foreground">
              <Bot className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-sm">SkAi Assistant</h3>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                    SK
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div className={`max-w-[80%] ${message.role === 'user' ? 'order-1' : 'order-2'}`}>
                <div
                  className={`p-3 rounded-lg text-sm ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-auto'
                      : 'bg-muted'
                  }`}
                >
                  {message.content}
                </div>
                <div className={`text-xs text-muted-foreground mt-1 ${
                  message.role === 'user' ? 'text-right' : 'text-left'
                }`}>
                  {formatTime(message.timestamp)}
                </div>
              </div>

              {message.role === 'user' && (
                <Avatar className="w-8 h-8 flex-shrink-0 order-2">
                  <AvatarFallback className="bg-secondary">
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                  SK
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="flex-shrink-0 p-4 border-t border-border">
        <div className="space-y-3">
          {/* Top row: Chat input */}
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask SkAi about your construction project..."
            className="w-full text-sm"
            disabled={isLoading || isRecording || isProcessing}
          />
          
          {/* Second row: Buttons */}
          <div className="flex gap-2 justify-center">
            <Button 
              onClick={handleVoiceRecording}
              disabled={isLoading || isProcessing}
              size="sm"
              variant={isListening ? "default" : "outline"}
              className={`px-3 ${isListening ? "animate-pulse bg-primary text-primary-foreground" : ""}`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button 
              onClick={handleSpeakToggle}
              disabled={isLoading || messages.filter(m => m.role === 'assistant').length === 1}
              size="sm"
              variant={isSpeaking ? "secondary" : "outline"}
              className="px-3"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <Button 
              onClick={() => sendMessage()} 
              disabled={!input.trim() || isLoading || isRecording}
              size="sm"
              className="px-3"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {(isListening || isRecording || isProcessing) && (
          <div className="mt-2 text-xs text-muted-foreground text-center">
            {isListening && !isRecording && "🎧 Listening for voice... Speak naturally"}
            {isRecording && "🎤 Recording... Keep speaking"}
            {isProcessing && "🔄 Processing your voice..."}
          </div>
        )}
        {isSpeaking && (
          <div className="mt-2 text-xs text-muted-foreground text-center">
            🔊 Speaking... Click volume button to stop
          </div>
        )}
      </div>
    </div>
  );
};