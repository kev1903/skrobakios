import React from 'react';
import { Download, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TaskViewToggle } from './TaskViewToggle';
import { Task } from './TaskContext';
import { TaskAttachment } from './types';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TaskSearchAndActionsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  selectedTasks: Task[];
}

export const TaskSearchAndActions = ({ 
  searchTerm, 
  onSearchChange, 
  viewMode, 
  onViewModeChange,
  selectedTasks 
}: TaskSearchAndActionsProps) => {
  const { toast } = useToast();

  const fetchTaskAttachments = async (taskId: string): Promise<TaskAttachment[]> => {
    try {
      const { data, error } = await supabase
        .from('task_attachments')
        .select('*')
        .eq('task_id', taskId);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching attachments:', error);
      return [];
    }
  };

  const loadImageAsBase64 = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/jpeg');
        resolve(dataURL);
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  const handleExportTasks = async () => {
    if (selectedTasks.length === 0) {
      toast({
        title: "No tasks selected",
        description: "Please select at least one task to export.",
        variant: "destructive",
      });
      return;
    }

    try {
      const doc = new jsPDF();
      let isFirstPage = true;
      
      for (let i = 0; i < selectedTasks.length; i++) {
        const task = selectedTasks[i];
        
        // Add new page for each task (except the first one)
        if (!isFirstPage) {
          doc.addPage();
        }
        isFirstPage = false;
        
        let yPosition = 20;
        
        // Task header
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text(`Task ${i + 1}: ${task.taskName}`, 20, yPosition);
        yPosition += 15;
        
        // Task details
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text(`Priority: ${task.priority}`, 20, yPosition);
        yPosition += 8;
        doc.text(`Status: ${task.status}`, 20, yPosition);
        yPosition += 8;
        doc.text(`Due Date: ${task.dueDate || 'Not set'}`, 20, yPosition);
        yPosition += 8;
        doc.text(`Progress: ${task.progress}%`, 20, yPosition);
        yPosition += 8;
        doc.text(`Assigned To: ${task.assignedTo?.name || 'Unassigned'}`, 20, yPosition);
        yPosition += 8;
        
        if (task.description) {
          doc.text(`Description: ${task.description}`, 20, yPosition);
          yPosition += 10;
        }
        
        // Fetch and display attachments
        const attachments = await fetchTaskAttachments(task.id);
        const jpgAttachments = attachments.filter(att => 
          att.file_type.toLowerCase().includes('jpeg') || 
          att.file_type.toLowerCase().includes('jpg')
        );
        
        if (jpgAttachments.length > 0) {
          yPosition += 5;
          doc.setFont(undefined, 'bold');
          doc.text('Attachments:', 20, yPosition);
          yPosition += 8;
          doc.setFont(undefined, 'normal');
          
          for (const attachment of jpgAttachments) {
            try {
              const imageData = await loadImageAsBase64(attachment.file_url);
              
              // Calculate image dimensions to fit on page
              const maxWidth = 170; // Leave margins
              const maxHeight = 100; // Reasonable height for preview
              
              // Add image with proper sizing
              doc.addImage(imageData, 'JPEG', 20, yPosition, maxWidth, maxHeight);
              yPosition += maxHeight + 10;
              
              // Add filename below image
              doc.setFontSize(10);
              doc.text(attachment.file_name, 20, yPosition);
              yPosition += 10;
              doc.setFontSize(12);
              
              // Check if we need more space for additional attachments
              if (yPosition > 250) break;
            } catch (imageError) {
              console.error('Error loading image:', imageError);
              // Still show filename even if image fails to load
              doc.text(`📷 ${attachment.file_name} (Preview not available)`, 20, yPosition);
              yPosition += 8;
            }
          }
        }
        
        // Add page footer with task number and total
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Task ${i + 1} of ${selectedTasks.length}`, 20, 280);
        doc.text(`Export Date: ${new Date().toLocaleDateString()}`, 150, 280);
      }
      
      // Save the PDF
      doc.save(`selected-tasks-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Export Successful",
        description: `${selectedTasks.length} tasks exported to PDF successfully.`,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Export Failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-80 backdrop-blur-xl bg-card border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <TaskViewToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
          <Button 
            variant="outline" 
            className="backdrop-blur-xl bg-card border-border text-foreground hover:bg-muted"
            onClick={handleExportTasks}
            disabled={selectedTasks.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export ({selectedTasks.length})
          </Button>
          <Button variant="outline" className="backdrop-blur-xl bg-card border-border text-foreground hover:bg-muted">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>
    </div>
  );
};