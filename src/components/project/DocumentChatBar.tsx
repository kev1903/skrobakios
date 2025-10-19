import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles, X, Minimize2, Plus, Edit, Trash2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { useSkaiDatabaseOperations } from '@/hooks/useSkaiDatabaseOperations';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { executeOperation, isExecuting } = useSkaiDatabaseOperations();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


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

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: result.success 
          ? `✅ ${result.explanation || 'Operation completed successfully'}\n\nAffected ${result.recordsAffected || 0} record(s) in ${result.table}.`
          : `❌ ${result.error || 'Operation failed'}`,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Trigger page refresh if operation was successful
      if (result.success) {
        window.dispatchEvent(new CustomEvent('skai-task-created', {
          detail: { projectId }
        }));
      }
    } catch (error) {
      console.error('Error executing database operation:', error);
      toast({
        title: "Error",
        description: "Failed to execute operation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
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
    <div className="fixed bottom-8 right-8 z-[100] bg-background border-2 border-primary/20 rounded-xl shadow-2xl transition-all duration-300 w-96 h-[520px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30 rounded-t-xl">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">
            {documentName ? `Chat about ${documentName}` : currentTab ? `SkAi - ${currentTab}` : 'SkAi Chat'}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-8 h-8 p-0"
            title="Minimize to chat icon"
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-8 h-8 p-0"
            title="Close"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="h-[calc(100%-180px)] p-4">
        <div className="space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-6">
              <Sparkles className="w-6 h-6 mx-auto mb-2 opacity-50" />
              <p className="mb-4">
                {documentName 
                  ? `Ask SkAi anything about ${documentName}` 
                  : currentTab 
                  ? `Ask SkAi to manage your ${currentTab}` 
                  : 'Ask SkAi anything about this project'}
              </p>
              {currentTab === 'Scope' && projectId && (
                <div className="flex flex-col gap-2 mt-4 px-4">
                  <p className="text-xs font-medium mb-1">Quick Actions:</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDatabaseOperation("Add a new demolition phase to the scope")}
                    disabled={isLoading || isExecuting}
                    className="w-full justify-start text-xs"
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Add Scope Item
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const prompt = window.prompt("Enter the name of the scope item to edit:");
                      if (prompt) handleDatabaseOperation(`Update the scope item named "${prompt}" to mark it as in progress`);
                    }}
                    disabled={isLoading || isExecuting}
                    className="w-full justify-start text-xs"
                  >
                    <Edit className="w-3 h-3 mr-2" />
                    Edit Scope Item
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const prompt = window.prompt("Enter the name of the scope item to delete:");
                      if (prompt) handleDatabaseOperation(`Delete the scope item named "${prompt}"`);
                    }}
                    disabled={isLoading || isExecuting}
                    className="w-full justify-start text-xs"
                  >
                    <Trash2 className="w-3 h-3 mr-2" />
                    Delete Scope Item
                  </Button>
                </div>
              )}
            </div>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-lg text-sm ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background border border-border'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-background border border-border p-3 rounded-lg text-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Quick Actions for Scope */}
      {currentTab === 'Scope' && projectId && messages.length > 0 && (
        <div className="px-4 pb-2 border-t border-border bg-muted/20">
          <div className="flex gap-1 pt-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDatabaseOperation("Add a new scope item")}
              disabled={isLoading || isExecuting}
              className="flex-1 text-xs h-7"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                const prompt = window.prompt("Describe the edit:");
                if (prompt) handleDatabaseOperation(prompt);
              }}
              disabled={isLoading || isExecuting}
              className="flex-1 text-xs h-7"
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                const prompt = window.prompt("Which scope item to delete?");
                if (prompt) handleDatabaseOperation(`Delete the scope item: ${prompt}`);
              }}
              disabled={isLoading || isExecuting}
              className="flex-1 text-xs h-7"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border bg-background">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={documentName ? `Ask about ${documentName}...` : currentTab ? `Ask SkAi to manage ${currentTab}...` : "Ask SkAi..."}
            disabled={isLoading || isExecuting}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading || isExecuting}
            size="sm"
            className="px-3"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
