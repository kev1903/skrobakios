import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Send, Bot, User, MessageCircle, ChevronLeft, ChevronRight, AlertCircle, Mic, MicOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Alert, AlertDescription } from './ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AiChatAuth } from './AiChatAuth';
// Lazy load the heavy voice interface to keep initial load fast and robust
const VoiceInterfaceLazy = React.lazy(() => import('./VoiceInterface').then(m => ({ default: m.VoiceInterface })));
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
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioRecorder, setAudioRecorder] = useState<MediaRecorder | null>(null);
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const chunkQueueRef = useRef<Blob[]>([]);
  const processingRef = useRef(false);
  const pendingTranscriptRef = useRef<string>('');
  const finalizeTimerRef = useRef<number | null>(null);
  const finalizingRef = useRef(false);
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
  const scrollToBottom = (instant = false) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: instant ? 'instant' : 'smooth',
        block: 'end'
      });
    }
  };

  // Auto-scroll when messages change
  useEffect(() => {
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages]);

  // Auto-scroll when loading state changes (for real-time response visibility)
  useEffect(() => {
    if (isLoading) {
      const timeoutId = setTimeout(scrollToBottom, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [isLoading]);

  // Auto-scroll when voice chat is active
  useEffect(() => {
    if (isVoiceActive) {
      const timeoutId = setTimeout(scrollToBottom, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [isVoiceActive]);

  // Auto-scroll when sidebar is expanded (not collapsed)
  useEffect(() => {
    if (!isCollapsed && messages.length > 0) {
      const timeoutId = setTimeout(scrollToBottom, 200);
      return () => clearTimeout(timeoutId);
    }
  }, [isCollapsed, messages.length]);

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
  const handleVoiceToggle = async () => {
    if (!audioRecorder) return;
    try {
      if (audioRecorder.state === 'recording') {
        audioRecorder.pause?.();
        setIsListening(false);
      } else if (audioRecorder.state === 'paused') {
        audioRecorder.resume?.();
        setIsListening(true);
      }
    } catch (e) {
      console.error('Failed to toggle recorder', e);
    }
  };

  // Queue-based background transcription while recording
  const enqueueChunk = (blob: Blob) => {
    chunkQueueRef.current.push(blob);
    if (!processingRef.current) void processQueue();
  };

  const finalizePending = async () => {
    // Prevent overlapping finalizations
    if (finalizingRef.current) return;

    // Stop any pending finalize timer
    if (finalizeTimerRef.current) {
      clearTimeout(finalizeTimerRef.current);
      finalizeTimerRef.current = null;
    }

    const text = pendingTranscriptRef.current.trim();
    if (!text) return;

    // Avoid sending tiny one-word artifacts like "you"
    if (text.split(/\s+/).length <= 1 && text.length < 4) {
      pendingTranscriptRef.current = '';
      return;
    }

    // Clear pending first to avoid duplicates on errors
    pendingTranscriptRef.current = '';

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: text,
      role: 'user',
      timestamp: new Date()
    };

    // Append message using functional update to avoid stale state
    setMessages(prev => [...prev, userMessage]);

    if (!isAuthenticated || !session) return;

    finalizingRef.current = true;
    setIsLoading(true);
    try {
      const context = getScreenContext();
      const conversation = [...messages, userMessage].map(msg => ({ role: msg.role, content: msg.content }));
      const { data: aiData, error: aiError } = await supabase.functions.invoke('ai-chat', {
        body: { message: text, conversation, context }
      });
      if (!aiError && aiData?.response) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: aiData.response,
          role: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (e) {
      console.error('AI send failed (finalizePending)', e);
    } finally {
      setIsLoading(false);
      finalizingRef.current = false;
    }
  };

  const processQueue = async () => {
    if (processingRef.current) return;
    processingRef.current = true;
    try {
      while (chunkQueueRef.current.length > 0) {
        const blob = chunkQueueRef.current.shift()!;
        // Convert to base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            try {
              const result = reader.result as string;
              const b64 = result.split(',')[1] || '';
              resolve(b64);
            } catch (err) {
              reject(err);
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        const { data, error } = await supabase.functions.invoke('voice-transcribe', {
          body: { audio: base64 }
        });

        if (error) {
          console.error('Transcription error (queue):', error);
          continue;
        }
        const partial = String(data?.text || '').trim();
        if (!partial) continue;

        // Accumulate and decide when to finalize
        pendingTranscriptRef.current += (pendingTranscriptRef.current ? ' ' : '') + partial;
        const endsSentence = /[.!?]$/.test(partial);

        // Reset a short inactivity timer to finalize when user pauses speaking
        if (finalizeTimerRef.current) clearTimeout(finalizeTimerRef.current);
        finalizeTimerRef.current = window.setTimeout(() => {
          if (pendingTranscriptRef.current.trim()) {
            void finalizePending();
          }
        }, 1200);

        // Also finalize immediately on clear sentence end or very long buffer
        if (endsSentence || pendingTranscriptRef.current.length > 120) {
          await finalizePending();
        }
      }
    } catch (err) {
      console.error('Error processing transcription queue', err);
    } finally {
      processingRef.current = false;
    }
  };

  const handleVoiceEnd = () => {
    try {
      if (audioRecorder) {
        if (audioRecorder.state === 'recording' || audioRecorder.state === 'paused') {
          audioRecorder.stop();
        }
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(t => t.stop());
        audioStreamRef.current = null;
      }
    } catch (e) {
      console.error('Error stopping voice', e);
    }
    if (websocket) {
      websocket.close();
    }
    // Clear any pending inactivity finalization
    if (finalizeTimerRef.current) {
      clearTimeout(finalizeTimerRef.current);
      finalizeTimerRef.current = null;
    }
    // Flush any remaining partial transcript
    void finalizePending();
    setIsVoiceActive(false);
    setIsListening(false);
    setIsSpeaking(false);
    setAudioRecorder(null);
    setWebsocket(null);
    
    // Force scroll to bottom when returning to chat
    setTimeout(() => scrollToBottom(true), 50);
  };

  const handleVoiceCommand = async () => {
    if (isVoiceActive) {
      handleVoiceEnd();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          // Enqueue chunk while still recording; processing happens in background
          enqueueChunk(e.data);
        }
      };

      recorder.onstop = () => {
        // Cleanup is handled in handleVoiceEnd
      };

      // Start with a timeslice to receive periodic chunks
      recorder.start(1500); // every 1.5s
      setAudioRecorder(recorder);
      setIsVoiceActive(true);
      setIsListening(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: 'Microphone Access Denied',
        description: 'Please allow microphone access to use voice commands',
        variant: 'destructive'
      });
    }
  };
  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  return (
    <>
      {/* Regular Chat Interface */}
      <div className={cn("fixed right-0 top-[var(--header-height)] h-[calc(100vh-var(--header-height))] bg-background border-l border-border shadow-lg transition-all duration-300 z-40 flex flex-col", isCollapsed ? "w-16" : "w-96")}>
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

                {/* Messages or Voice Interface */}
                {isVoiceActive ? (
                  <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                    <VoiceInterfaceLazy
                      isActive={isVoiceActive}
                      isListening={isListening}
                      isSpeaking={isSpeaking}
                      onToggle={handleVoiceToggle}
                      onEnd={handleVoiceEnd}
                    />
                  </Suspense>
                ) : (
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
                )}

                {/* Input area - hide when voice is active */}
                {!isVoiceActive && (
                  <div className="p-4 border-t border-border flex-shrink-0">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleVoiceCommand} 
                        className="flex-shrink-0" 
                        disabled={isLoading}
                      >
                        <Mic className="h-4 w-4" />
                      </Button>
                      <Input value={input} onChange={e => setInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="Ask me anything about your projects..." className="flex-1" disabled={isLoading} />
                      <Button onClick={sendMessage} disabled={!input.trim() || isLoading || !isAuthenticated} size="sm" className="flex-shrink-0">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>}
          </>}
      </div>
    </>
  );
}