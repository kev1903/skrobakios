
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
          // Try to add company logo from database with proper scaling
          if (fullCompanyData?.logo_url) {
            // Calculate proper logo dimensions (maintaining aspect ratio)
            const logoWidth = 40;
            const logoHeight = 20;
            pdf.addImage(fullCompanyData.logo_url, 'PNG', 20, 10, logoWidth, logoHeight);
            
            // Company details next to logo
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text(fullCompanyData.name, 70, 18);
            
            if (fullCompanyData.phone) {
              pdf.setFontSize(9);
              pdf.setFont('helvetica', 'normal');
              pdf.text(fullCompanyData.phone, 70, 24);
            }
          } else {
            // Fallback with company name
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text(fullCompanyData?.name || 'Company', 20, 20);
          }
        } catch (logoError) {
          // Fallback text if logo fails to load
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text(fullCompanyData?.name || 'Company', 20, 20);
        }
        
        if (!isFirstPage) {
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Task Export Report', pageWidth / 2, 20, { align: 'center' });
        }
        
        // Footer with company info, page number and export date
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - 15, { align: 'center' });
        pdf.text(`Export Date: ${exportDate}`, pageWidth - 20, pageHeight - 15, { align: 'right' });
      };
      
      // Cover Page
      addHeaderFooter(pdf, pageNumber, true);
      
      // Cover page title with project info
      if (fullCompanyData?.address) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(fullCompanyData.address, pageWidth / 2, 50, { align: 'center' });
      }
      
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Task Export Report', pageWidth / 2, 65, { align: 'center' });
      
      // Project and company information
      if (fullCompanyData) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        let yPos = 85;
        
        pdf.text(`Company: ${fullCompanyData.name}`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 8;
        
        if (fullCompanyData.phone) {
          pdf.text(`Phone: ${fullCompanyData.phone}`, pageWidth / 2, yPos, { align: 'center' });
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
      
      // Start new page for task table
      pdf.addPage();
      pageNumber++;
      addHeaderFooter(pdf, pageNumber);
      
      // Task table header
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Task Summary', 20, 45);
      
      let yPosition = 60;
      
      // Table setup
      const tableStartY = yPosition;
      const rowHeight = 25;
      const previewSize = 20;
      
      // Column positions and widths
      const columns = [
        { header: 'Preview', x: 20, width: 25 },
        { header: '#', x: 50, width: 20 },
        { header: 'Task Name', x: 75, width: 45 },
        { header: 'Assigned to', x: 125, width: 25 },
        { header: 'Priority', x: 155, width: 20 },
        { header: 'Status', x: 180, width: 20 }
      ];
      
      // Draw table headers
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      columns.forEach(col => {
        pdf.text(col.header, col.x, yPosition);
      });
      
      // Draw header underline
      pdf.line(20, yPosition + 3, 200, yPosition + 3);
      yPosition += 10;
      
      // Draw task rows
      pdf.setFont('helvetica', 'normal');
      
      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        
        // Check for page break
        if (yPosition + rowHeight > pageHeight - 40) {
          pdf.addPage();
          pageNumber++;
          addHeaderFooter(pdf, pageNumber);
          yPosition = 45;
          
          // Re-draw headers
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          columns.forEach(col => {
            pdf.text(col.header, col.x, yPosition);
          });
          pdf.line(20, yPosition + 3, 200, yPosition + 3);
          yPosition += 10;
          pdf.setFont('helvetica', 'normal');
        }
        
        // Draw row background (alternating)
        if (i % 2 === 0) {
          pdf.setFillColor(248, 250, 252); // Light gray
          pdf.rect(20, yPosition - 5, 180, rowHeight, 'F');
        }
        
        // Load and draw attachment preview
        try {
          const { data: attachments } = await supabase
            .from('task_attachments')
            .select('*')
            .eq('task_id', task.id);
            
          if (attachments && attachments.length > 0) {
            const firstAttachment = attachments[0];
            if (firstAttachment.file_type?.startsWith('image/')) {
              try {
                pdf.addImage(
                  firstAttachment.file_url, 
                  'JPEG', 
                  22, 
                  yPosition - 3, 
                  previewSize, 
                  previewSize * 0.75
                );
              } catch (imageError) {
                // Fallback icon for images that can't be loaded
                pdf.setFillColor(200, 200, 200);
                pdf.rect(22, yPosition - 3, previewSize, previewSize * 0.75, 'F');
                pdf.setFontSize(8);
                pdf.text('IMG', 25, yPosition + 8);
              }
            } else {
              // File icon placeholder
              pdf.setFillColor(220, 220, 220);
              pdf.rect(22, yPosition - 3, previewSize, previewSize * 0.75, 'F');
              pdf.setFontSize(8);
              pdf.setTextColor(80, 80, 80);
              pdf.text('FILE', 24, yPosition + 8);
              pdf.setTextColor(0, 0, 0);
            }
          } else {
            // No attachment placeholder
            pdf.setDrawColor(200, 200, 200);
            pdf.rect(22, yPosition - 3, previewSize, previewSize * 0.75);
            pdf.setFontSize(6);
            pdf.setTextColor(150, 150, 150);
            pdf.text('No preview', 23, yPosition + 8);
            pdf.setTextColor(0, 0, 0);
          }
        } catch (error) {
          console.warn('Could not load attachments for task:', task.taskName);
        }
        
        // Draw task data
        pdf.setFontSize(9);
        const taskNumber = task.task_number || `${i + 1}`;
        const taskName = task.taskName.length > 20 ? task.taskName.substring(0, 20) + '...' : task.taskName;
        const assignedTo = task.assignedTo.name.length > 12 ? task.assignedTo.name.substring(0, 12) + '...' : task.assignedTo.name;
        
        pdf.text(taskNumber, columns[1].x, yPosition + 10);
        pdf.text(taskName, columns[2].x, yPosition + 10);
        pdf.text(assignedTo, columns[3].x, yPosition + 10);
        pdf.text(task.priority, columns[4].x, yPosition + 10);
        pdf.text(task.status, columns[5].x, yPosition + 10);
        
        // Draw row separator
        pdf.setDrawColor(230, 230, 230);
        pdf.line(20, yPosition + rowHeight - 5, 200, yPosition + rowHeight - 5);
        
        yPosition += rowHeight;
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
