import React, { useState, useRef } from 'react';
import { MessageCircle, Send, Upload, FileText, X, Plus, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ChatBoxProps {
  onNavigate?: (page: string) => void;
  onSpeakingChange?: (speaking: boolean) => void;
  projectId?: string;
  companyId?: string;
  onActivityCreated?: () => void;
}

interface ActivitySuggestion {
  name: string;
  description: string;
  cost_est: number;
  start_date?: string;
  end_date?: string;
}

interface UploadedFile {
  file: File;
  content?: string;
  isProcessing: boolean;
  error?: string;
}

export const ChatBox = ({ onNavigate, onSpeakingChange, projectId, companyId, onActivityCreated }: ChatBoxProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showActivityMode, setShowActivityMode] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [suggestions, setSuggestions] = useState<ActivitySuggestion[]>([]);
  const [isCreatingActivities, setIsCreatingActivities] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true); // Collapsed by default

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('extract-pdf-text', {
        body: formData,
      });

      if (error) throw error;

      return data.text || '';
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Failed to extract text from PDF');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const pdfFiles = files.filter(file => file.type === 'application/pdf');

    if (pdfFiles.length === 0) {
      toast({
        title: "Invalid File Type",
        description: "Please upload PDF files only.",
        variant: "destructive"
      });
      return;
    }

    for (const file of pdfFiles) {
      const uploadedFile: UploadedFile = {
        file,
        isProcessing: true
      };

      setUploadedFiles(prev => [...prev, uploadedFile]);

      try {
        const content = await extractTextFromPDF(file);
        setUploadedFiles(prev => prev.map(f => 
          f.file === file ? { ...f, content, isProcessing: false } : f
        ));

        toast({
          title: "File Processed",
          description: `Successfully extracted text from ${file.name}`,
        });
      } catch (error) {
        setUploadedFiles(prev => prev.map(f => 
          f.file === file ? { 
            ...f, 
            isProcessing: false, 
            error: 'Failed to process PDF' 
          } : f
        ));

        toast({
          title: "Processing Failed",
          description: `Failed to process ${file.name}`,
          variant: "destructive"
        });
      }
    }

    if (event.target) {
      event.target.value = '';
    }
  };

  const removeFile = (fileToRemove: File) => {
    setUploadedFiles(prev => prev.filter(f => f.file !== fileToRemove));
  };

  const isActivityRequest = (text: string) => {
    const activityKeywords = ['activity', 'activities', 'task', 'tasks', 'work', 'create', 'add', 'generate'];
    return activityKeywords.some(keyword => text.toLowerCase().includes(keyword));
  };

  const handleAIResponse = async (prompt: string) => {
    setIsProcessing(true);
    onSpeakingChange?.(false);

    try {
      // Check if this is an activity-related request and we have project context
      if (isActivityRequest(prompt) && projectId && companyId) {
        await handleGenerateActivities(prompt);
        return;
      }

      // Regular AI chat
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { 
          message: prompt,
          context: {
            currentPage: 'chat',
            projectId,
            visibleData: {
              screenType: 'general_chat'
            }
          }
        }
      });

      if (error) throw error;

      // Simulate AI speaking
      onSpeakingChange?.(true);
      const speakingDuration = 3000 + Math.random() * 2000;
      setTimeout(() => {
        onSpeakingChange?.(false);
      }, speakingDuration);

      toast({
        title: "Skai responded",
        description: data?.response || "AI responded successfully",
      });

    } catch (error) {
      console.error('Error with AI response:', error);
      toast({
        title: "Response Failed",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateActivities = async (prompt: string) => {
    if (!projectId || !companyId) return;

    try {
      const projectDocuments = uploadedFiles
        .filter(f => f.content && !f.error)
        .map(f => `File: ${f.file.name}\nContent: ${f.content}`)
        .join('\n\n---\n\n');

      let fullPrompt = '';
      
      if (projectDocuments && projectDocuments.trim()) {
        fullPrompt = `Based on the following project documents and scope of work, generate activity suggestions for a construction project.

PROJECT DOCUMENTS:
${projectDocuments}

USER REQUEST: ${prompt.trim()}

Please analyze the project documents to understand the scope of work and generate relevant activities. 

Respond with a JSON array of activity objects, each with:
- name: string (activity name based on the scope of work)
- description: string (detailed description derived from project documents)
- cost_est: number (estimated cost in dollars)
- start_date: string (optional, format: YYYY-MM-DD)
- end_date: string (optional, format: YYYY-MM-DD)

Generate 3-8 relevant activities based on the project scope. Only respond with the JSON array, no other text.`;
      } else {
        fullPrompt = `Generate activity suggestions for a construction project based on this request: "${prompt.trim()}". 

Please respond with a JSON array of activity objects, each with:
- name: string (activity name)
- description: string (detailed description)
- cost_est: number (estimated cost in dollars)
- start_date: string (optional, format: YYYY-MM-DD)
- end_date: string (optional, format: YYYY-MM-DD)

Generate 3-5 relevant activities. Only respond with the JSON array, no other text.`;
      }

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { 
          message: fullPrompt,
          context: {
            currentPage: 'project-activities',
            projectId,
            visibleData: {
              screenType: 'activity_management'
            }
          }
        }
      });

      if (error) throw error;

      let generatedActivities = [];
      try {
        const responseText = data?.response || data?.message || '';
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        const jsonText = jsonMatch ? jsonMatch[0] : responseText;
        generatedActivities = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        generatedActivities = [{
          name: prompt.trim(),
          description: `Activity generated based on: ${prompt.trim()}`,
          cost_est: 1000
        }];
      }

      setSuggestions(generatedActivities);
      setShowActivityMode(true);

      // Simulate AI speaking
      onSpeakingChange?.(true);
      setTimeout(() => {
        onSpeakingChange?.(false);
      }, 2000);

      toast({
        title: "Activities Generated",
        description: `Skai generated ${generatedActivities.length} activity suggestions`,
      });

    } catch (error) {
      console.error('Error generating activities:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate activities. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCreateActivities = async () => {
    if (suggestions.length === 0 || !projectId || !companyId) return;

    setIsCreatingActivities(true);
    try {
      const activitiesToCreate = suggestions.map(suggestion => ({
        project_id: projectId,
        company_id: companyId,
        name: suggestion.name,
        description: suggestion.description,
        cost_est: suggestion.cost_est,
        start_date: suggestion.start_date || null,
        end_date: suggestion.end_date || null
      }));

      const { data, error } = await supabase
        .from('activities')
        .insert(activitiesToCreate)
        .select();

      if (error) throw error;

      toast({
        title: "Activities Created",
        description: `Successfully created ${data.length} activities`,
      });

      setSuggestions([]);
      setShowActivityMode(false);
      onActivityCreated?.();

    } catch (error) {
      console.error('Error creating activities:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create activities. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingActivities(false);
    }
  };

  const handleSend = async () => {
    if (message.trim()) {
      const userMessage = message.trim();
      setMessage('');
      await handleAIResponse(userMessage);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isProcessing) {
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg px-4 sm:px-0">
      {isCollapsed ? (
        /* Collapsed State - Show only the chat icon button */
        <div className="flex justify-center">
          <Button
            onClick={() => setIsCollapsed(false)}
            className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full p-3 shadow-xl hover:bg-white/25 transition-all duration-200"
            size="sm"
          >
            <div className="relative">
              <MessageCircle className="w-5 h-5 text-white" />
              {isProcessing && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
              )}
            </div>
          </Button>
        </div>
      ) : (
        /* Expanded State - Show full chat interface */
        <>
          {/* Activity Suggestions Card */}
          {showActivityMode && suggestions.length > 0 && (
            <Card className="mb-4 bg-white/95 backdrop-blur-sm border-primary/20 shadow-xl">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-foreground">Generated Activities ({suggestions.length})</h4>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCreateActivities}
                      disabled={isCreatingActivities}
                      size="sm"
                      className="flex items-center space-x-1"
                    >
                      {isCreatingActivities ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Plus className="h-3 w-3" />
                      )}
                      <span>{isCreatingActivities ? 'Creating...' : 'Create All'}</span>
                    </Button>
                    <Button
                      onClick={() => {
                        setSuggestions([]);
                        setShowActivityMode(false);
                      }}
                      variant="ghost"
                      size="sm"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="p-3 bg-secondary/30 rounded-lg border border-border/50">
                      <div className="font-medium text-sm text-foreground">{suggestion.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{suggestion.description}</div>
                      <div className="text-xs text-primary font-medium mt-1">${suggestion.cost_est.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* File Upload Display */}
          {uploadedFiles.length > 0 && (
            <Card className="mb-4 bg-white/95 backdrop-blur-sm border-primary/20 shadow-xl">
              <CardContent className="p-3 space-y-2">
                <div className="text-sm font-medium text-foreground">Uploaded Documents:</div>
                {uploadedFiles.map((uploadedFile, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg text-sm">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span className="truncate max-w-[200px]">{uploadedFile.file.name}</span>
                      {uploadedFile.isProcessing && (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      )}
                      {uploadedFile.error ? (
                        <Badge variant="destructive" className="text-xs">Error</Badge>
                      ) : uploadedFile.content ? (
                        <Badge variant="default" className="text-xs">Processed</Badge>
                      ) : null}
                    </div>
                    <Button
                      onClick={() => removeFile(uploadedFile.file)}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Chat Input */}
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-3 sm:px-4 py-2 shadow-xl hover:bg-white/25 transition-all duration-200">
            <div className="relative flex-shrink-0">
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              {isProcessing && (
                <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-blue-400 rounded-full animate-pulse" />
              )}
            </div>

            {/* File Upload Button */}
            {projectId && companyId && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="ghost"
                  size="sm"
                  className="p-1.5 sm:p-2 h-auto text-white hover:text-white hover:bg-white/10 rounded-full flex-shrink-0"
                >
                  <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </>
            )}

            <Input
              type="text"
              placeholder={isProcessing ? "AI is thinking..." : projectId ? "Ask Skai to create activities or anything else..." : "Ask Skai anything..."}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isProcessing}
              className="border-none bg-transparent text-white placeholder-white/90 focus:ring-0 focus:outline-none text-sm flex-1 disabled:opacity-70"
            />
            <Button
              onClick={handleSend}
              disabled={isProcessing || !message.trim()}
              size="sm"
              variant="ghost"
              className="p-1.5 sm:p-2 h-auto text-white hover:text-white hover:bg-white/10 rounded-full disabled:opacity-50 flex-shrink-0"
            >
              <Send className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
            
            {/* Collapse Button */}
            <Button
              onClick={() => setIsCollapsed(true)}
              variant="ghost"
              size="sm"
              className="p-1.5 sm:p-2 h-auto text-white hover:text-white hover:bg-white/10 rounded-full flex-shrink-0"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};