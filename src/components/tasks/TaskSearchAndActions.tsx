import React from 'react';
import { Download, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TaskViewToggle } from './TaskViewToggle';
import { Task } from './TaskContext';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';

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

  const handleExportTasks = () => {
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
      
      // Add title
      doc.setFontSize(20);
      doc.text('Selected Tasks Export', 20, 30);
      
      // Add export date
      doc.setFontSize(12);
      doc.text(`Export Date: ${new Date().toLocaleDateString()}`, 20, 45);
      doc.text(`Total Tasks: ${selectedTasks.length}`, 20, 55);
      
      // Add tasks list
      let yPosition = 75;
      
      selectedTasks.forEach((task, index) => {
        if (yPosition > 280) { // Start new page if needed
          doc.addPage();
          yPosition = 20;
        }
        
        // Task header
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(`${index + 1}. ${task.taskName}`, 20, yPosition);
        yPosition += 10;
        
        // Task details
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Priority: ${task.priority}`, 25, yPosition);
        yPosition += 6;
        doc.text(`Status: ${task.status}`, 25, yPosition);
        yPosition += 6;
        doc.text(`Due Date: ${task.dueDate || 'Not set'}`, 25, yPosition);
        yPosition += 6;
        doc.text(`Progress: ${task.progress}%`, 25, yPosition);
        yPosition += 6;
        doc.text(`Assigned To: ${task.assignedTo?.name || 'Unassigned'}`, 25, yPosition);
        yPosition += 6;
        
        if (task.description) {
          doc.text(`Description: ${task.description}`, 25, yPosition);
          yPosition += 6;
        }
        
        yPosition += 8; // Space between tasks
      });
      
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