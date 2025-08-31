import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';

// Helper function to load images and convert to data URL
const loadImageAsDataUrl = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        ctx.drawImage(img, 0, 0);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
        resolve(dataUrl);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
};

const getAttachmentDataUrl = async (
  attachment: { path?: string; type?: string; url: string }
): Promise<{ dataUrl: string; format: 'JPEG' | 'PNG' }> => {
  if (attachment.path) {
    try {
      const { data, error } = await supabase.storage
        .from('issue-attachments')
        .download(attachment.path);
      if (!error && data) {
        const blob = new Blob([data], { type: attachment.type });
        const url = URL.createObjectURL(blob);
        const compressedDataUrl = await loadImageAsDataUrl(url);
        URL.revokeObjectURL(url);
        return { dataUrl: compressedDataUrl, format: 'JPEG' as const };
      }
    } catch (e) {
      console.warn('Storage download failed, falling back to fetch:', e);
    }
  }
  const compressedDataUrl = await loadImageAsDataUrl(attachment.url);
  return { dataUrl: compressedDataUrl, format: 'JPEG' as const };
};

interface IssueAttachment {
  id: number;
  name: string;
  path: string;
  size: number;
  type: string;
  uploaded_at: string;
  url: string;
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
  attachments?: IssueAttachment[];
}

interface CompanyData {
  id: string;
  name: string;
  logo_url?: string;
  address?: string;
  abn?: string;
}

interface ProjectData {
  id: string;
  name: string;
  description?: string;
  companies?: CompanyData;
}

