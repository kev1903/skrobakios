import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Plus, Sparkles, Send, Loader2, Upload, FileText, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SkaiActivityAssistantProps {
  projectId: string;
  companyId: string;
  onActivityCreated: () => void;
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

export const SkaiActivityAssistant = ({ projectId, companyId, onActivityCreated }: SkaiActivityAssistantProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<ActivitySuggestion[]>([]);
  const [isCreatingActivities, setIsCreatingActivities] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

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

    // Clear the input
    if (event.target) {
      event.target.value = '';
    }
  };

  const removeFile = (fileToRemove: File) => {
    setUploadedFiles(prev => prev.filter(f => f.file !== fileToRemove));
  };

  const handleGenerateActivities = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      // Combine project files content with user prompt
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

Example format:
[
  {
    "name": "Site Preparation",
    "description": "Clear and level the construction site as specified in project documents",
    "cost_est": 5000,
    "start_date": "2024-01-15",
    "end_date": "2024-01-20"
  }
]

Generate 3-8 relevant activities based on the project scope. Only respond with the JSON array, no other text.`;
      } else {
        fullPrompt = `Generate activity suggestions for a construction project based on this request: "${prompt.trim()}". 
          
Please respond with a JSON array of activity objects, each with:
- name: string (activity name)
- description: string (detailed description)
- cost_est: number (estimated cost in dollars)
- start_date: string (optional, format: YYYY-MM-DD)
- end_date: string (optional, format: YYYY-MM-DD)

Example format:
[
  {
    "name": "Site Preparation",
    "description": "Clear and level the construction site",
    "cost_est": 5000,
    "start_date": "2024-01-15",
    "end_date": "2024-01-20"
  }
]

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

      // Try to parse the AI response as JSON
      let generatedActivities = [];
      try {
        const responseText = data?.response || data?.message || '';
        // Extract JSON from response if it contains other text
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        const jsonText = jsonMatch ? jsonMatch[0] : responseText;
        generatedActivities = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        // Fallback: create a single activity based on the prompt
        generatedActivities = [{
          name: prompt.trim(),
          description: `Activity generated based on: ${prompt.trim()}`,
          cost_est: 1000
        }];
      }

      setSuggestions(generatedActivities);

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
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateActivities = async () => {
    if (suggestions.length === 0) return;

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
      setPrompt('');
      setIsOpen(false);
      onActivityCreated();

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

  const handleRemoveSuggestion = (index: number) => {
    setSuggestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditSuggestion = (index: number, field: keyof ActivitySuggestion, value: any) => {
    setSuggestions(prev => prev.map((suggestion, i) => 
      i === index ? { ...suggestion, [field]: value } : suggestion
    ));
  };


  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="flex items-center space-x-2 border-dashed border-primary/50 hover:border-primary"
      >
        <Bot className="h-4 w-4" />
        <Sparkles className="h-4 w-4" />
        <span>Ask Skai to create activities</span>
      </Button>

      {isOpen && (
        <Card className="absolute top-12 right-0 w-96 z-50 shadow-xl border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Bot className="h-5 w-5 text-primary" />
              <span>Skai Activity Assistant</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Upload Section */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Upload Project Documents (PDF):
              </label>
              <div className="flex items-center gap-2 mb-2">
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
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload PDFs</span>
                </Button>
                <span className="text-xs text-muted-foreground">
                  Upload project specs, drawings, or scope documents
                </span>
              </div>

              {/* Uploaded Files Display */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2 mb-3">
                  {uploadedFiles.map((uploadedFile, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg text-sm">
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
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Describe the activities you need:
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={uploadedFiles.some(f => f.content) 
                  ? "Describe what activities you need based on the uploaded documents..." 
                  : "e.g., Add carpentry work including framing, drywall installation, and finish carpentry for the residential project"}
                rows={3}
                className="mb-2"
              />
              <div className="flex justify-between items-center">
                <Button 
                  onClick={handleGenerateActivities}
                  disabled={(!prompt.trim() && uploadedFiles.filter(f => f.content).length === 0) || isGenerating}
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span>{isGenerating ? 'Generating...' : 'Generate Activities'}</span>
                </Button>
                <Button 
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>


            {/* Activity Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Generated Activities ({suggestions.length})</h4>
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
                </div>

                {suggestions.map((suggestion, index) => (
                  <Card key={index} className="border-dashed">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <Input
                          value={suggestion.name}
                          onChange={(e) => handleEditSuggestion(index, 'name', e.target.value)}
                          className="font-medium text-sm"
                          placeholder="Activity name"
                        />
                        <Button
                          onClick={() => handleRemoveSuggestion(index)}
                          variant="ghost"
                          size="sm"
                          className="ml-2 h-6 w-6 p-0"
                        >
                          ×
                        </Button>
                      </div>
                      
                      <Textarea
                        value={suggestion.description}
                        onChange={(e) => handleEditSuggestion(index, 'description', e.target.value)}
                        className="text-xs"
                        rows={2}
                        placeholder="Description"
                      />
                      
                      <div className="flex items-center space-x-2 text-xs">
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-muted-foreground">$</span>
                          <Input
                            type="number"
                            value={suggestion.cost_est}
                            onChange={(e) => handleEditSuggestion(index, 'cost_est', parseFloat(e.target.value) || 0)}
                            className="text-xs h-7 w-20"
                            min="0"
                            step="100"
                            placeholder="Cost"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};