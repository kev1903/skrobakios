import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Upload } from 'lucide-react';
import { z } from 'zod';

interface ReviewSubmissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

// Validation schema
const submissionSchema = z.object({
  projectName: z.string().trim().min(1, "Project name is required").max(200, "Project name must be less than 200 characters"),
  documentTitle: z.string().trim().min(1, "Document title is required").max(200, "Document title must be less than 200 characters"),
  author: z.string().trim().min(1, "Author name is required").max(100, "Author name must be less than 100 characters"),
  reviewer: z.string().trim().max(100, "Reviewer name must be less than 100 characters").optional(),
  description: z.string().trim().min(1, "Description is required").max(2000, "Description must be less than 2000 characters")
});

export const ReviewSubmissionDialog = ({ isOpen, onClose, projectId }: ReviewSubmissionDialogProps) => {
  const [projectName, setProjectName] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [reviewer, setReviewer] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Load project name when dialog opens
  useEffect(() => {
    const loadProjectName = async () => {
      if (isOpen && projectId) {
        const { data, error } = await supabase
          .from('projects')
          .select('name')
          .eq('id', projectId)
          .single();
        
        if (data && !error) {
          setProjectName(data.name);
        }
      }
    };
    
    loadProjectName();
  }, [isOpen, projectId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      const validFiles = files.filter(file => {
        if (file.size > maxSize) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds 10MB limit`,
            variant: "destructive"
          });
          return false;
        }
        return true;
      });
      
      setAttachments(prev => [...prev, ...validFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      setErrors({});
      
      // Validate form data
      const validatedData = submissionSchema.parse({
        projectName,
        documentTitle,
        author,
        reviewer: reviewer || undefined,
        description
      });

      setIsSubmitting(true);

      // Build detailed description with metadata
      const detailedDescription = `${validatedData.description}

**Document Details:**
- Project: ${validatedData.projectName}
- Document Title: ${validatedData.documentTitle}
- Author: ${validatedData.author}${validatedData.reviewer ? `\n- Requested Reviewer: ${validatedData.reviewer}` : ''}`;

      // Create a review task
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .insert({
          project_id: projectId,
          task_name: `Review: ${validatedData.documentTitle}`,
          description: detailedDescription,
          task_type: 'Review',
          priority: 'Medium',
          status: 'Pending',
          progress: 0,
          assigned_to: null, // Will be assigned by project manager
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
        })
        .select()
        .single();

      if (taskError) throw taskError;

      // Upload attachments if any
      if (attachments.length > 0 && taskData) {
        for (const file of attachments) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${taskData.id}-${Date.now()}.${fileExt}`;
          const filePath = `task-attachments/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('task-attachments')
            .upload(filePath, file);

          if (uploadError) {
            console.error('Error uploading file:', uploadError);
            continue;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('task-attachments')
            .getPublicUrl(filePath);

          // Save attachment record
          await supabase.from('task_attachments').insert({
            task_id: taskData.id,
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
            file_url: publicUrl,
            uploaded_by_name: validatedData.author
          });
        }
      }

      toast({
        title: "Submission successful",
        description: "Your document review request has been submitted successfully."
      });

      // Reset form
      setDocumentTitle('');
      setAuthor('');
      setReviewer('');
      setDescription('');
      setAttachments([]);
      onClose();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast({
          title: "Error",
          description: "Failed to submit review request. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit Review Request</DialogTitle>
          <DialogDescription>
            Submit a document for review. All submissions will be assigned to the project team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Project Name - Auto-populated */}
          <div className="space-y-2">
            <Label htmlFor="projectName">
              Project Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              maxLength={200}
              className={errors.projectName ? 'border-destructive' : ''}
            />
            {errors.projectName && (
              <p className="text-xs text-destructive">{errors.projectName}</p>
            )}
          </div>

          {/* Document Title */}
          <div className="space-y-2">
            <Label htmlFor="documentTitle">
              Document Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="documentTitle"
              placeholder="Enter the document title"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              maxLength={200}
              className={errors.documentTitle ? 'border-destructive' : ''}
            />
            {errors.documentTitle && (
              <p className="text-xs text-destructive">{errors.documentTitle}</p>
            )}
          </div>

          {/* Author and Reviewer */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="author">
                Author <span className="text-destructive">*</span>
              </Label>
              <Input
                id="author"
                placeholder="Document author name"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                maxLength={100}
                className={errors.author ? 'border-destructive' : ''}
              />
              {errors.author && (
                <p className="text-xs text-destructive">{errors.author}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reviewer">
                Requested Reviewer <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <Input
                id="reviewer"
                placeholder="Preferred reviewer name"
                value={reviewer}
                onChange={(e) => setReviewer(e.target.value)}
                maxLength={100}
                className={errors.reviewer ? 'border-destructive' : ''}
              />
              {errors.reviewer && (
                <p className="text-xs text-destructive">{errors.reviewer}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Provide details about what needs to be reviewed and any specific requirements"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={2000}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {description.length}/2000 characters
            </p>
          </div>

          {/* File Attachments */}
          <div className="space-y-2">
            <Label htmlFor="attachments">Attachments <span className="text-destructive">*</span></Label>
            <p className="text-xs text-muted-foreground mb-2">
              Upload documents that need to be reviewed
            </p>
            <div className="flex items-center gap-2">
              <Input
                id="attachments"
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('attachments')?.click()}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Files
              </Button>
              <span className="text-xs text-muted-foreground">
                Max 10MB per file
              </span>
            </div>
            
            {/* Display attached files */}
            {attachments.length > 0 && (
              <div className="space-y-2 mt-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-accent/50 rounded-md"
                  >
                    <span className="text-sm truncate flex-1">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