export const exportSelectedIssuesToPDF = async (
  selectedIssueIds: string[], 
  reportId: string, 
  projectId: string
) => {
  try {
    // Fetch report data
    const { data: report, error: reportError } = await supabase
      .from('issue_reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (reportError) throw reportError;

    // Fetch project data with company details
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(`
        id, name, description,
        companies!projects_company_id_fkey (
          id, name, logo_url, address, abn
        )
      `)
      .eq('id', projectId)
      .single();

    if (projectError) throw projectError;

    // Fetch only selected issues with attachments
    const { data: issues, error: issuesError } = await supabase
      .from('issues')
      .select('*')
      .in('id', selectedIssueIds)
      .order('created_at', { ascending: true });

    if (issuesError) throw issuesError;

    const typedIssues = (issues || []) as unknown as IssueData[];

    // Create PDF
    const pdf = new jsPDF({
      compress: true,
      precision: 2
    });
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    let pageNumber = 1;
    
    const exportDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const fullCompanyData = project?.companies;
    
    // Logo dimensions calculation
    let logoWidth = 40;
    let logoHeight = 20;
    
    if (fullCompanyData?.logo_url) {
      try {
        const img = new Image();
        img.src = fullCompanyData.logo_url;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        logoHeight = 20;
        logoWidth = logoHeight * aspectRatio;
        
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
      try {
        if (fullCompanyData?.logo_url) {
          pdf.addImage(fullCompanyData.logo_url, 'PNG', 20, 10, logoWidth, logoHeight);
          
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(40, 40, 40);
          pdf.text(fullCompanyData.name, 25 + logoWidth, 17);
        } else {
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
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(40, 40, 40);
      pdf.text('Selected Issues Export', pageWidth - 20, 17, { align: 'right' });
      
      pdf.setTextColor(0, 0, 0);
      
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.line(20, 28, pageWidth - 20, 28);
      
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - 15, { align: 'center' });
      pdf.text(`Export Date: ${exportDate}`, pageWidth - 20, pageHeight - 15, { align: 'right' });
      pdf.setTextColor(0, 0, 0);
    };

    // Cover Page
    addHeaderFooter(pdf, pageNumber, true);
    
    let yPos = 50;

    // Cover page content
    if (fullCompanyData?.address) {
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      pdf.text(fullCompanyData.address, pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;
    }
    
    if (fullCompanyData?.abn) {
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(60, 60, 60);
      pdf.text(`ABN: ${fullCompanyData.abn}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 20;
    }

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 30, 30);
    pdf.text(project.name, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(40, 40, 40);
    pdf.text(`${report.title} - Selected Issues`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 20;

    const numberedIssues = typedIssues.map((issue, index) => ({
      ...issue,
      auto_number: index + 1
    }));

    const totalIssues = numberedIssues.length;
    const openIssues = numberedIssues.filter(issue => issue.status === 'open').length;
    const closedIssues = numberedIssues.filter(issue => issue.status === 'closed').length;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(40, 40, 40);
    pdf.text(`Selected Issues: ${totalIssues}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;
    pdf.text(`Open: ${openIssues} | Closed: ${closedIssues}`, pageWidth / 2, yPos, { align: 'center' });

    // Start new page for issue summary table
    pdf.addPage();
    pageNumber++;
    addHeaderFooter(pdf, pageNumber);
    
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 30, 30);
    pdf.text('Selected Issues Summary', 20, 40);
    
    let yPosition = 55;
    
    const rowHeight = 30;
    const previewSize = 20;
    const tableMargin = 20;
    const tableWidth = pageWidth - (2 * tableMargin);
    
    const columns = [
      { header: '#', x: tableMargin, width: tableWidth * 0.08, align: 'center' as const },
      { header: 'Preview', x: tableMargin + (tableWidth * 0.08), width: tableWidth * 0.12, align: 'center' as const },
      { header: 'Issue Title', x: tableMargin + (tableWidth * 0.2), width: tableWidth * 0.35, align: 'center' as const },
      { header: 'Category', x: tableMargin + (tableWidth * 0.55), width: tableWidth * 0.15, align: 'center' as const },
      { header: 'Status', x: tableMargin + (tableWidth * 0.7), width: tableWidth * 0.12, align: 'center' as const },
      { header: 'Location', x: tableMargin + (tableWidth * 0.82), width: tableWidth * 0.18, align: 'center' as const }
    ];
    
    // Draw table headers
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
    pdf.setLineWidth(0.5);
    pdf.line(20, yPosition + 5, pageWidth - 20, yPosition + 5);
    yPosition += 15;
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    
    // Draw issue rows
    for (let i = 0; i < numberedIssues.length; i++) {
      const issue = numberedIssues[i];
      
      if (yPosition + rowHeight > pageHeight - 40) {
        pdf.addPage();
        pageNumber++;
        addHeaderFooter(pdf, pageNumber);
        yPosition = 40;
        
        // Re-draw headers
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
      
      if (i % 2 === 0) {
        pdf.setFillColor(252, 253, 254);
        pdf.rect(20, yPosition - 5, pageWidth - 40, rowHeight, 'F');
      }
      
      // Add preview image
      const previewX = columns[1].x + (columns[1].width - previewSize) / 2;
      const previewY = yPosition - 2;
      
      if (issue.attachments && issue.attachments.length > 0) {
        const firstAttachment = issue.attachments[0];
        if (firstAttachment.type?.startsWith('image/')) {
          try {
            const { dataUrl, format } = await getAttachmentDataUrl(firstAttachment);
            const boxW = previewSize;
            const boxH = previewSize * 0.75;
            const { width: imgW, height: imgH } = await new Promise<{ width: number; height: number }>((resolve) => {
              const imgEl = new Image();
              imgEl.onload = () => resolve({ width: imgEl.naturalWidth, height: imgEl.naturalHeight });
              imgEl.src = dataUrl;
            });
            const scale = imgW && imgH ? Math.min(boxW / imgW, boxH / imgH) : 1;
            const drawW = Math.max(1, (imgW || boxW) * scale);
            const drawH = Math.max(1, (imgH || boxH) * scale);
            const drawX = previewX + (boxW - drawW) / 2;
            const drawY = previewY + (boxH - drawH) / 2;

            pdf.addImage(dataUrl, format, drawX, drawY, drawW, drawH);
          } catch (imageError) {
            console.warn('Failed to load image for preview:', imageError);
            pdf.setFillColor(230, 230, 230);
            pdf.rect(previewX, previewY, previewSize, previewSize * 0.75, 'F');
            pdf.setFontSize(7);
            pdf.setTextColor(120, 120, 120);
            pdf.text('No preview', previewX + previewSize/2, previewY + 12, { align: 'center' });
            pdf.setTextColor(0, 0, 0);
          }
        } else {
          pdf.setFillColor(240, 240, 240);
          pdf.rect(previewX, previewY, previewSize, previewSize * 0.75, 'F');
          pdf.setFontSize(7);
          pdf.setTextColor(100, 100, 100);
          pdf.text('FILE', previewX + previewSize/2, previewY + 12, { align: 'center' });
          pdf.setTextColor(0, 0, 0);
        }
      } else {
        pdf.setFontSize(6);
        pdf.setTextColor(180, 180, 180);
        pdf.text('No preview', previewX + previewSize/2, previewY + 12, { align: 'center' });
        pdf.setTextColor(0, 0, 0);
      }
      
      // Draw issue data
      pdf.setFontSize(9);
      pdf.setTextColor(40, 40, 40);
      
      const issueNumber = issue.auto_number?.toString() || `${i + 1}`;
      const issueTitle = issue.title.length > 40 ? issue.title.substring(0, 40) + '...' : issue.title;
      const category = issue.category || 'N/A';
      const location = issue.location?.length > 20 ? issue.location.substring(0, 20) + '...' : issue.location || 'N/A';
      
      const textY = yPosition + 15;
      pdf.text(issueNumber, columns[0].x + columns[0].width/2, textY, { align: 'center' });
      pdf.text(issueTitle, columns[2].x + columns[2].width/2, textY, { align: 'center' });
      pdf.text(category, columns[3].x + columns[3].width/2, textY, { align: 'center' });
      
      // Status with color coding
      if (issue.status === 'open') {
        pdf.setTextColor(220, 38, 38);
      } else if (issue.status === 'closed') {
        pdf.setTextColor(34, 197, 94);
      } else {
        pdf.setTextColor(107, 114, 128);
      }
      pdf.text(issue.status.toUpperCase(), columns[4].x + columns[4].width/2, textY, { align: 'center' });
      pdf.setTextColor(40, 40, 40);
      
      pdf.text(location, columns[5].x + columns[5].width/2, textY, { align: 'center' });
      
      yPosition += rowHeight;
    }

    // Save the PDF
    const filename = `${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_selected_issues_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};