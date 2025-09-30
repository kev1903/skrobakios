import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';

// Helper function to load images and convert to data URL
const loadImageAsDataUrl = (url: string, isLogo: boolean = false): Promise<string> => {
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
        
        // For logos, add white background to handle transparency issues
        if (isLogo) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        ctx.drawImage(img, 0, 0);
        
        const quality = isLogo ? 0.9 : 0.5;
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
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
  assigned_to?: string;
  created_at: string;
  due_date?: string;
  rfi_number?: string;
  auto_number?: number;
  attachments?: IssueAttachment[];
  profiles?: {
    first_name?: string;
    last_name?: string;
    professional_title?: string;
  };
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
        id, name, description, project_id, banner_image, banner_position,
        companies!projects_company_id_fkey (
          id, name, logo_url, address, abn
        )
      `)
      .eq('id', projectId)
      .single();

    if (projectError) throw projectError;

    // First, fetch ALL issues in the report to establish correct auto_numbers
    const { data: allIssues, error: allIssuesError } = await supabase
      .from('issues')
      .select('id')
      .eq('report_id', reportId)
      .order('created_at', { ascending: true });

    if (allIssuesError) throw allIssuesError;

    // Create a map of issue IDs to their auto_numbers
    const autoNumberMap = new Map<string, number>();
    (allIssues || []).forEach((issue, index) => {
      autoNumberMap.set(issue.id, index + 1);
    });

    // Fetch only selected issues with full data
    const { data: issues, error: issuesError } = await supabase
      .from('issues')
      .select('*')
      .in('id', selectedIssueIds)
      .order('created_at', { ascending: true });

    if (issuesError) throw issuesError;

    // Add auto_number to issues based on their position in the full list
    const typedIssues = ((issues || []) as unknown as IssueData[]).map((issue) => ({
      ...issue,
      auto_number: autoNumberMap.get(issue.id) || 0
    }));

    // Build profile map by user_id for created_by
    const userIds = Array.from(new Set(typedIssues.map(i => i.created_by).filter(Boolean)));
    const profileMap = new Map<string, { first_name?: string; last_name?: string; professional_title?: string }>();
    if (userIds.length > 0) {
      const { data: profileRows } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, professional_title')
        .in('user_id', userIds as string[]);
      (profileRows as any[] | null)?.forEach((p: any) => {
        profileMap.set(p.user_id, { first_name: p.first_name, last_name: p.last_name, professional_title: p.professional_title });
      });
    }

    // Create PDF
    const pdf = new jsPDF({
      compress: true,
      precision: 2
    });
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    let pageNumber = 1;
    
    const exportDate = new Date().toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const fullCompanyData = project?.companies;
    
    // Logo dimensions calculation (reduced by 30%)
    let logoWidth = 28; // 30% smaller than 40
    let logoHeight = 14; // 30% smaller than 20
    
    // Try to use company logo if available, otherwise preload Skrobaki logo from uploads
    let customLogoDataUrl: string | null = null;
    if (!fullCompanyData?.logo_url) {
      try {
        customLogoDataUrl = await loadImageAsDataUrl('/lovable-uploads/0ebb3672-15b3-4c91-8157-7c45f2f190ac.png', true);
      } catch (e) {
        console.warn('Fallback Skrobaki logo not available:', e);
      }
    }
    
    if (fullCompanyData?.logo_url) {
      try {
        const img = new Image();
        img.src = fullCompanyData.logo_url;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        
        // Reduce size by 50% then another 30% (total ~65% reduction) and maintain proper aspect ratio
        logoHeight = 6.3; // 30% smaller than current 9px height
        logoWidth = logoHeight * aspectRatio;
        
        // If width exceeds maximum, constrain by width and recalculate height
        const maxWidth = 60; // Reduced max width
        if (logoWidth > maxWidth) {
          logoWidth = maxWidth;
          logoHeight = logoWidth / aspectRatio;
        }
        
        // Ensure minimum readable size (reduced by 30%)
        if (logoHeight < 9.8) { // 30% smaller than original 14
          logoHeight = 9.8;
          logoWidth = logoHeight * aspectRatio;
        }
      } catch (error) {
        console.warn('Could not get logo dimensions, using default:', error);
        logoWidth = 35; // 30% smaller than 50
        logoHeight = 12.6; // 30% smaller than 18
      }
    }

    // Header and footer helper function
    const addHeaderFooter = async (pdf: jsPDF, pageNum: number, isFirstPage = false) => {
      // Header with company logo and info
      try {
        if (fullCompanyData?.logo_url) {
          // Process logo with white background for better PDF appearance
          const processedLogo = await loadImageAsDataUrl(fullCompanyData.logo_url, true);
          // Center logo vertically in header space (header is ~28px high)
          const logoY = 10 + (18 - logoHeight) / 2; // Center within available space
          pdf.addImage(processedLogo, 'JPEG', 20, logoY, logoWidth, logoHeight);
          
          // Company logo only - no text
        } else if (customLogoDataUrl) {
          // Use fallback Skrobaki logo with proper aspect ratio and alignment
          const processedLogo = await loadImageAsDataUrl(customLogoDataUrl, true);
          // Skrobaki logo dimensions for proper aspect ratio (wider logo, reduced by 30%)
          const skrobakiWidth = 22.75; // 30% smaller
          const skrobakiHeight = 6.3; // 30% smaller
          const logoY = 10 + (18 - skrobakiHeight) / 2; // Center vertically
          pdf.addImage(processedLogo, 'JPEG', 20, logoY, skrobakiWidth, skrobakiHeight);
        }
      } catch (logoError) {
        console.warn('Could not process logo, using company name:', logoError);
        // Show minimal company name as fallback only
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(40, 40, 40);
        pdf.text(fullCompanyData?.name || 'Company', 20, 20); // Centered vertically
      }
      
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

    // Cover Page - Clean Table Format Layout
    await addHeaderFooter(pdf, pageNumber, true);
    
    // Start with proper spacing after header - moved banner up
    let yPos = 35; // Moved up from 50
    
    // Project banner image - centered and properly sized
    if (project.banner_image) {
      try {
        const getBannerDimensions = (url: string): Promise<{width: number, height: number}> => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
            img.onerror = reject;
            img.src = url;
          });
        };
        
        const bannerDimensions = await getBannerDimensions(project.banner_image);
        const bannerAspectRatio = bannerDimensions.width / bannerDimensions.height;
        
        const coverBannerMargin = 30;
        const coverBannerWidth = pageWidth - (2 * coverBannerMargin);
        const bannerHeight = Math.min(coverBannerWidth / bannerAspectRatio, 150);
        const actualBannerWidth = bannerHeight * bannerAspectRatio;
        
        // Center the banner horizontally
        const bannerX = (pageWidth - actualBannerWidth) / 2;
        
        const compressedBanner = await loadImageAsDataUrl(project.banner_image);
        pdf.addImage(
          compressedBanner, 
          'JPEG', 
          bannerX, 
          yPos, 
          actualBannerWidth, 
          bannerHeight
        );
        
        yPos += bannerHeight + 40;
      } catch (bannerError) {
        console.warn('Could not add project banner to PDF:', bannerError);
        yPos += 30;
      }
    } else {
      yPos += 30;
    }

    // Project Information Table - Ultra compact format
    const coverTableStartY = yPos;
    const coverTableMargin = 40;
    const coverTableWidth = pageWidth - (2 * coverTableMargin);
    const leftColWidth = coverTableWidth * 0.4;
    const rightColWidth = coverTableWidth * 0.6;
    const coverRowHeight = 8; // Even smaller row height
    
    // Table header
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(40, 40, 40);
    pdf.text('PROJECT DETAILS', coverTableMargin, coverTableStartY - 8);
    
    // Header underline
    pdf.setDrawColor(150, 150, 150);
    pdf.setLineWidth(0.8);
    pdf.line(coverTableMargin, coverTableStartY - 3, pageWidth - coverTableMargin, coverTableStartY - 3);
    
    let currentY = coverTableStartY + 3;
    
    // Helper function to draw ultra compact table row
    const drawTableRow = (label: string, value: string) => {
      // No background - just plain white
      
      // Label column - very compact text
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(70, 70, 70);
      pdf.text(label, coverTableMargin + 3, currentY + 5);
      
      // Value column - very compact text
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(40, 40, 40);
      pdf.text(value, coverTableMargin + leftColWidth + 3, currentY + 5);
      
      // Very thin separator line
      pdf.setDrawColor(240, 240, 240);
      pdf.setLineWidth(0.1);
      pdf.line(coverTableMargin, currentY + coverRowHeight, pageWidth - coverTableMargin, currentY + coverRowHeight);
      
      currentY += coverRowHeight;
    };

    // Get project data
    const addressText = fullCompanyData?.address?.toString().trim();
    const addressLooksLikeEmail = addressText ? /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(addressText) : false;
    const mainTitle = (addressText && !addressLooksLikeEmail) ? addressText : project.name;
    
    // Issue statistics
    const totalIssues = typedIssues.length;
    const openIssues = typedIssues.filter(issue => issue.status === 'open').length;
    const closedIssues = typedIssues.filter(issue => issue.status === 'closed').length;
    
    // Assignee data - Get assignees from RFIs/issues assigned_to field
    const rfiAssigneeNames = new Set<string>();
    typedIssues.forEach(issue => {
      if (issue.assigned_to) {
        rfiAssigneeNames.add(issue.assigned_to);
      }
    });
    
    const rfiAssigneesText = rfiAssigneeNames.size > 0 ? Array.from(rfiAssigneeNames).join(', ') : 'No assignees';
    
    // Draw table rows
    drawTableRow('Project Name:', mainTitle);
    drawTableRow('Project Number:', project.project_id || 'N/A');
    drawTableRow('Report Type:', `${report.title} (Filtered Selection)`);
    drawTableRow('Assignees:', rfiAssigneesText);
    drawTableRow('Selected Issues:', totalIssues.toString());
    drawTableRow('Open Issues:', openIssues.toString());
    drawTableRow('Date:', exportDate);
    
    // Final table border
    pdf.setDrawColor(150, 150, 150);
    pdf.setLineWidth(0.8);
    pdf.line(coverTableMargin, currentY, pageWidth - coverTableMargin, currentY);

    // Start new page for issue summary table
    pdf.addPage();
    pageNumber++;
    await addHeaderFooter(pdf, pageNumber);
    
    // RFI table header
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 30, 30);
    pdf.text('RFI Summary', 20, 40);
    
    let yPosition = 55;
    
    // Table setup - compact formatting with proper spacing
    const rowHeight = 10; // Very compact row height
    const tableMargin = 20;
    const tableWidth = pageWidth - (2 * tableMargin);
    
    // Column positions and widths - added Due Date column
    const columns = [
      { header: '#', x: tableMargin, width: tableWidth * 0.05, align: 'center' as const },
      { header: 'RFI Title', x: tableMargin + (tableWidth * 0.05), width: tableWidth * 0.38, align: 'left' as const },
      { header: 'Category', x: tableMargin + (tableWidth * 0.43), width: tableWidth * 0.12, align: 'center' as const },
      { header: 'Status', x: tableMargin + (tableWidth * 0.55), width: tableWidth * 0.10, align: 'center' as const },
      { header: 'Due Date', x: tableMargin + (tableWidth * 0.65), width: tableWidth * 0.13, align: 'center' as const },
      { header: 'Assigned To', x: tableMargin + (tableWidth * 0.78), width: tableWidth * 0.22, align: 'left' as const }
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
    for (let i = 0; i < typedIssues.length; i++) {
      const issue = typedIssues[i];
      
      if (yPosition + rowHeight > pageHeight - 40) {
        pdf.addPage();
        pageNumber++;
        await addHeaderFooter(pdf, pageNumber);
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
        pdf.rect(20, yPosition, pageWidth - 40, rowHeight, 'F');
      }
      
      // Draw issue data - added Due Date column
      pdf.setFontSize(9);
      pdf.setTextColor(40, 40, 40);
      
      const issueNumber = issue.auto_number?.toString() || (i + 1).toString();
      const issueTitle = issue.title.length > 45 ? issue.title.substring(0, 45) + '...' : issue.title;
      const category = issue.category || 'N/A';
      const assignedTo = issue.assigned_to || 'Unassigned';
      const dueDate = issue.due_date ? new Date(issue.due_date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) : 'Not Set';
      
      const textY = yPosition + (rowHeight / 2) + 3.5; // Vertically centered accounting for baseline
      pdf.text(issueNumber, columns[0].x + columns[0].width/2, textY, { align: 'center' });
      pdf.text(issueTitle, columns[1].x + 2, textY, { align: 'left' });
      pdf.text(category, columns[2].x + columns[2].width/2, textY, { align: 'center' });
      
      // Status with color coding
      if (issue.status === 'open') {
        pdf.setTextColor(220, 38, 38);
      } else if (issue.status === 'closed') {
        pdf.setTextColor(34, 197, 94);
      } else {
        pdf.setTextColor(107, 114, 128);
      }
      pdf.text(issue.status.toUpperCase(), columns[3].x + columns[3].width/2, textY, { align: 'center' });
      pdf.setTextColor(40, 40, 40);
      
      // Due Date
      pdf.text(dueDate, columns[4].x + columns[4].width/2, textY, { align: 'center' });
      
      // Assigned To
      const assignedToText = assignedTo.length > 20 ? assignedTo.substring(0, 20) + '...' : assignedTo;
      pdf.text(assignedToText, columns[5].x + 2, textY, { align: 'left' });
      
      // Draw separator line
      pdf.setDrawColor(240, 240, 240);
      pdf.setLineWidth(0.3);
      pdf.line(20, yPosition + rowHeight, pageWidth - 20, yPosition + rowHeight);
      
      yPosition += rowHeight;
    }

    // Add individual issue detail pages
    for (let i = 0; i < typedIssues.length; i++) {
      const issue = typedIssues[i];
      
      pdf.addPage();
      pageNumber++;
      await addHeaderFooter(pdf, pageNumber);
      
      // Issue header
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 30, 30);
      const issueNumber = issue.auto_number || `${i + 1}`;
      pdf.text(`${issueNumber}. ${issue.title}`, 20, 45);
      
      // Issue status badge
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      if (issue.status === 'open') {
        pdf.setTextColor(220, 38, 38);
      } else if (issue.status === 'closed') {
        pdf.setTextColor(34, 197, 94);
      } else {
        pdf.setTextColor(107, 114, 128);
      }
      pdf.text(issue.status.toUpperCase(), pageWidth - 20, 45, { align: 'right' });
      
      // Reset text color
      pdf.setTextColor(0, 0, 0);
      
      // Main content area
      let yPos = 60;
      
      // Enhanced attachment display with full margin width
      const attachmentAreaWidth = pageWidth - 40;
      const attachmentAreaHeight = 120;
      let attachmentY = yPos;
      
      if (issue.attachments && issue.attachments.length > 0) {
        // Multiple attachments handling - show up to 3 attachments
        const maxAttachmentsToShow = Math.min(3, issue.attachments.length);
        const attachmentWidth = attachmentAreaWidth / maxAttachmentsToShow - 5;
        const attachmentHeight = 70;
        
        for (let attachmentIndex = 0; attachmentIndex < maxAttachmentsToShow; attachmentIndex++) {
          const attachment = issue.attachments[attachmentIndex];
          const attachmentX = 20 + (attachmentIndex * (attachmentWidth + 5));
          
          if (attachment.type?.startsWith('image/')) {
            try {
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
                const badgeX = attachmentX + attachmentWidth - 10;
                const badgeY = attachmentY + 4;
                pdf.circle(badgeX, badgeY, 5, 'F');
                pdf.setFontSize(8);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(255, 255, 255);
                pdf.text(`${attachmentIndex + 1}`, badgeX, badgeY + 2, { align: 'center' });
                pdf.setFont('helvetica', 'normal');
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
        
        // Show attachment count if more than 3
        if (issue.attachments.length > 3) {
          pdf.setFontSize(9);
          pdf.setTextColor(80, 80, 80);
          pdf.text(`+${issue.attachments.length - 3} more attachments`, 20, attachmentY + attachmentHeight + 15);
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
      
      // Description box
      const descriptionBoxX = 20;
      const actualAttachmentHeight = issue.attachments && issue.attachments.length > 0 ? 70 : attachmentAreaHeight;
      const descriptionBoxY = attachmentY + actualAttachmentHeight + 5;
      const descriptionBoxWidth = 170;
      const descriptionBoxHeight = 40;
      
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
      let detailsY = descriptionBoxY + descriptionBoxHeight + 5;
      const detailsX = 20;
      
      // Category
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(60, 60, 60);
      pdf.text('Category:', detailsX, detailsY);
      detailsY += 5;
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      pdf.text(issue.category || 'N/A', detailsX, detailsY);
      detailsY += 5;
      
      // Created by
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(60, 60, 60);
      pdf.text('Created by:', detailsX, detailsY);
      detailsY += 5;
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      const createdByProfile2 = profileMap.get(issue.created_by);
      const createdByName2 = createdByProfile2 ? `${createdByProfile2.first_name || ''} ${createdByProfile2.last_name || ''}`.trim() || 'Unknown User' : 'Unknown User';
      pdf.text(createdByName2, detailsX, detailsY);
      detailsY += 5;
      
      // Created date
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(60, 60, 60);
      pdf.text('Created:', detailsX, detailsY);
      detailsY += 5;
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      pdf.text(new Date(issue.created_at).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }), detailsX, detailsY);
      detailsY += 5;
      
      // Due date
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(60, 60, 60);
      pdf.text('Due Date:', detailsX, detailsY);
      detailsY += 5;
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      const dueDateText = issue.due_date ? new Date(issue.due_date).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : 'Not Set';
      pdf.text(dueDateText, detailsX, detailsY);
      
      // Comments section placeholder
      if (detailsY < 200) {
        pdf.setFontSize(8);
        pdf.setTextColor(120, 120, 120);
        pdf.text('Additional comments available in app', 20, 220);
        pdf.setTextColor(0, 0, 0);
      }
    }

    // Save the PDF
    const filename = `${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_selected_issues_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};