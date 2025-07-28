
import React, { useState, useEffect, useCallback } from 'react';
import jsPDF from 'jspdf';
import { Project } from '@/hooks/useProjects';
import { TaskProvider } from './tasks/TaskContext';
import { useTaskContext } from './tasks/useTaskContext';
import { TaskListView } from './tasks/TaskListView';
import { EnhancedTaskView } from './tasks/enhanced/EnhancedTaskView';
import { TaskBoardView } from './tasks/TaskBoardView';
import { TaskCalendarView } from './tasks/TaskCalendarView';
import { ProjectSidebar } from './ProjectSidebar';
import { TaskPageHeader } from './tasks/TaskPageHeader';
import { TaskSearchAndActions } from './tasks/TaskSearchAndActions';
import { TaskTabNavigation } from './tasks/TaskTabNavigation';
import { getStatusColor, getStatusText } from './tasks/utils/taskUtils';
import { supabase } from '@/integrations/supabase/client';
import { TaskAttachment } from './tasks/types';
import { useCompany } from '@/contexts/CompanyContext';
import { useCompanies } from '@/hooks/useCompanies';
import { Company } from '@/types/company';

interface ProjectTasksPageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

const ProjectTasksContent = ({ project, onNavigate }: ProjectTasksPageProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("list");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [fullCompanyData, setFullCompanyData] = useState<Company | null>(null);
  const { loadTasksForProject, tasks } = useTaskContext();
  const { currentCompany } = useCompany();
  const { getCompany } = useCompanies();

  // Get selected tasks
  const selectedTasks = tasks.filter(task => selectedTaskIds.includes(task.id));

  // Memoize the task loading to prevent infinite loops
  const loadTasks = useCallback(() => {
    if (project?.id) {
      loadTasksForProject(project.id);
    }
  }, [project?.id, loadTasksForProject]);

  // Load full company data for PDF export
  useEffect(() => {
    const loadCompanyData = async () => {
      if (currentCompany?.id) {
        try {
          const companyData = await getCompany(currentCompany.id);
          setFullCompanyData(companyData);
        } catch (error) {
          console.error('Error loading company data:', error);
        }
      }
    };
    
    loadCompanyData();
  }, [currentCompany?.id, getCompany]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleAddTask = () => {
    setIsAddTaskDialogOpen(true);
  };

  const handleExport = async () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const exportDate = new Date().toLocaleString();
      let pageNumber = 1;
      
      // Header and footer helper function
      const addHeaderFooter = (pdf: jsPDF, pageNum: number, isFirstPage = false) => {
        // Header with company logo and info
        try {
          // Try to add company logo from database
          if (fullCompanyData?.logo_url) {
            pdf.addImage(fullCompanyData.logo_url, 'PNG', 20, 10, 30, 15);
          } else {
            // Fallback with company name or initials
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            const companyInitials = fullCompanyData?.name 
              ? fullCompanyData.name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 3)
              : 'COMP';
            pdf.text(companyInitials, 20, 20);
          }
        } catch (logoError) {
          // Fallback text if logo fails to load
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text(fullCompanyData?.name || 'Company', 20, 20);
        }
        
        // Company name and contact info in header
        if (fullCompanyData) {
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.text(fullCompanyData.name, 55, 15);
          
          if (fullCompanyData.website) {
            pdf.setFontSize(8);
            pdf.text(fullCompanyData.website, 55, 20);
          }
          
          if (fullCompanyData.phone) {
            pdf.setFontSize(8);
            pdf.text(fullCompanyData.phone, 55, 25);
          }
        }
        
        if (!isFirstPage) {
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Task Export Report', pageWidth / 2, 20, { align: 'center' });
        }
        
        // Footer with company info, page number and export date
        try {
          if (fullCompanyData?.logo_url) {
            pdf.addImage(fullCompanyData.logo_url, 'PNG', 20, pageHeight - 25, 20, 10);
          } else {
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'normal');
            pdf.text(fullCompanyData?.name || 'Company', 20, pageHeight - 15);
          }
        } catch (logoError) {
          pdf.setFontSize(8);
          pdf.text(fullCompanyData?.name || 'Company', 20, pageHeight - 15);
        }
        
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - 15, { align: 'center' });
        pdf.text(`Exported: ${exportDate}`, pageWidth - 20, pageHeight - 15, { align: 'right' });
      };
      
      // Cover Page
      addHeaderFooter(pdf, pageNumber, true);
      
      // Cover page title with company branding
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${project.name}`, pageWidth / 2, 50, { align: 'center' });
      pdf.text('Task Export Report', pageWidth / 2, 65, { align: 'center' });
      
      // Company information section
      if (fullCompanyData) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        let yPos = 85;
        
        pdf.text(`Company: ${fullCompanyData.name}`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 8;
        
        if (fullCompanyData.address) {
          pdf.text(`Address: ${fullCompanyData.address}`, pageWidth / 2, yPos, { align: 'center' });
          yPos += 8;
        }
        
        if (fullCompanyData.phone) {
          pdf.text(`Phone: ${fullCompanyData.phone}`, pageWidth / 2, yPos, { align: 'center' });
          yPos += 8;
        }
        
        if (fullCompanyData.website) {
          pdf.text(`Website: ${fullCompanyData.website}`, pageWidth / 2, yPos, { align: 'center' });
          yPos += 8;
        }
        
        if (fullCompanyData.abn) {
          pdf.text(`ABN: ${fullCompanyData.abn}`, pageWidth / 2, yPos, { align: 'center' });
          yPos += 15;
        }
      }
      
      // Export metadata
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Total Tasks: ${tasks.length}`, pageWidth / 2, 130, { align: 'center' });
      pdf.text(`Export Date: ${exportDate}`, pageWidth / 2, 145, { align: 'center' });
      
      // Task list summary
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Task Summary', 20, 160);
      
      let yPosition = 175;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      // Table headers
      pdf.setFont('helvetica', 'bold');
      pdf.text('Task #', 20, yPosition);
      pdf.text('Task Name', 45, yPosition);
      pdf.text('Status', 120, yPosition);
      pdf.text('Priority', 150, yPosition);
      pdf.text('Progress', 175, yPosition);
      yPosition += 8;
      
      // Underline headers
      pdf.line(20, yPosition - 2, 190, yPosition - 2);
      
      pdf.setFont('helvetica', 'normal');
      tasks.forEach((task, index) => {
        if (yPosition > pageHeight - 40) {
          // Start new page if needed
          pdf.addPage();
          pageNumber++;
          addHeaderFooter(pdf, pageNumber);
          yPosition = 40;
          
          // Re-add headers on new page
          pdf.setFont('helvetica', 'bold');
          pdf.text('Task #', 20, yPosition);
          pdf.text('Task Name', 45, yPosition);
          pdf.text('Status', 120, yPosition);
          pdf.text('Priority', 150, yPosition);
          pdf.text('Progress', 175, yPosition);
          yPosition += 8;
          pdf.line(20, yPosition - 2, 190, yPosition - 2);
          pdf.setFont('helvetica', 'normal');
        }
        
        const taskNumber = task.task_number || `T${index + 1}`;
        const taskName = task.taskName.length > 25 ? task.taskName.substring(0, 25) + '...' : task.taskName;
        
        pdf.text(taskNumber, 20, yPosition);
        pdf.text(taskName, 45, yPosition);
        pdf.text(task.status, 120, yPosition);
        pdf.text(task.priority, 150, yPosition);
        pdf.text(`${task.progress}%`, 175, yPosition);
        yPosition += 6;
      });
      
      // Start detailed task pages
      for (const task of tasks) {
        pdf.addPage();
        pageNumber++;
        addHeaderFooter(pdf, pageNumber);
        
        // Add task header with task number
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        const taskHeader = task.task_number ? `${task.task_number}: ${task.taskName}` : task.taskName;
        pdf.text(taskHeader, 20, 45);
        
        // Add task details
        yPosition = 65;
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        
        const details = [
          { label: 'Task Number:', value: task.task_number || 'N/A' },
          { label: 'Priority:', value: task.priority },
          { label: 'Assigned To:', value: task.assignedTo.name },
          { label: 'Due Date:', value: task.dueDate },
          { label: 'Status:', value: task.status },
          { label: 'Progress:', value: `${task.progress}%` },
        ];
        
        if (task.description) {
          details.push({ label: 'Description:', value: task.description });
        }
        
        details.forEach(detail => {
          pdf.setFont('helvetica', 'bold');
          pdf.text(detail.label, 20, yPosition);
          pdf.setFont('helvetica', 'normal');
          pdf.text(detail.value, 60, yPosition);
          yPosition += 10;
        });
        
        // Load and add attachments
        try {
          const { data: attachments } = await supabase
            .from('task_attachments')
            .select('*')
            .eq('task_id', task.id);
            
          if (attachments && attachments.length > 0) {
            yPosition += 10;
            pdf.setFont('helvetica', 'bold');
            pdf.text('Attachments:', 20, yPosition);
            yPosition += 15;
            
            for (const attachment of attachments) {
              // Add attachment info
              pdf.setFont('helvetica', 'normal');
              pdf.text(`File: ${attachment.file_name}`, 25, yPosition);
              yPosition += 8;
              
              // Try to add image preview if it's an image file
              if (attachment.file_type?.startsWith('image/')) {
                try {
                  const imageWidth = pageWidth - 40;
                  const maxImageHeight = 100;
                  
                  // Add image if there's space, otherwise add on next page
                  if (yPosition + maxImageHeight > pageHeight - 40) {
                    pdf.addPage();
                    pageNumber++;
                    addHeaderFooter(pdf, pageNumber);
                    yPosition = 40;
                  }
                  
                  pdf.addImage(attachment.file_url, 'JPEG', 20, yPosition, imageWidth, maxImageHeight);
                  yPosition += maxImageHeight + 10;
                } catch (imageError) {
                  console.warn('Could not add image to PDF:', imageError);
                  pdf.text(`[Image: ${attachment.file_name}]`, 25, yPosition);
                  yPosition += 8;
                }
              } else {
                pdf.text(`[File: ${attachment.file_name}]`, 25, yPosition);
                yPosition += 8;
              }
              
              yPosition += 5;
            }
          }
        } catch (attachmentError) {
          console.error('Error loading attachments for task:', task.taskName, attachmentError);
        }
      }
      
      // Save the PDF
      pdf.save(`${project.name}_tasks_export_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to simple PDF without images
      const pdf = new jsPDF();
      pdf.text('Task Export Error', 20, 20);
      pdf.text('Could not generate full PDF with attachments.', 20, 30);
      pdf.save(`${project.name}_tasks_export.pdf`);
    }
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case "list":
        return <EnhancedTaskView 
          projectId={project.id} 
          viewMode={viewMode}
          selectedTaskIds={selectedTaskIds}
          onTaskSelectionChange={setSelectedTaskIds}
          isAddTaskDialogOpen={isAddTaskDialogOpen}
          onCloseAddTaskDialog={() => setIsAddTaskDialogOpen(false)}
        />;
      case "board":
        return <TaskBoardView projectId={project.id} />;
      case "timeline":
        return <div className="p-8 text-center text-slate-600">Timeline view has been removed</div>;
      case "calendar":
        return <TaskCalendarView />;
      case "overview":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-800">Recent Tasks</h3>
              <TaskListView 
                projectId={project.id} 
                viewMode={viewMode}
                selectedTaskIds={selectedTaskIds}
                onTaskSelectionChange={setSelectedTaskIds}
              />
            </div>
          </div>
        );
      case "team":
        return (
          <div className="glass-card p-8">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">Team Workload</h3>
            <p className="text-slate-700">Team workload analytics and capacity planning will be displayed here.</p>
          </div>
        );
      case "insights":
        return (
          <div className="glass-card p-8">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">Project Insights</h3>
            <p className="text-slate-700">Project insights and performance metrics will be displayed here.</p>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center glass-card p-8">
              <p className="text-slate-800 text-lg">Coming Soon</p>
              <p className="text-slate-600 text-sm mt-2">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} view is under development
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-screen flex backdrop-blur-xl bg-black/20 border border-white/10">
      {/* Project Sidebar */}
      <ProjectSidebar
        project={project}
        onNavigate={onNavigate}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
        activeSection="tasks"
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto ml-48 backdrop-blur-xl bg-white/95 border-l border-white/10">
        <div className="p-8">
          <TaskPageHeader project={project} />
          
          <TaskSearchAndActions
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            selectedTasks={selectedTasks}
            onAddTask={handleAddTask}
            onExport={handleExport}
          />

          <TaskTabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <div>
            {renderActiveView()}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProjectTasksPage = ({ project, onNavigate }: ProjectTasksPageProps) => {

  return (
    <TaskProvider>
      <ProjectTasksContent project={project} onNavigate={onNavigate} />
    </TaskProvider>
  );
};
