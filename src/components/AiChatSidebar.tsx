import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Upload, User, MessageCircle, ChevronLeft, ChevronRight, AlertCircle, Mic, MicOff } from 'lucide-react';
import { useConversation } from '@11labs/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Alert, AlertDescription } from './ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AiChatAuth } from './AiChatAuth';
import { cn } from '@/lib/utils';
interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}
interface ContextData {
  currentPage: string;
  projectId?: string;
  visibleData?: any;
  userLocation?: string;
}
interface AiChatSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onNavigate?: (page: string) => void;
}
export function AiChatSidebar({
  isCollapsed,
  onToggleCollapse,
  onNavigate
}: AiChatSidebarProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const raw = localStorage.getItem('aiChatMessages');
      if (raw) {
        const parsed = JSON.parse(raw) as Array<{ id: string; content: string; role: 'user' | 'assistant'; timestamp: string | Date }>;
        return parsed.map(m => ({ ...m, timestamp: new Date(m.timestamp) }));
      }
    } catch (e) {
      console.error('Failed to load chat history', e);
    }
    return [];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const conversation = useConversation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    toast
  } = useToast();
  const location = useLocation();
  const {
    user,
    session,
    loading,
    isAuthenticated
  } = useAuth();

  // Get context from current route and screen
  const getScreenContext = (): ContextData => {
    const urlParams = new URLSearchParams(location.search);
    const currentPage = urlParams.get('page') || location.pathname;
    const projectId = urlParams.get('projectId');
    const visibleData: any = {};
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
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Persist chat messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('aiChatMessages', JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to persist chat history', e);
    }
  }, [messages]);

  // Fetch user profile when authenticated
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isAuthenticated && user) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('first_name, last_name, email')
            .eq('user_id', user.id)
            .single();

          if (error) {
            console.error('Error fetching user profile:', error);
            return;
          }

          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
    };

    fetchUserProfile();
  }, [isAuthenticated, user]);

  // Don't clear messages when authentication state changes - keep continuous
  useEffect(() => {
    if (!isAuthenticated) {
      setUserProfile(null);
    }
  }, [isAuthenticated]);

  // Add welcome message for authenticated users (only when first time or no messages)
  useEffect(() => {
    if (isAuthenticated && user && messages.length === 0) {
      const userName = (userProfile?.first_name && userProfile.first_name.trim().length > 0)
        ? userProfile.first_name
        : (user.email || 'there');
      
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        content: `Hello, ${userName}! How can I assist you today?`,
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isAuthenticated, user, userProfile]);
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);
    setAuthError(null);
    try {
      // Double-check authentication state before making API call
      if (!isAuthenticated || !session) {
        throw new Error('Authentication required');
      }
      const context = getScreenContext();
      const conversation = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      console.log('Sending AI chat request with session:', session.user.email);
      const {
        data,
        error
      } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: currentInput,
          conversation,
          context
        }
      });
      if (error) {
        console.error('Edge function error:', error);
        // Check if it's an HTTP error with status code
        if (error.message && error.message.includes('FunctionsHttpError')) {
          throw new Error('Authentication required');
        }
        throw new Error(error.message || 'Failed to get AI response');
      }
      if (data?.error) {
        console.error('Edge function returned error:', data);
        if (data.error === 'Authentication required' || data.error.includes('Authentication')) {
          throw new Error('Authentication required');
        }
        throw new Error(data.details || data.error);
      }
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
    } catch (error) {
      console.error('Error sending message:', error);
      let errorMessage = "Failed to send message";
      if (error instanceof Error) {
        if (error.message.includes('Authentication required') || error.message.includes('Please log in')) {
          setAuthError("Please log in to use the AI chat");
          errorMessage = "Please log in to use the AI chat";
          // Keep messages for continuous chat - don't clear them
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
        variant: "destructive"
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
      const {
        error: uploadError
      } = await supabase.storage.from('task-attachments').upload(filePath, file);
      if (uploadError) throw uploadError;
      const {
        data: {
          publicUrl
        }
      } = supabase.storage.from('task-attachments').getPublicUrl(filePath);
      const fileMessage: ChatMessage = {
        id: Date.now().toString(),
        content: `I've uploaded a file: [${file.name}](${publicUrl}). Please analyze this file and help me with any questions about it.`,
        role: 'user',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fileMessage]);
      setInput(`Please analyze the uploaded file: ${file.name}`);
      setTimeout(() => sendMessage(), 100);
      toast({
        title: "File uploaded",
        description: `${file.name} has been uploaded successfully`
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload file",
        variant: "destructive"
      });
    }
    event.target.value = '';
  };
  const handleVoiceConversation = async () => {
    if (conversation.status === "connected") {
      await conversation.endSession();
      toast({
        title: "Voice Conversation Ended",
        description: "Voice conversation has been disconnected"
      });
    } else {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        await conversation.startSession({ 
          agentId: "ds9lm1cEPy0f80uZAvFu"
        });
        toast({
          title: "Voice Conversation Started",
          description: "You can now speak with SkAi directly"
        });
      } catch (error) {
        console.error('Error starting voice conversation:', error);
        toast({
          title: "Voice Conversation Failed",
          description: "Failed to start voice conversation. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  return <div className={cn("fixed right-0 top-[var(--header-height)] h-[calc(100vh-var(--header-height))] bg-background border-l border-border shadow-lg transition-all duration-300 z-40 flex flex-col", isCollapsed ? "w-16" : "w-96")}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && <div className="min-w-0">
              <h3 className="font-semibold text-sm truncate">SkAi</h3>
              <p className="text-xs text-muted-foreground truncate">Construction Management AI</p>
            </div>}
        </div>
        <Button variant="ghost" size="sm" onClick={onToggleCollapse} className="h-8 w-8 p-0 flex-shrink-0">
          {isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>

      {/* Collapsed state */}
      {isCollapsed && <div className="flex-1 flex flex-col items-center pt-4">
          <Button variant="ghost" size="sm" onClick={onToggleCollapse} className="h-12 w-12 p-0 mb-4">
            <MessageCircle className="h-6 w-6" />
          </Button>
        </div>}

      {/* Expanded state */}
      {!isCollapsed && <>
          {/* Show auth component if not authenticated */}
          {!isAuthenticated && !loading && <AiChatAuth onNavigateToAuth={() => onNavigate?.('auth')} />}

          {/* Show loading state */}
          {loading && <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            </div>}

          {/* Show chat interface if authenticated */}
          {isAuthenticated && !loading && <>
              {/* Authentication status indicator */}
              {user && <div className="px-4 py-2 border-b border-border bg-muted/50">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-muted-foreground">
                      Signed in as {userProfile?.first_name && userProfile?.last_name 
                        ? `${userProfile.first_name} ${userProfile.last_name}` 
                        : user.email}
                    </span>
                  </div>
                </div>}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && <div className="text-center text-muted-foreground py-8">
                    <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Hello! I'm Skai, your AI assistant for Skrobaki.</p>
                    <p className="text-xs mt-1">I can help you with projects, tasks, scheduling, and more!</p>
                  </div>}
                
                {messages.map(message => <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.role === 'assistant' && <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback>
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>}
                    
                    <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                      <div className={`rounded-lg p-3 text-sm ${message.role === 'user' ? 'bg-primary text-primary-foreground ml-auto' : 'bg-muted'}`}>
                        {message.content}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 px-1">
                        {formatTime(message.timestamp)}
                      </p>
                    </div>

                    {message.role === 'user' && <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>}
                  </div>)}
                
                {isLoading && <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg p-3 text-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{
                  animationDelay: '0.1s'
                }} />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{
                  animationDelay: '0.2s'
                }} />
                      </div>
                    </div>
                  </div>}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="p-4 border-t border-border flex-shrink-0">
                <div className="flex gap-2">
                  <Button 
                    variant={conversation.status === "connected" ? "default" : "outline"} 
                    size="sm" 
                    onClick={handleVoiceConversation} 
                    className="flex-shrink-0" 
                    disabled={isLoading}
                  >
                    {conversation.status === "connected" ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Input value={input} onChange={e => setInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="Ask me anything about your projects..." className="flex-1" disabled={isLoading} />
                  <Button onClick={sendMessage} disabled={!input.trim() || isLoading || !isAuthenticated} size="sm" className="flex-shrink-0">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>}
        </>}
    </div>;
}