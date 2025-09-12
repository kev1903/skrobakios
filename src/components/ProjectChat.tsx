import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Mic, MicOff, Volume2, VolumeX, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { invokeEdge } from '@/lib/invokeEdge';
import { useToast } from '@/hooks/use-toast';
import { useSkaiVoiceChat } from '@/hooks/useSkaiVoiceChat';
import { VoiceUI } from './VoiceUI';
import { supabase } from '@/integrations/supabase/client';

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
  // Project-specific message storage key
  const storageKey = `projectChat_${projectId}`;
  
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      // Try to load project-specific conversation history
      const raw = localStorage.getItem(storageKey);
      console.log(`Loading messages for project ${projectId}:`, raw ? 'Found saved messages' : 'No saved messages');
      
      if (raw) {
        const parsed = JSON.parse(raw) as Array<{ id: string; content: string; role: 'user' | 'assistant'; timestamp: string | Date }>;
        
        // Return parsed messages with proper timestamp conversion (removed non-English filtering)
        if (parsed.length > 0) {
          const restoredMessages = parsed.map(m => ({ ...m, timestamp: new Date(m.timestamp) }));
          console.log(`Restored ${restoredMessages.length} messages for project ${projectId}`);
          return restoredMessages;
        }
      }
    } catch (e) {
      console.error('Failed to load project chat history for', projectId, e);
      // Clear corrupted localStorage for this project
      localStorage.removeItem(storageKey);
    }
    
    // Return default welcome message if no history exists
    const welcomeMessage = {
      id: 'welcome',
      content: `Hello! I'm SkAI, your AI assistant for ${projectName}. I can help you with project management, answer questions about your WBS, tasks, costs, and more. How can I assist you today?`,
      role: 'assistant' as const,
      timestamp: new Date()
    };
    console.log(`Created welcome message for project ${projectId}`);
    return [welcomeMessage];
  });

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 1) { // Don't save just the welcome message
      try {
        console.log(`Saving ${messages.length} messages for project ${projectId}`);
        localStorage.setItem(storageKey, JSON.stringify(messages));
      } catch (e) {
        console.error('Failed to save messages for', projectId, e);
      }
    }
  }, [messages, storageKey, projectId]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    
    // Check file size (20MB limit)
    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 20MB",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedFile(file);
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const sendMessage = async (messageText?: string, speakResponse: boolean = false) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() && !selectedFile) return;
    if (isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: textToSend.trim() || `[File: ${selectedFile?.name}]`,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let messageToSend = textToSend.trim();
      let imageData = null;
      let documentContent = null;

      // Handle file upload
      if (selectedFile) {
        if (selectedFile.type.startsWith('image/')) {
          // Convert image to base64 for AI processing
          const reader = new FileReader();
          await new Promise((resolve) => {
            reader.onload = (e) => {
              imageData = e.target?.result as string;
              resolve(true);
            };
            reader.readAsDataURL(selectedFile);
          });
        } else if (selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf')) {
          // Parse PDF document for AI analysis using edge function
          try {
            console.log('Extracting PDF content:', selectedFile.name);
            
            const formData = new FormData();
            formData.append('file', selectedFile);
            
            const extractResponse = await invokeEdge('extract-document', formData);
            
            if (extractResponse?.success && extractResponse?.content) {
              documentContent = extractResponse.content;
              console.log('Successfully extracted PDF content:', documentContent.substring(0, 200));
              
              // Enhance the message with document context
              messageToSend = `${textToSend.trim()}

[PDF Document Analysis]
Document: ${selectedFile.name}

${documentContent}`;
            } else {
              console.warn('Failed to extract PDF content:', extractResponse?.error);
              messageToSend = `${textToSend.trim()}\n\n[PDF Document: ${selectedFile.name}] - Note: Could not extract text content for analysis. This might be a scanned document or technical drawing.`;
            }
          } catch (pdfError) {
            console.error('Error extracting PDF:', pdfError);
            messageToSend = `${textToSend.trim()}\n\n[PDF Document: ${selectedFile.name}] - Note: Error processing PDF document. Please ensure the file is not corrupted.`;
          }
        }
        
        // Add basic file context to message if no specific processing was done
        if (!imageData && !documentContent) {
          messageToSend = `${textToSend.trim()}\n\n[File uploaded: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)}KB)]`;
        }
        
        // Clear selected file after use
        removeSelectedFile();
      }

      // Check if the message contains database operation keywords
      const dbOperationKeywords = [
        'add', 'create', 'insert', 'update', 'modify', 'change', 'edit', 
        'delete', 'remove', 'set', 'move', 'rename', 'copy'
      ];
      
      const containsDbOperation = dbOperationKeywords.some(keyword => 
        messageToSend.toLowerCase().includes(keyword)
      );

      if (containsDbOperation && !imageData) {
        // First try the database operation (only for text-only requests)
        try {
          const dbResult = await invokeEdge('skai-database-operations', {
            prompt: messageToSend,
            projectId: projectId,
            context: {
              currentPage: 'project-control',
              projectId: projectId,
              projectName: projectName
            }
          });

          if (dbResult?.success) {
            // Database operation successful, get AI to confirm the change
            const confirmationPrompt = `Database operation completed successfully: ${dbResult.explanation}. 
            Operation: ${dbResult.operation} 
            Table: ${dbResult.table}
            Records affected: ${dbResult.recordsAffected}
            
            Please provide a brief, structured confirmation of what was changed.`;

            const aiResponse = await invokeEdge('ai-chat', {
              message: confirmationPrompt,
              conversation: messages.slice(-5).map(msg => ({
                role: msg.role,
                content: msg.content
              })),
              context: {
                currentPage: 'project-control',
                projectId: projectId,
                projectName: projectName
              }
            });

            const responseText = aiResponse.response || aiResponse.message || 'Database operation completed successfully.';
            
            const assistantMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: responseText,
              role: 'assistant',
              timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
            return;
          }
        } catch (dbError) {
          console.log('Database operation failed, falling back to regular AI chat:', dbError);
          // Fall through to regular AI chat
        }
      }

      // Regular AI chat (fallback or non-db operations, or when file is attached)
      const response = await invokeEdge('ai-chat', {
        message: messageToSend,
        imageData: imageData,
        documentContent: documentContent,
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
      if (input.trim() || selectedFile) {
        sendMessage();
      }
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
          documentContent: null, // Voice interactions don't typically include documents
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Bot className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-sm">SkAi Assistant</h3>
              <p className="text-xs text-muted-foreground">Project: {projectName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => {
                localStorage.removeItem(storageKey);
                setMessages([{
                  id: 'welcome',
                  content: `Hello! I'm SkAI, your AI assistant for ${projectName}. I can help you with project management, answer questions about your WBS, tasks, costs, and more. How can I assist you today?`,
                  role: 'assistant',
                  timestamp: new Date()
                }]);
                toast({
                  title: "Conversation cleared",
                  description: `Cleared conversation history for ${projectName}`
                });
              }}
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground"
              title="Clear conversation history"
            >
              Clear
            </Button>
            {messages.length > 1 && (
              <div className="text-xs text-green-600 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                Saved
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea 
        ref={scrollAreaRef} 
        className="flex-1 p-4 relative"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Drag and drop overlay for chat area */}
        {isDragging && (
          <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-primary" />
              <p className="text-lg font-medium text-primary mb-2">Drop files to chat with SkAI</p>
              <p className="text-sm text-muted-foreground">Supports PDF, DOC, DOCX, JPG, PNG, DWG files up to 20MB</p>
            </div>
          </div>
        )}
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
      <div className="flex-shrink-0 p-4 border-t border-border relative"
           onDrop={handleDrop}
           onDragOver={handleDragOver}
           onDragLeave={handleDragLeave}>
        <div className="space-y-3">
          {/* File upload area */}
          {selectedFile && (
            <div className="bg-muted p-3 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)}KB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeSelectedFile}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
          
          {/* Drag and drop overlay */}
          {isDragging && (
            <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center z-10">
              <div className="text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium text-primary">Drop files here</p>
              </div>
            </div>
          )}
          
          {/* Chat input */}
          <div className="relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={selectedFile ? `Ask SkAi about ${selectedFile.name}...` : "Ask SkAi about your construction project..."}
              className="w-full text-sm"
              disabled={isLoading || isRecording || isProcessing}
            />
            
            {/* File input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple={false}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.dwg,.txt,.csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2 justify-center">
            {/* Upload button */}
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="sm"
              disabled={isLoading || isRecording || isProcessing}
              className="px-3"
              title="Upload document"
            >
              <Upload className="w-4 h-4" />
            </Button>
            
            {/* Voice button */}
            <Button 
              onClick={handleVoiceRecording}
              disabled={isLoading || isProcessing}
              size="sm"
              variant={isListening ? "default" : "outline"}
              className={`px-3 ${isListening ? "animate-pulse bg-primary text-primary-foreground" : ""}`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            
            {/* Speak button */}
            <Button 
              onClick={handleSpeakToggle}
              disabled={isLoading || messages.filter(m => m.role === 'assistant').length === 1}
              size="sm"
              variant={isSpeaking ? "secondary" : "outline"}
              className="px-3"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            
            {/* Send button */}
            <Button 
              onClick={() => sendMessage()} 
              disabled={(!input.trim() && !selectedFile) || isLoading || isRecording}
              size="sm"
              className="px-3"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
        </div>
        
        {/* Voice status indicators */}
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