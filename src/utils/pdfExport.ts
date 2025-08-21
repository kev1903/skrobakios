import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';

// Helper function to load images and convert to data URL
const loadImageAsDataUrl = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Handle CORS
    
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
        
        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
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

// Convert Blob to data URL
const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

// Prefer downloading from Supabase Storage to avoid CORS/canvas tainting
const getAttachmentDataUrl = async (
  attachment: { path?: string; type?: string; url: string }
): Promise<{ dataUrl: string; format: 'JPEG' | 'PNG' }> => {
  // Try storage download first when we have a path
  if (attachment.path) {
    try {
      const { data, error } = await supabase.storage
        .from('issue-attachments')
        .download(attachment.path);
      if (!error && data) {
        const dataUrl = await blobToDataUrl(data);
        const format: 'JPEG' | 'PNG' = attachment.type?.toLowerCase().includes('png') ? 'PNG' : 'JPEG';
        return { dataUrl, format };
      }
    } catch (e) {
      console.warn('Storage download failed, falling back to fetch:', e);
    }
  }
  // Fallback: fetch the public URL
  const res = await fetch(attachment.url, { mode: 'cors' });
  const blob = await res.blob();
  const format: 'JPEG' | 'PNG' =
    attachment.type?.toLowerCase().includes('png') || blob.type.toLowerCase().includes('png')
      ? 'PNG'
      : 'JPEG';
  const dataUrl = await blobToDataUrl(blob);
  return { dataUrl, format };
};

interface IssueReportData {
  id: string;
  title: string;
  description?: string;
  status: string;
  created_at: string;
  project_id: string;
}

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

