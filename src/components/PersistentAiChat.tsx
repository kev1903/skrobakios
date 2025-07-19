import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, X, Minimize2, Maximize2, Upload, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAiSync } from '@/hooks/useAiSync';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ContextData {
  currentPage: string;
  projectId?: string;
  visibleData?: any;
  userLocation?: string;
}

export function PersistentAiChat() {
  const [isOpen, setIsOpen] = useState(false); // Always start closed
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { triggerAiUpdate } = useAiSync();

  // Get context from current route and screen
  const getScreenContext = (): ContextData => {
    const urlParams = new URLSearchParams(location.search);
    const currentPage = urlParams.get('page') || location.pathname;
    const projectId = urlParams.get('projectId');
    
    // Detect screen-specific data that might be visible
    const visibleData: any = {};
    
    // Add context based on current page
    if (currentPage?.includes('project-detail') && projectId) {
      visibleData.projectFocus = projectId;
      visibleData.screenType = 'project_dashboard';
    } else if (currentPage?.includes('schedule')) {
      visibleData.screenType = 'schedule_view';
    } else if (currentPage?.includes('tasks')) {
      visibleData.screenType = 'task_management';
    } else if (currentPage?.includes('dashboard')) {
      visibleData.screenType = 'main_dashboard';
    }

    return {
      currentPage: currentPage || 'unknown',
      projectId: projectId || undefined,
      visibleData,
      userLocation: location.pathname + location.search
    };
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isOpen && hasNewMessage) {
      const timer = setTimeout(() => setHasNewMessage(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, hasNewMessage]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Check if user is authenticated using auth context
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }

      // Get current session to debug auth issues
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      console.log('Current session status:', currentSession ? 'Valid' : 'No session');
      console.log('Session token exists:', currentSession?.access_token ? 'Yes' : 'No');

      if (!currentSession) {
        throw new Error('No valid session found. Please log in again.');
      }

      const context = getScreenContext();
      const conversation = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: input,
          conversation,
          context
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to get AI response');
      }

      // Check if the response contains an error (edge function returns 200 with error details)
      if (data.error) {
        throw new Error(data.details || data.error);
      }

      // Validate that we have a proper response
      if (!data.response || typeof data.response !== 'string') {
        throw new Error('Invalid response format from AI service');
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Check if AI response includes command execution confirmation
      if (data.response.includes('✅ **Command executed successfully:**')) {
        console.log('AI command detected - triggering timeline update');
        triggerAiUpdate();
      }
      
      if (!isOpen) {
        setHasNewMessage(true);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      // More specific error handling
      let errorMessage = "Failed to send message";
      if (error instanceof Error) {
        if (error.message.includes('Authentication required')) {
          errorMessage = "Please log in to use the AI chat";
        } else if (error.message.includes('AI service temporarily unavailable')) {
          errorMessage = "AI service is temporarily unavailable. Please try again in a moment.";
        } else if (error.message.includes('AI service is not configured')) {
          errorMessage = "AI service is not configured. Please contact support.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "AI Chat Error",
        description: errorMessage,
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `chat-uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('task-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('task-attachments')
        .getPublicUrl(filePath);

      const fileMessage: ChatMessage = {
        id: Date.now().toString(),
        content: `I've uploaded a file: [${file.name}](${publicUrl}). Please analyze this file and help me with any questions about it.`,
        role: 'user',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, fileMessage]);
      
      // Auto-send the file message to AI
      setInput(`Please analyze the uploaded file: ${file.name}`);
      setTimeout(() => sendMessage(), 100);

      toast({
        title: "File uploaded",
        description: `${file.name} has been uploaded successfully`,
      });

    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload file",
        variant: "destructive",
      });
    }

    event.target.value = '';
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Chat bubble component
  if (!isOpen && !isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-[9999]">
        <Button
          onClick={() => setIsOpen(true)}
          className={`relative h-14 w-14 rounded-full shadow-lg transition-all duration-200 hover:scale-110 ${
            hasNewMessage 
              ? 'bg-gradient-to-r from-primary to-primary-glow animate-pulse' 
              : 'bg-primary hover:bg-primary/90'
          }`}
        >
          <Bot className="h-6 w-6 text-primary-foreground" />
          {hasNewMessage && (
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-destructive rounded-full flex items-center justify-center">
              <div className="h-2 w-2 bg-destructive-foreground rounded-full" />
            </div>
          )}
        </Button>
      </div>
    );
  }

  return (
    <Card className={`fixed bottom-6 right-6 z-[9999] shadow-elegant transition-all duration-300 ${
      isMinimized 
        ? 'w-80 h-14' 
        : 'w-96 h-[500px]'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-sm">Skai AI Assistant</h3>
            <p className="text-xs text-muted-foreground">Construction Management AI</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-8 w-8 p-0"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chat content - only show when not minimized */}
      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[350px]">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Hello! I'm Skai, your AI assistant for Skrobaki.</p>
                <p className="text-xs mt-1">I can help you with projects, tasks, scheduling, and more!</p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                  <div
                    className={`rounded-lg p-3 text-sm ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-muted'
                    }`}
                  >
                    {message.content}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 px-1">
                    {formatTime(message.timestamp)}
                  </p>
                </div>

                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg p-3 text-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0"
              >
                <Upload className="h-4 w-4" />
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your projects..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                size="sm"
                className="flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}