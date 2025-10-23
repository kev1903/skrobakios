import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles, X, Minimize2, Trash2, AlertCircle, Upload, FileText } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { useSkaiDatabaseOperations } from '@/hooks/useSkaiDatabaseOperations';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  suggestion?: {
    prompt: string;
    implemented?: boolean;
  };
}

interface DocumentChatBarProps {
  documentId?: string;
  documentName?: string;
  documentContent?: string;
  isOpen: boolean;
  onClose: () => void;
  currentPage?: string;
  currentTab?: string;
  selectedCategory?: string;
  projectId?: string;
  projectName?: string;
}

export const DocumentChatBar = ({ 
  documentId, 
  documentName, 
  documentContent, 
  isOpen, 
  onClose,
  currentPage,
  currentTab,
  selectedCategory,
  projectId,
  projectName
}: DocumentChatBarProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { executeOperation, isExecuting } = useSkaiDatabaseOperations();

  // Generate unique conversation key based on module and project
  const conversationKey = `skai-conversation-${currentTab?.toLowerCase() || 'general'}-${projectId || 'global'}`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load conversation from localStorage on mount or when key changes
  useEffect(() => {
    try {
      const savedConversation = localStorage.getItem(conversationKey);
      if (savedConversation) {
        const parsed = JSON.parse(savedConversation);
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
        console.log(`Loaded ${messagesWithDates.length} messages for ${conversationKey}`);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      setMessages([]);
    }
  }, [conversationKey]);

  // Save conversation to localStorage when messages change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(conversationKey, JSON.stringify(messages));
        console.log(`Saved ${messages.length} messages to ${conversationKey}`);
      } catch (error) {
        console.error('Error saving conversation:', error);
      }
    }
  }, [messages, conversationKey]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const processDocument = async (file: File) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content: `📎 Uploaded: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const isTextFile = ['txt', 'md', 'csv', 'json', 'xml'].includes(fileExtension || '');
      
      let documentContent = '';

      if (isTextFile) {
        // Read text files directly
        documentContent = await file.text();
      } else {
        // Use document parsing for PDFs, DOCX, etc.
        const formData = new FormData();
        formData.append('file', file);

        // Create a temporary file path for parsing
        const tempFilePath = `temp-${Date.now()}-${file.name}`;
        
        toast({
          title: "Processing document...",
          description: "SkAi is analyzing your file. This may take a moment.",
        });

        // For now, convert to base64 for processing
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
        });
        reader.readAsDataURL(file);
        
        const base64Content = await base64Promise;
        
        // Send to AI for document analysis
        const { data, error } = await supabase.functions.invoke('ai-file-analysis', {
          body: {
            fileContent: base64Content,
            fileName: file.name,
            fileType: file.type,
            context: {
              projectId,
              projectName,
              currentTab,
              analysisType: 'document'
            }
          }
        });

        if (error) throw error;
        documentContent = data.analysis || 'Document processed but no content extracted.';
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `📄 **Document Analysis: ${file.name}**\n\n${documentContent.substring(0, 2000)}${documentContent.length > 2000 ? '...\n\n*Note: Content truncated for display. Full analysis complete.*' : ''}`,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      toast({
        title: "Document analyzed!",
        description: "SkAi has reviewed your document.",
      });

    } catch (error) {
      console.error('Error processing document:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `❌ Failed to process document: ${error instanceof Error ? error.message : 'Unknown error'}`,
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to process the document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    
    if (files.length === 0) return;

    if (files.length > 1) {
      toast({
        title: "Multiple files detected",
        description: "Processing only the first file. Please upload one file at a time.",
      });
    }

    const file = files[0];
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/csv', 'application/json', 'text/markdown'];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|docx|txt|csv|json|md)$/i)) {
      toast({
        title: "Unsupported file type",
        description: "Please upload PDF, DOCX, TXT, CSV, JSON, or MD files.",
        variant: "destructive",
      });
      return;
    }

    await processDocument(file);
  };


  const handleDatabaseOperation = async (prompt: string) => {
    if (!projectId || !projectName) {
      toast({
        title: "Error",
        description: "Project context is required for database operations.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: prompt,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const result = await executeOperation(prompt, {
        projectId,
        projectName,
        currentPage: currentTab || 'Scope'
      });

      let messageContent: string;
      if (result.success) {
        messageContent = `✅ ${result.explanation || 'Operation completed successfully'}\n\nAffected ${result.recordsAffected || 0} record(s) in ${result.table}.`;
      } else {
        // Provide more detailed error information
        messageContent = `❌ ${result.error || 'Operation failed'}`;
        if (result.details) {
          messageContent += `\n\n${result.details}`;
        }
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: messageContent,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Trigger page refresh if operation was successful
      if (result.success) {
        // Trigger refresh for the entire page
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('skai-task-created', {
            detail: { projectId }
          }));
        }, 500);
      }
    } catch (error) {
      console.error('Error executing database operation:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `❌ Unexpected error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to execute operation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImplementSuggestion = async (messageId: string, prompt: string) => {
    if (!projectId || !projectName) return;

    // Update message to show as implementing
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, content: msg.content + '\n\n⏳ Implementing...' }
        : msg
    ));

    setIsLoading(true);

    try {
      const result = await executeOperation(prompt, {
        projectId,
        projectName,
        currentPage: 'Project Control'
      });

      let resultMessage: string;
      if (result.success) {
        resultMessage = `\n\n✅ Implemented successfully!\nAffected ${result.recordsAffected || 0} record(s) in ${result.table}.`;
        
        // Mark as implemented
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { 
                ...msg, 
                content: msg.content.replace('\n\n⏳ Implementing...', resultMessage),
                suggestion: { ...msg.suggestion!, implemented: true }
              }
            : msg
        ));
        
        // Trigger page refresh on success
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('skai-task-created', {
            detail: { projectId }
          }));
        }, 500);
      } else {
        resultMessage = `\n\n❌ Implementation failed: ${result.error || 'Unknown error'}`;
        if (result.details) {
          resultMessage += `\n${result.details}`;
        }
        
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: msg.content.replace('\n\n⏳ Implementing...', resultMessage) }
            : msg
        ));
      }
    } catch (error) {
      console.error('Error implementing suggestion:', error);
      const errorMsg = `\n\n❌ Failed to implement: ${error instanceof Error ? error.message : 'Unknown error'}`;
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: msg.content.replace('\n\n⏳ Implementing...', errorMsg) }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userInput = input.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      content: userInput,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // For Scope tab, get AI suggestion first with Implement button
      if (currentTab === 'Scope' && projectId) {
        console.log('Getting SkAi suggestion for Scope');
        
        // Call AI to get suggestion
        const conversation = messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));

        const contextString = `Project: "${projectName}"\nCurrent Page: Project Control\nCurrent Tab: Scope\n\nUser request: ${userInput}`;

        const { data, error } = await supabase.functions.invoke('ai-chat', {
          body: {
            message: contextString,
            conversation: conversation,
            context: {
              projectId,
              projectName,
              currentPage: 'Project Control',
              currentTab: 'Scope'
            }
          }
        });

        if (error) throw error;

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          role: 'assistant',
          timestamp: new Date(),
          suggestion: {
            prompt: userInput,
            implemented: false
          }
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Use conversational AI for general questions
        const conversation = messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));

        // Build context string based on available information
        let contextParts: string[] = [];
        
        if (projectName) {
          contextParts.push(`Project: "${projectName}"`);
        }
        
        if (currentPage) {
          contextParts.push(`Current Page: ${currentPage}`);
        }
        
        if (currentTab) {
          contextParts.push(`Current Tab: ${currentTab}`);
        }
        
        if (selectedCategory) {
          contextParts.push(`Selected Category: ${selectedCategory}`);
        }
        
        if (documentId && documentName) {
          contextParts.push(`Viewing Document: "${documentName}" (ID: ${documentId})`);
        }
        
        if (documentContent) {
          contextParts.push(`Document Content Summary: ${documentContent.substring(0, 2000)}`);
        }

        const contextString = contextParts.length > 0 
          ? `Context:\n${contextParts.join('\n')}\n\nUser question: ${userMessage.content}`
          : userMessage.content;

        const { data, error } = await supabase.functions.invoke('ai-chat', {
          body: {
            message: contextString,
            conversation: conversation,
            context: {
              projectId,
              projectName,
              currentPage,
              currentTab,
              selectedCategory,
              documentId,
              documentName
            }
          }
        });

        if (error) throw error;

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          role: 'assistant',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);
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

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-8 right-8 z-[100] bg-background border-2 border-primary/20 rounded-xl shadow-2xl transition-all duration-300 w-[420px] h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse"></span>
          </div>
          <span className="text-sm font-semibold">
            {documentName ? `Chat about ${documentName}` : currentTab ? `SkAi - ${currentTab}` : 'SkAi Chat'}
          </span>
          {messages.length > 0 && (
            <span className="text-xs text-muted-foreground">({messages.length})</span>
          )}
        </div>
        <div className="flex items-center space-x-1">
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setMessages([]);
                localStorage.removeItem(conversationKey);
                toast({
                  title: "Conversation cleared",
                  description: "Chat history has been reset for this module."
                });
              }}
              className="w-8 h-8 p-0 hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
              title="Clear conversation"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-8 h-8 p-0 hover:bg-primary/20"
            title="Minimize"
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-8 h-8 p-0 hover:bg-destructive/20"
            title="Close"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea 
        className="flex-1 p-4 relative"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg z-10 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <Upload className="w-12 h-12 mx-auto mb-2 text-primary animate-bounce" />
              <p className="text-lg font-semibold text-primary">Drop document here</p>
              <p className="text-sm text-muted-foreground">PDF, DOCX, TXT, CSV, JSON, or MD</p>
            </div>
          </div>
        )}
        <div className="space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-6">
              <div className="relative inline-block mb-4">
                <Sparkles className="w-8 h-8 mx-auto text-primary/50" />
                <span className="absolute -bottom-1 -right-1 text-[10px] font-bold bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center">
                  AI
                </span>
              </div>
              <p className="mb-2 font-medium text-foreground">
                {documentName 
                  ? `Ask SkAi about ${documentName}` 
                  : currentTab 
                  ? `Ask SkAi to edit your ${currentTab}` 
                  : 'Ask SkAi anything'}
              </p>
              <p className="text-xs mb-4 text-muted-foreground/70">
                Try: "Add a demolition phase", "Update item status", or "List all scope items"
              </p>
            </div>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-lg text-sm whitespace-pre-wrap ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : message.content.startsWith('❌') 
                    ? 'bg-destructive/10 border border-destructive/20 text-foreground'
                    : 'bg-muted border border-border text-foreground'
                }`}
              >
                {message.content}
              </div>
              {message.role === 'assistant' && message.suggestion && !message.suggestion.implemented && !message.content.includes('⏳ Implementing') && (
                <Button
                  onClick={() => handleImplementSuggestion(message.id, message.suggestion!.prompt)}
                  disabled={isLoading || isExecuting}
                  size="sm"
                  className="mt-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Implement
                </Button>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted border border-border p-3 rounded-lg text-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border bg-background">
        {(isLoading || isExecuting) && (
          <Alert className="mb-2 py-2 border-primary/30 bg-primary/5">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              SkAi is {isExecuting ? 'executing your request' : 'thinking'}...
            </AlertDescription>
          </Alert>
        )}
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={documentName ? `Ask about ${documentName}...` : currentTab ? `Ask SkAi to manage ${currentTab}...` : "Ask SkAi..."}
            disabled={isLoading || isExecuting}
            className="flex-1 focus-visible:ring-primary"
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading || isExecuting}
            size="sm"
            className="px-3 bg-primary hover:bg-primary/90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
