
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Clipboard, FileText, X } from 'lucide-react';
import { useTaskContext } from './TaskContext';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/hooks/use-toast';

interface AddTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  status: string;
  projectId: string;
}

export const AddTaskDialog = ({ isOpen, onClose, status, projectId }: AddTaskDialogProps) => {
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState('Task');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addTask } = useTaskContext();
  const { userProfile } = useUser();

  const handleFileSelect = (files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      setSelectedFiles(prev => [...prev, ...fileArray]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handlePaste = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      const files: File[] = [];
      
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith('image/')) {
            const blob = await clipboardItem.getType(type);
            const file = new File([blob], `pasted-image-${Date.now()}.png`, { type });
            files.push(file);
          }
        }
      }
      
      if (files.length > 0) {
        setSelectedFiles(prev => [...prev, ...files]);
        toast({
          title: "Success",
          description: `${files.length} image(s) pasted from clipboard`,
        });
      } else {
        toast({
          title: "No images found",
          description: "No images found in clipboard. Copy an image and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error pasting from clipboard:', error);
      toast({
        title: "Error",
        description: "Failed to paste from clipboard. Make sure you have copied an image.",
        variant: "destructive",
      });
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const uploadAttachments = async (taskId: string) => {
    if (selectedFiles.length === 0) return;

    const uploadPromises = selectedFiles.map(async (file) => {
      const fileExtension = file.name.split('.').pop();
      const fileName = `${taskId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('task-attachments')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('task-attachments')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('task_attachments')
        .insert({
          task_id: taskId,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          file_url: urlData.publicUrl,
          uploaded_by_name: `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim() || 'Anonymous User',
          uploaded_by_avatar: userProfile?.avatarUrl || ''
        });

      if (dbError) throw dbError;
    });

    await Promise.all(uploadPromises);
  };

  const handleSubmit = async () => {
    if (!taskName.trim()) return;
    
    setUploading(true);
    try {
      const newTask = {
        project_id: projectId,
        taskName: taskName.trim(),
        taskType: taskType as 'Task' | 'Issue',
        priority: 'Medium' as const,
        assignedTo: { name: '', avatar: '' },
        dueDate: new Date().toISOString().split('T')[0],
        status: status as 'Completed' | 'In Progress' | 'Pending' | 'Not Started',
        progress: 0,
        description: description.trim() || undefined
      };

      await addTask(newTask);
      
      // If we have files to upload, we need to get the task ID first
      // For now, we'll need to modify the addTask function to return the created task
      // This is a limitation of the current implementation
      
      if (selectedFiles.length > 0) {
        toast({
          title: "Note",
          description: "Task created. Please edit the task to add attachments.",
        });
      }
      
      console.log(`Added new task: ${taskName} to ${status} column`);
      
      // Reset form and close dialog
      setTaskName('');
      setDescription('');
      setTaskType('Task');
      setSelectedFiles([]);
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setTaskName('');
    setDescription('');
    setTaskType('Task');
    setSelectedFiles([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="task-name">Task Name *</Label>
            <Input
              id="task-name"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="Enter task name..."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description (optional)..."
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="task-type">Type</Label>
            <Select value={taskType} onValueChange={setTaskType}>
              <SelectTrigger>
                <SelectValue placeholder="Select task type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Task">Task</SelectItem>
                <SelectItem value="Issue">Issue</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Attachments Section */}
          <div className="grid gap-2">
            <Label>Attachments</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                isDragOver 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
              <p className="text-xs text-gray-600 mb-3">
                Drag and drop files here, or use buttons below
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-3 h-3 mr-1" />
                  Upload
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePaste}
                  className="flex items-center gap-1"
                >
                  <Clipboard className="w-3 h-3" />
                  Paste
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
              />
            </div>
            
            {/* Selected Files Display */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2 max-h-24 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded text-xs">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <FileText className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{file.name}</span>
                      <span className="text-gray-500 flex-shrink-0">({formatFileSize(file.size)})</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSelectedFile(index)}
                      className="h-6 w-6 p-0 flex-shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="text-sm text-muted-foreground">
            Status: <span className="font-medium">{status}</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!taskName.trim() || uploading}
          >
            {uploading ? 'Creating...' : selectedFiles.length > 0 ? `Add Task (${selectedFiles.length} files)` : 'Add Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
