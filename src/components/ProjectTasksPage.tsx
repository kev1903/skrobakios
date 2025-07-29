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
      
      // Pre-calculate logo dimensions if logo exists
      let logoWidth = 40;
      let logoHeight = 20;
      
      if (fullCompanyData?.logo_url) {
        try {
          // Create a promise to get image dimensions
          const getImageDimensions = (url: string): Promise<{width: number, height: number}> => {
            return new Promise((resolve, reject) => {
              const img = new Image();
              img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
              img.onerror = reject;
              img.src = url;
            });
          };
          
          const dimensions = await getImageDimensions(fullCompanyData.logo_url);
          const aspectRatio = dimensions.width / dimensions.height;
          
          // Set desired height and calculate width to maintain aspect ratio
          logoHeight = 20;
          logoWidth = logoHeight * aspectRatio;
          
          // Limit max width to prevent overflow
          if (logoWidth > 60) {
            logoWidth = 60;
            logoHeight = logoWidth / aspectRatio;
          }
        } catch (error) {
          console.warn('Could not get logo dimensions, using default:', error);
          logoWidth = 40;
          logoHeight = 20;
        }
      }
      
      // Header and footer helper function
      const addHeaderFooter = (pdf: jsPDF, pageNum: number, isFirstPage = false) => {
        // Header with company logo and info
        try {
          if (fullCompanyData?.logo_url) {
            pdf.addImage(fullCompanyData.logo_url, 'PNG', 20, 10, logoWidth, logoHeight);
            
            // Company details next to logo with better alignment
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(40, 40, 40);
            pdf.text(fullCompanyData.name, 25 + logoWidth, 17);
          } else {
            // Fallback with company name
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(40, 40, 40);
            pdf.text(fullCompanyData?.name || 'Company', 20, 17);
          }
        } catch (logoError) {
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(40, 40, 40);
          pdf.text(fullCompanyData?.name || 'Company', 20, 17);
        }
        
        // Header title on right side - consistent across all pages
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(40, 40, 40);
        pdf.text('Task Export Report', pageWidth - 20, 17, { align: 'right' });
        
        // Reset text color
        pdf.setTextColor(0, 0, 0);
        
        // Header separator line - moved up for thinner header
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.5);
        pdf.line(20, 28, pageWidth - 20, 28);
        
        // Footer
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - 15, { align: 'center' });
        pdf.text(`Export Date: ${exportDate}`, pageWidth - 20, pageHeight - 15, { align: 'right' });
        pdf.setTextColor(0, 0, 0);
      };
      
      // Cover Page
      addHeaderFooter(pdf, pageNumber, true);
      
      // Add project banner if available
      const projectBanner = localStorage.getItem(`project_banner_${project.id}`);
      let yPos = 50;
      
      if (projectBanner) {
        try {
          // Get banner image dimensions to maintain aspect ratio
          const getBannerDimensions = (url: string): Promise<{width: number, height: number}> => {
            return new Promise((resolve, reject) => {
              const img = new Image();
              img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
              img.onerror = reject;
              img.src = url;
            });
          };
          
          const bannerDimensions = await getBannerDimensions(projectBanner);
          const bannerAspectRatio = bannerDimensions.width / bannerDimensions.height;
          
          // Calculate banner dimensions to fit page width while maintaining aspect ratio
          const bannerMargin = 20;
          const bannerWidth = pageWidth - (2 * bannerMargin);
          const bannerHeight = bannerWidth / bannerAspectRatio;
          
          pdf.addImage(
            projectBanner, 
            'JPEG', 
            bannerMargin, 
            yPos, 
            bannerWidth, 
            bannerHeight
          );
          
          yPos += bannerHeight + 20; // Add spacing after banner
        } catch (bannerError) {
          console.warn('Could not add project banner to PDF:', bannerError);
        }
      }
      
      // Cover page content with better spacing
      
      if (fullCompanyData?.address) {
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(80, 80, 80);
        pdf.text(fullCompanyData.address, pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;
      }
      
      // Project information section
      if (fullCompanyData?.abn) {
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(60, 60, 60);
        pdf.text(`ABN: ${fullCompanyData.abn}`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 20;
      }
      
      // Export metadata
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(40, 40, 40);
      pdf.text(`Selected Tasks: ${selectedTasks.length}`, pageWidth / 2, yPos + 20, { align: 'center' });
      
      // Start new page for task table
      pdf.addPage();
      pageNumber++;
      addHeaderFooter(pdf, pageNumber);
      
      // Task table header with better styling
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 30, 30);
      pdf.text('Task Summary', 20, 40);
      
      let yPosition = 55;
      
      // Table setup with professional dimensions and alignment
      const rowHeight = 30;
      const previewSize = 20;
      
      // Calculate table width to span full page width
      const tableMargin = 20;
      const tableWidth = pageWidth - (2 * tableMargin);
      
      // Column positions and widths - distributed across full page width
      const columns = [
        { header: 'Preview', x: tableMargin, width: tableWidth * 0.15, align: 'center' as const },
        { header: '#', x: tableMargin + (tableWidth * 0.15), width: tableWidth * 0.12, align: 'left' as const },
        { header: 'Task Name', x: tableMargin + (tableWidth * 0.27), width: tableWidth * 0.33, align: 'left' as const },
        { header: 'Assigned to', x: tableMargin + (tableWidth * 0.6), width: tableWidth * 0.2, align: 'left' as const },
        { header: 'Priority', x: tableMargin + (tableWidth * 0.8), width: tableWidth * 0.1, align: 'center' as const },
        { header: 'Status', x: tableMargin + (tableWidth * 0.9), width: tableWidth * 0.1, align: 'center' as const }
      ];
      
      // Draw table headers with background
      pdf.setFillColor(248, 250, 252);
      pdf.rect(20, yPosition - 8, pageWidth - 40, 12, 'F');
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(60, 60, 60);
      
      columns.forEach(col => {
        const textX = col.align === 'center' ? col.x + col.width / 2 : col.x;
        pdf.text(col.header, textX, yPosition, { align: col.align });
      });
      
      // Draw header border
      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.5);
      pdf.line(20, yPosition + 5, pageWidth - 20, yPosition + 5);
      yPosition += 15;
      
      // Reset text properties for table content
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      
      // Draw task rows with improved formatting
      for (let i = 0; i < selectedTasks.length; i++) {
        const task = selectedTasks[i];
        
        // Check for page break
        if (yPosition + rowHeight > pageHeight - 40) {
          pdf.addPage();
          pageNumber++;
          addHeaderFooter(pdf, pageNumber);
          yPosition = 40;
          
          // Re-draw table headers
          pdf.setFillColor(248, 250, 252);
          pdf.rect(20, yPosition - 8, pageWidth - 40, 12, 'F');
          
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(60, 60, 60);
          
          columns.forEach(col => {
            const textX = col.align === 'center' ? col.x + col.width / 2 : col.x;
            pdf.text(col.header, textX, yPosition, { align: col.align });
          });
          
          pdf.setDrawColor(220, 220, 220);
          pdf.line(20, yPosition + 5, pageWidth - 20, yPosition + 5);
          yPosition += 15;
          
          pdf.setTextColor(0, 0, 0);
          pdf.setFont('helvetica', 'normal');
        }
        
        // Draw alternating row background
        if (i % 2 === 0) {
          pdf.setFillColor(252, 253, 254);
          pdf.rect(20, yPosition - 5, pageWidth - 40, rowHeight, 'F');
        }
        
        // Load and draw attachment preview
        try {
          const { data: attachments } = await supabase
            .from('task_attachments')
            .select('*')
            .eq('task_id', task.id);
            
          const previewX = columns[0].x + (columns[0].width - previewSize) / 2;
          const previewY = yPosition - 2;
            
          if (attachments && attachments.length > 0) {
            const firstAttachment = attachments[0];
            if (firstAttachment.file_type?.startsWith('image/')) {
              try {
                pdf.addImage(
                  firstAttachment.file_url, 
                  'JPEG', 
                  previewX, 
                  previewY, 
                  previewSize, 
                  previewSize * 0.75
                );
              } catch (imageError) {
                // Fallback icon for images
                pdf.setFillColor(230, 230, 230);
                pdf.rect(previewX, previewY, previewSize, previewSize * 0.75, 'F');
                pdf.setFontSize(7);
                pdf.setTextColor(120, 120, 120);
                pdf.text('IMG', previewX + previewSize/2, previewY + 12, { align: 'center' });
                pdf.setTextColor(0, 0, 0);
              }
            } else {
              // File icon placeholder
              pdf.setFillColor(240, 240, 240);
              pdf.rect(previewX, previewY, previewSize, previewSize * 0.75, 'F');
              pdf.setDrawColor(200, 200, 200);
              pdf.rect(previewX, previewY, previewSize, previewSize * 0.75);
              pdf.setFontSize(7);
              pdf.setTextColor(100, 100, 100);
              pdf.text('FILE', previewX + previewSize/2, previewY + 12, { align: 'center' });
              pdf.setTextColor(0, 0, 0);
            }
          } else {
            // No attachment placeholder
            pdf.setDrawColor(220, 220, 220);
            pdf.rect(previewX, previewY, previewSize, previewSize * 0.75);
            pdf.setFontSize(6);
            pdf.setTextColor(180, 180, 180);
            pdf.text('No preview', previewX + previewSize/2, previewY + 12, { align: 'center' });
            pdf.setTextColor(0, 0, 0);
          }
        } catch (error) {
          console.warn('Could not load attachments for task:', task.taskName);
        }
        
        // Draw task data with proper alignment
        pdf.setFontSize(9);
        pdf.setTextColor(40, 40, 40);
        
        const taskNumber = task.task_number || `${i + 1}`;
        const taskName = task.taskName.length > 50 ? task.taskName.substring(0, 50) + '...' : task.taskName;
        const assignedTo = task.assignedTo.name.length > 25 ? task.assignedTo.name.substring(0, 25) + '...' : task.assignedTo.name;
        
        // Task data with proper vertical alignment
        const textY = yPosition + 15; // Center text vertically in row
        pdf.text(taskNumber, columns[1].x, textY);
        pdf.text(taskName, columns[2].x, textY);
        pdf.text(assignedTo, columns[3].x, textY);
        
        // Priority with color coding
        const priorityColor = task.priority === 'High' ? [220, 38, 38] : 
                             task.priority === 'Medium' ? [180, 83, 9] : [22, 163, 74];
        pdf.setTextColor(priorityColor[0], priorityColor[1], priorityColor[2]);
        pdf.text(task.priority, columns[4].x + columns[4].width/2, textY, { align: 'center' });
        
        // Status with color coding
        const statusColor = task.status === 'Completed' ? [22, 163, 74] :
                           task.status === 'In Progress' ? [59, 130, 246] :
                           task.status === 'Not Started' ? [107, 114, 128] : [220, 38, 38];
        pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
        pdf.text(task.status, columns[5].x + columns[5].width/2, textY, { align: 'center' });
        
        // Reset text color
        pdf.setTextColor(0, 0, 0);
        
        // Draw subtle row separator
        pdf.setDrawColor(240, 240, 240);
        pdf.setLineWidth(0.3);
        pdf.line(20, yPosition + rowHeight - 5, pageWidth - 20, yPosition + rowHeight - 5);
        
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