export const exportIssueReportToPDF = async (reportId: string, projectId: string) => {
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

    // Fetch associated issues with attachments
    const { data: issues, error: issuesError } = await supabase
      .from('issues')
      .select('*')
      .eq('report_id', reportId)
      .order('created_at', { ascending: true });

    if (issuesError) throw issuesError;

    // Type the issues properly
    const typedIssues = (issues || []) as unknown as IssueData[];

    // Create PDF
    const pdf = new jsPDF();
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
      // Header with company logo and info
      try {
        if (fullCompanyData?.logo_url) {
          pdf.addImage(fullCompanyData.logo_url, 'PNG', 20, 10, logoWidth, logoHeight);
          
          // Company details next to logo
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
      
      // Header title on right side
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(40, 40, 40);
      pdf.text('Issue Report Export', pageWidth - 20, 17, { align: 'right' });
      
      // Reset text color
      pdf.setTextColor(0, 0, 0);
      
      // Header separator line
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
        
        yPos += bannerHeight + 20;
      } catch (bannerError) {
        console.warn('Could not add project banner to PDF:', bannerError);
      }
    }

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

    // Project and Report Information
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 30, 30);
    pdf.text(project.name, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(40, 40, 40);
    pdf.text(report.title, pageWidth / 2, yPos, { align: 'center' });
    yPos += 20;

    // Export metadata
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
    pdf.text(`Total Issues: ${totalIssues}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;
    pdf.text(`Open: ${openIssues} | Closed: ${closedIssues}`, pageWidth / 2, yPos, { align: 'center' });

    // Start new page for issue summary table
    pdf.addPage();
    pageNumber++;
    addHeaderFooter(pdf, pageNumber);
    
    // Issue table header
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 30, 30);
    pdf.text('Issue Summary', 20, 40);
    
    let yPosition = 55;
    
    // Table setup
    const rowHeight = 30;
    const previewSize = 20;
    const tableMargin = 20;
    const tableWidth = pageWidth - (2 * tableMargin);
    
    // Column positions and widths
    const columns = [
      { header: 'Preview', x: tableMargin, width: tableWidth * 0.12, align: 'center' as const },
      { header: '#', x: tableMargin + (tableWidth * 0.12), width: tableWidth * 0.08, align: 'left' as const },
      { header: 'Issue Title', x: tableMargin + (tableWidth * 0.2), width: tableWidth * 0.35, align: 'left' as const },
      { header: 'Category', x: tableMargin + (tableWidth * 0.55), width: tableWidth * 0.15, align: 'left' as const },
      { header: 'Status', x: tableMargin + (tableWidth * 0.7), width: tableWidth * 0.12, align: 'center' as const },
      { header: 'Location', x: tableMargin + (tableWidth * 0.82), width: tableWidth * 0.18, align: 'left' as const }
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
    
    // Draw issue rows
    for (let i = 0; i < numberedIssues.length; i++) {
      const issue = numberedIssues[i];
      
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
      const previewX = columns[0].x + (columns[0].width - previewSize) / 2;
      const previewY = yPosition - 2;
      
      if (issue.attachments && issue.attachments.length > 0) {
        const firstAttachment = issue.attachments[0];
        if (firstAttachment.type?.startsWith('image/')) {
          try {
            // Load image and convert to base64
const { dataUrl, format } = await getAttachmentDataUrl(firstAttachment);
// Fit image into preview box while preserving aspect ratio
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
            // Fallback icon for images
            pdf.setFillColor(230, 230, 230);
            pdf.rect(previewX, previewY, previewSize, previewSize * 0.75, 'F');
            pdf.setFontSize(7);
            pdf.setTextColor(120, 120, 120);
            pdf.text('No preview', previewX + previewSize/2, previewY + 12, { align: 'center' });
            pdf.setTextColor(0, 0, 0);
          }
        } else {
          // File icon placeholder
          pdf.setFillColor(240, 240, 240);
          pdf.rect(previewX, previewY, previewSize, previewSize * 0.75, 'F');
          pdf.setFontSize(7);
          pdf.setTextColor(100, 100, 100);
          pdf.text('FILE', previewX + previewSize/2, previewY + 12, { align: 'center' });
          pdf.setTextColor(0, 0, 0);
        }
      } else {
        // No attachment placeholder
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
      
      const textY = yPosition + 15; // Center text vertically in row
      pdf.text(issueNumber, columns[1].x, textY);
      pdf.text(issueTitle, columns[2].x, textY);
      pdf.text(category, columns[3].x, textY);
      
      // Status with color coding
      const statusColor = issue.status === 'closed' ? [22, 163, 74] :
                         issue.status === 'in_progress' ? [59, 130, 246] :
                         issue.status === 'open' ? [220, 38, 38] : [107, 114, 128];
      pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      pdf.text(issue.status, columns[4].x + columns[4].width/2, textY, { align: 'center' });
      
      // Reset text color for location
      pdf.setTextColor(0, 0, 0);
      pdf.text(location, columns[5].x, textY);
      
      // Draw subtle row separator
      pdf.setDrawColor(240, 240, 240);
      pdf.setLineWidth(0.3);
      pdf.line(20, yPosition + rowHeight - 5, pageWidth - 20, yPosition + rowHeight - 5);
      
      yPosition += rowHeight;
    }

    // Add individual issue detail pages
    for (let i = 0; i < numberedIssues.length; i++) {
      const issue = numberedIssues[i];
      
      pdf.addPage();
      pageNumber++;
      addHeaderFooter(pdf, pageNumber);
      
      // Issue header
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 30, 30);
      const issueNumber = issue.auto_number || `${i + 1}`;
      pdf.text(`${issueNumber}. ${issue.title}`, 20, 45);
      
      // Issue status badge
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      const statusColor = issue.status === 'closed' ? [22, 163, 74] :
                         issue.status === 'in_progress' ? [59, 130, 246] :
                         issue.status === 'open' ? [220, 38, 38] : [107, 114, 128];
      pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      pdf.text(issue.status, pageWidth - 20, 45, { align: 'right' });
      
      // Reset text color
      pdf.setTextColor(0, 0, 0);
      
      // Main content area
      let yPos = 60;
      
      // Enhanced attachment display with full margin width - adjusted for A4
      const attachmentAreaWidth = pageWidth - 40; // Full width minus margins (20 each side)
      const attachmentAreaHeight = 120;
      let attachmentY = yPos;
      
      if (issue.attachments && issue.attachments.length > 0) {
        // Multiple attachments handling - limit to 2 for better fit
        const maxAttachmentsToShow = Math.min(2, issue.attachments.length);
        const attachmentWidth = attachmentAreaWidth / maxAttachmentsToShow - 5;
        const attachmentHeight = 85;
        
        for (let i = 0; i < maxAttachmentsToShow; i++) {
          const attachment = issue.attachments[i];
          const attachmentX = 20 + (i * (attachmentWidth + 5));
          
          if (attachment.type?.startsWith('image/')) {
            try {
              
// Load image and convert to base64
const { dataUrl, format } = await getAttachmentDataUrl(attachment);

// Preserve original aspect ratio within the box
const padding = 2;
const boxW = attachmentWidth - padding * 2;
const boxH = attachmentHeight - padding * 2;

// Obtain natural image dimensions
const { width: imgW, height: imgH } = await new Promise<{ width: number; height: number }>((resolve) => {
  const imgEl = new Image();
  imgEl.onload = () => resolve({ width: imgEl.naturalWidth, height: imgEl.naturalHeight });
  imgEl.src = dataUrl;
});

const scale = imgW && imgH ? Math.min(boxW / imgW, boxH / imgH) : 1;
const drawW = Math.max(1, (imgW || boxW) * scale);
const drawH = Math.max(1, (imgH || boxH) * scale);
const drawX = attachmentX + (attachmentWidth - drawW) / 2;
const drawY = attachmentY + (attachmentHeight - drawH) / 2;

pdf.addImage(dataUrl, format, drawX, drawY, drawW, drawH);
              // Add attachment number if multiple
              if (issue.attachments.length > 1) {
                pdf.setFillColor(0, 0, 0);
                pdf.setDrawColor(0, 0, 0);
                const badgeX = attachmentX + attachmentWidth - 15;
                const badgeY = attachmentY + 5;
                pdf.circle(badgeX, badgeY, 8, 'F');
                pdf.setFontSize(8);
                pdf.setTextColor(255, 255, 255);
                pdf.text(`${i + 1}`, badgeX, badgeY + 2, { align: 'center' });
                pdf.setTextColor(0, 0, 0);
              }
            } catch (imageError) {
              // Fallback for failed image load
              pdf.setFillColor(240, 240, 240);
              pdf.rect(attachmentX, attachmentY, attachmentWidth, attachmentHeight, 'F');
              pdf.setDrawColor(200, 200, 200);
              pdf.rect(attachmentX, attachmentY, attachmentWidth, attachmentHeight);
              pdf.setFontSize(10);
              pdf.setTextColor(120, 120, 120);
              pdf.text('Image', attachmentX + attachmentWidth/2, attachmentY + attachmentHeight/2 - 5, { align: 'center' });
              pdf.text('Failed', attachmentX + attachmentWidth/2, attachmentY + attachmentHeight/2 + 5, { align: 'center' });
              pdf.setTextColor(0, 0, 0);
            }
          } else {
            // File attachment with icon and name
            pdf.setFillColor(245, 245, 245);
            pdf.rect(attachmentX, attachmentY, attachmentWidth, attachmentHeight, 'F');
            pdf.setDrawColor(200, 200, 200);
            pdf.rect(attachmentX, attachmentY, attachmentWidth, attachmentHeight);
            
            // File icon
            pdf.setFillColor(100, 100, 100);
            const iconSize = 20;
            const iconX = attachmentX + (attachmentWidth - iconSize) / 2;
            const iconY = attachmentY + 15;
            pdf.rect(iconX, iconY, iconSize, iconSize * 1.2, 'F');
            
            // File name
            pdf.setFontSize(8);
            pdf.setTextColor(60, 60, 60);
            const fileName = attachment.name || 'File';
            const truncatedName = fileName.length > 15 ? fileName.substring(0, 12) + '...' : fileName;
            pdf.text(truncatedName, attachmentX + attachmentWidth/2, attachmentY + attachmentHeight - 15, { align: 'center' });
            pdf.setTextColor(0, 0, 0);
          }
        }
        
        // Show attachment count if more than 2
        if (issue.attachments.length > 2) {
          pdf.setFontSize(9);
          pdf.setTextColor(80, 80, 80);
          pdf.text(`+${issue.attachments.length - 2} more attachments`, 20, attachmentY + attachmentHeight + 15);
          pdf.setTextColor(0, 0, 0);
        }
      } else {
        // No attachment placeholder
        pdf.setFillColor(250, 250, 250);
        pdf.rect(20, attachmentY, attachmentAreaWidth, attachmentAreaHeight, 'F');
        pdf.setDrawColor(220, 220, 220);
        pdf.setLineWidth(1);
        pdf.rect(20, attachmentY, attachmentAreaWidth, attachmentAreaHeight);
        
        // Dashed border for empty state
        pdf.setDrawColor(180, 180, 180);
        pdf.setLineWidth(0.5);
        // Create dashed effect with multiple lines
        const dashLength = 3;
        const gapLength = 3;
        for (let x = 20; x < 20 + attachmentAreaWidth; x += dashLength + gapLength) {
          pdf.line(x, attachmentY, Math.min(x + dashLength, 20 + attachmentAreaWidth), attachmentY);
          pdf.line(x, attachmentY + attachmentAreaHeight, Math.min(x + dashLength, 20 + attachmentAreaWidth), attachmentY + attachmentAreaHeight);
        }
        for (let y = attachmentY; y < attachmentY + attachmentAreaHeight; y += dashLength + gapLength) {
          pdf.line(20, y, 20, Math.min(y + dashLength, attachmentY + attachmentAreaHeight));
          pdf.line(20 + attachmentAreaWidth, y, 20 + attachmentAreaWidth, Math.min(y + dashLength, attachmentY + attachmentAreaHeight));
        }
        
        pdf.setFontSize(12);
        pdf.setTextColor(150, 150, 150);
        pdf.text('No Attachments', 20 + attachmentAreaWidth/2, attachmentY + attachmentAreaHeight/2 - 5, { align: 'center' });
        pdf.text('Available', 20 + attachmentAreaWidth/2, attachmentY + attachmentAreaHeight/2 + 5, { align: 'center' });
        pdf.setTextColor(0, 0, 0);
      }
      
      // Description box - positioned below attachments in landscape format
      const descriptionBoxX = 20;
      // Use actual image height (85) when images exist, otherwise use full area height (120)
      const actualAttachmentHeight = issue.attachments && issue.attachments.length > 0 ? 85 : attachmentAreaHeight;
      const descriptionBoxY = attachmentY + actualAttachmentHeight + 10;
      const descriptionBoxWidth = 170; // Wide landscape format
      const descriptionBoxHeight = 40;
      
      // Draw description box border
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.rect(descriptionBoxX, descriptionBoxY, descriptionBoxWidth, descriptionBoxHeight);
      
      // Description title
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(60, 60, 60);
      pdf.text('Description:', descriptionBoxX + 5, descriptionBoxY + 10);
      
      // Description content
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      pdf.setFontSize(10);
      const description = issue.description || 'No description provided';
      const wrappedDescription = pdf.splitTextToSize(description, descriptionBoxWidth - 10);
      
      // Ensure description fits within the box
      const maxLines = Math.floor((descriptionBoxHeight - 15) / 4);
      const displayedLines = wrappedDescription.slice(0, maxLines);
      pdf.text(displayedLines, descriptionBoxX + 5, descriptionBoxY + 18);
      
      // Position other details below the description box
      let detailsY = descriptionBoxY + descriptionBoxHeight + 15;
      const detailsX = 20;
      
      // Category
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(60, 60, 60);
      pdf.text('Category:', detailsX, detailsY);
      detailsY += 8;
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      pdf.text(issue.category || 'N/A', detailsX, detailsY);
      detailsY += 12;
      
      // Location
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(60, 60, 60);
      pdf.text('Location:', detailsX, detailsY);
      detailsY += 8;
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      const locationText = issue.location || 'N/A';
      const truncatedLocation = locationText.length > 25 ? locationText.substring(0, 25) + '...' : locationText;
      pdf.text(truncatedLocation, detailsX, detailsY);
      detailsY += 12;
      
      // Created by
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(60, 60, 60);
      pdf.text('Created by:', detailsX, detailsY);
      detailsY += 8;
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      const createdByText = issue.created_by || 'N/A';
      const truncatedCreatedBy = createdByText.length > 20 ? createdByText.substring(0, 20) + '...' : createdByText;
      pdf.text(truncatedCreatedBy, detailsX, detailsY);
      detailsY += 12;
      
      // Created date
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(60, 60, 60);
      pdf.text('Created:', detailsX, detailsY);
      detailsY += 8;
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      pdf.text(new Date(issue.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }), detailsX, detailsY);
      
      // Comments section placeholder - positioned properly within A4 bounds
      if (detailsY < 200) {
        pdf.setFontSize(8);
        pdf.setTextColor(120, 120, 120);
        pdf.text('Additional comments available in app', 20, 220);
        pdf.setTextColor(0, 0, 0);
      }
    }

    // Save the PDF
    const filename = `${report.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report.pdf`;
    pdf.save(filename);

  } catch (error) {
    console.error('Error generating PDF:', error);
    // Fallback to simple PDF without images
    const pdf = new jsPDF();
    pdf.text('Issue Report Export Error', 20, 20);
    pdf.text('Could not generate full PDF with attachments.', 20, 30);
    pdf.save('issue_report_export.pdf');
  }
};