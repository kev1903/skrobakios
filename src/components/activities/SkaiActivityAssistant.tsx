import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
    // Allow generation if either prompt is provided OR PDFs with content are uploaded
    const hasValidPDFs = uploadedFiles.some(f => f.content && !f.error);
    if (!prompt.trim() && !hasValidPDFs) {
      toast({
        title: "Input Required",
        description: "Please enter a description or upload PDF documents to generate activities.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Combine project files content with user prompt
      const projectDocuments = uploadedFiles
        .filter(f => f.content && !f.error)
        .map(f => {
          // Truncate large content to prevent token limit issues
          const maxContentLength = 10000; // Limit to ~10k characters per file
          let content = f.content || '';
          if (content.length > maxContentLength) {
            content = content.substring(0, maxContentLength) + '\n... [Content truncated due to length]';
          }
          return `File: ${f.file.name}\nContent: ${content}`;
        })
        .join('\n\n---\n\n');

      console.log('Project documents length:', projectDocuments.length);
      console.log('Number of files processed:', uploadedFiles.filter(f => f.content && !f.error).length);

      let fullPrompt = '';
      
      if (projectDocuments && projectDocuments.trim()) {
        fullPrompt = `You are a construction project manager analyzing project documents to generate detailed activity lists.

TASK: Extract and generate 5-10 specific construction activities from the following project documents.

PROJECT DOCUMENTS:
${projectDocuments}

USER REQUEST: ${prompt.trim()}

INSTRUCTIONS:
1. Carefully read and analyze the project documents
2. Identify all major construction phases, trades, and tasks mentioned
3. Generate 5-10 distinct activities covering different aspects of the project
4. Base activity names and descriptions on actual content from the documents
5. Estimate realistic costs for each activity
6. MUST respond with valid JSON only - no additional text

REQUIRED JSON FORMAT:
[
  {
    "name": "Activity Name Here",
    "description": "Detailed description based on document content",
    "cost_est": 5000,
    "start_date": "2024-02-01",
    "end_date": "2024-02-15"
  }
]

RESPOND WITH ONLY THE JSON ARRAY - NO OTHER TEXT.`;
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
        const responseText = data?.response || data?.message || data?.generatedText || '';
        console.log('AI Response received:', responseText);
        
        if (!responseText || responseText.trim() === '') {
          throw new Error('Empty response from AI');
        }
        
        // Extract JSON from response if it contains other text
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        const jsonText = jsonMatch ? jsonMatch[0] : responseText.trim();
        
        console.log('Attempting to parse JSON:', jsonText);
        generatedActivities = JSON.parse(jsonText);
        
        if (!Array.isArray(generatedActivities)) {
          throw new Error('Response is not an array');
        }
        
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        console.error('Raw response data:', data);
        
        // More specific error handling
        if (data?.error || (!data?.response && !data?.message && !data?.generatedText)) {
          throw new Error('AI service failed to generate response. The PDF content may be too large.');
        }
        
        // Fallback: create multiple activities based on the prompt and documents
        if (hasValidPDFs) {
          generatedActivities = [
            {
              name: "Document Review and Planning",
              description: "Review uploaded project documents and create detailed project plan",
              cost_est: 2000
            },
            {
              name: "Site Preparation",
              description: "Prepare construction site based on project specifications",
              cost_est: 5000
            },
            {
              name: "Foundation Work",
              description: "Foundation and structural work as outlined in project documents",
              cost_est: 15000
            },
            {
              name: "Building Construction",
              description: "Main construction activities based on project scope",
              cost_est: 25000
            },
            {
              name: "Finishing Work",
              description: "Final finishing touches and project completion",
              cost_est: 8000
            }
          ];
        } else {
          generatedActivities = [{
            name: prompt.trim() || "Custom Activity",
            description: `Activity generated based on: ${prompt.trim()}`,
            cost_est: 1000
          }];
        }
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


  return null;
};