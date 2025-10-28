import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().trim().min(1, "Description is required").max(2000, "Description must be less than 2000 characters"),
  submitterName: z.string().trim().min(1, "Submitter name is required").max(100, "Name must be less than 100 characters"),
  submitterEmail: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  priority: z.enum(['Low', 'Medium', 'High'])
});

export const ReviewSubmissionDialog = ({ isOpen, onClose, projectId }: ReviewSubmissionDialogProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitterName, setSubmitterName] = useState('');
  const [submitterEmail, setSubmitterEmail] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

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
        title,
        description,
        submitterName,
        submitterEmail,
        priority
      });

      setIsSubmitting(true);

      // Create a review task
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .insert({
          project_id: projectId,
          task_name: validatedData.title,
          description: `${validatedData.description}\n\nSubmitted by: ${validatedData.submitterName} (${validatedData.submitterEmail})`,
          task_type: 'Review',
          priority: validatedData.priority,
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
            uploaded_by_name: validatedData.submitterName
          });
        }
      }

      toast({
        title: "Submission successful",
        description: "Your review submission has been created and assigned for review."
      });

      // Reset form
      setTitle('');
      setDescription('');
      setSubmitterName('');
      setSubmitterEmail('');
      setPriority('Medium');
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
          description: "Failed to submit review. Please try again.",
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
            Submit a new item for review. All submissions will be assigned to the project team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Brief title of what needs to be reviewed"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Detailed description of what needs to be reviewed and any specific requirements"
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

          {/* Submitter Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="submitterName">
                Your Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="submitterName"
                placeholder="John Doe"
                value={submitterName}
                onChange={(e) => setSubmitterName(e.target.value)}
                maxLength={100}
                className={errors.submitterName ? 'border-destructive' : ''}
              />
              {errors.submitterName && (
                <p className="text-xs text-destructive">{errors.submitterName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="submitterEmail">
                Your Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="submitterEmail"
                type="email"
                placeholder="john@example.com"
                value={submitterEmail}
                onChange={(e) => setSubmitterEmail(e.target.value)}
                maxLength={255}
                className={errors.submitterEmail ? 'border-destructive' : ''}
              />
              {errors.submitterEmail && (
                <p className="text-xs text-destructive">{errors.submitterEmail}</p>
              )}
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* File Attachments */}
          <div className="space-y-2">
            <Label htmlFor="attachments">Attachments (Optional)</Label>
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
