import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';

interface IssueReportData {
  id: string;
  title: string;
  description?: string;
  status: string;
  created_at: string;
  project_id: string;
}

interface IssueData {
  id: string;
  title: string;
  category: string;
  status: string;
  description?: string;
  location?: string;
  created_by: string;
  created_at: string;
  auto_number?: number;
}

interface ProjectData {
  id: string;
  name: string;
  description?: string;
}

export const exportIssueReportToPDF = async (reportId: string, projectId: string) => {
  try {
    // Fetch report data
    const { data: report, error: reportError } = await supabase
      .from('issue_reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (reportError) throw reportError;

    // Fetch project data
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name, description')
      .eq('id', projectId)
      .single();

    if (projectError) throw projectError;

    // Fetch associated issues
    const { data: issues, error: issuesError } = await supabase
      .from('issues')
      .select('*')
      .eq('report_id', reportId)
      .order('created_at', { ascending: true });

    if (issuesError) throw issuesError;

    // Create PDF
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const margin = 20;
    let currentY = 30;

    // Helper function to add text with word wrapping
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize = 12) => {
      pdf.setFontSize(fontSize);
      const splitText = pdf.splitTextToSize(text, maxWidth);
      pdf.text(splitText, x, y);
      return y + (splitText.length * fontSize * 0.3);
    };

    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Issue Report', margin, currentY);
    currentY += 15;

    // Project Information
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Project Information', margin, currentY);
    currentY += 10;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Project: ${project.name}`, margin, currentY);
    currentY += 8;
    if (project.description) {
      pdf.text(`Description: ${project.description}`, margin, currentY);
      currentY += 8;
    }
    currentY += 5;

    // Report Information
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Report Information', margin, currentY);
    currentY += 10;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Title: ${report.title}`, margin, currentY);
    currentY += 8;
    pdf.text(`Status: ${report.status}`, margin, currentY);
    currentY += 8;
    pdf.text(`Created: ${new Date(report.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`, margin, currentY);
    currentY += 8;

    if (report.description) {
      currentY = addWrappedText(`Description: ${report.description}`, margin, currentY, pageWidth - (margin * 2));
      currentY += 5;
    }

    currentY += 10;

    // Issues Summary
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Issues Summary', margin, currentY);
    currentY += 10;

    const numberedIssues = (issues || []).map((issue, index) => ({
      ...issue,
      auto_number: index + 1
    }));

    const totalIssues = numberedIssues.length;
    const openIssues = numberedIssues.filter(issue => issue.status === 'open').length;
    const closedIssues = numberedIssues.filter(issue => issue.status === 'closed').length;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Total Issues: ${totalIssues}`, margin, currentY);
    currentY += 8;
    pdf.text(`Open Issues: ${openIssues}`, margin, currentY);
    currentY += 8;
    pdf.text(`Closed Issues: ${closedIssues}`, margin, currentY);
    currentY += 15;

    // Issues Details
    if (numberedIssues.length > 0) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Issue Details', margin, currentY);
      currentY += 15;

      numberedIssues.forEach((issue, index) => {
        // Check if we need a new page
        if (currentY > 250) {
          pdf.addPage();
          currentY = 30;
        }

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${issue.auto_number}. ${issue.title}`, margin, currentY);
        currentY += 10;

        pdf.setFont('helvetica', 'normal');
        
        // Create a table-like structure for issue details
        const details = [
          `Category: ${issue.category || 'N/A'}`,
          `Status: ${issue.status || 'N/A'}`,
          `Created By: ${issue.created_by || 'N/A'}`,
          `Location: ${issue.location || 'N/A'}`,
          `Created: ${new Date(issue.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}`
        ];

        details.forEach(detail => {
          pdf.text(detail, margin + 10, currentY);
          currentY += 6;
        });

        if (issue.description) {
          currentY += 3;
          currentY = addWrappedText(`Description: ${issue.description}`, margin + 10, currentY, pageWidth - (margin * 2) - 10);
        }

        currentY += 10;

        // Add separator line
        if (index < numberedIssues.length - 1) {
          pdf.setDrawColor(200, 200, 200);
          pdf.line(margin, currentY, pageWidth - margin, currentY);
          currentY += 10;
        }
      });
    }

    // Footer
    const totalPages = pdf.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(
        `Generated on ${new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}`,
        margin,
        pdf.internal.pageSize.height - 15
      );
      pdf.text(
        `Page ${i} of ${totalPages}`,
        pageWidth - margin - 20,
        pdf.internal.pageSize.height - 15
      );
    }

    // Save the PDF
    const filename = `${report.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report.pdf`;
    pdf.save(filename);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};