import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';

// Helper function to load images and convert to data URL with background handling
const loadImageAsDataUrl = (url: string, isLogo: boolean = false): Promise<string> => {
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
        
        // For logos, add white background to handle transparency issues
        if (isLogo) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        ctx.drawImage(img, 0, 0);
        
        // Use higher quality for logos, lower for other images
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
        // Create compressed data URL
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
  // Fallback: fetch the public URL and compress
  const compressedDataUrl = await loadImageAsDataUrl(attachment.url);
  return { dataUrl: compressedDataUrl, format: 'JPEG' as const };
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
  assigned_to?: string;
  created_at: string;
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

export const exportIssueReportToPDF = async (reportId: string, projectId: string) => {
  try {
    // Fetch report data
    const { data: report, error: reportError } = await supabase
      .from('issue_reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (reportError) throw reportError;

    // Fetch project data with company details and project members
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

    // Fetch project members/assignees
    const { data: projectMembers, error: membersError } = await supabase
      .from('project_members')
      .select(`
        id, role, status,
        profiles!project_members_user_id_fkey (
          first_name, last_name
        )
      `)
      .eq('project_id', projectId)
      .eq('status', 'active');

    if (projectError) throw projectError;

    // Fetch associated issues
    const { data: issues, error: issuesError } = await supabase
      .from('issues')
      .select('*')
      .eq('report_id', reportId)
      .order('created_at', { ascending: true });

    if (issuesError) throw issuesError;

    // Type the issues properly and add auto_numbers based on their order
    const typedIssues = ((issues || []) as unknown as IssueData[]).map((issue, index) => ({
      ...issue,
      auto_number: index + 1
    }));

    // Build profile map by user_id for created_by only
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

    // Create PDF with compression enabled
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
    
    // Issue statistics - use already numbered issues
    const numberedIssues = typedIssues; // Already has auto_number from above
    const totalIssues = numberedIssues.length;
    const openIssues = numberedIssues.filter(issue => issue.status === 'open').length;
    const closedIssues = numberedIssues.filter(issue => issue.status === 'closed').length;
    
    // Assignee data - Get assignees from RFIs/issues, not just project members
    const rfiAssigneeIds = new Set<string>();
    typedIssues.forEach(issue => {
      if (issue.created_by) rfiAssigneeIds.add(issue.created_by);
      // Add any other assignee fields if they exist in the issue data
    });
    
    const rfiAssigneeNames: string[] = [];
    for (const userId of rfiAssigneeIds) {
      const profile = profileMap.get(userId);
      if (profile) {
        const name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
        if (name) rfiAssigneeNames.push(name);
      }
    }
    
    const rfiAssigneesText = rfiAssigneeNames.length > 0 ? rfiAssigneeNames.join(', ') : 'No assignees';
    
    // Draw table rows
    drawTableRow('Project Name:', mainTitle);
    drawTableRow('Project Number:', project.project_id || 'N/A');
    drawTableRow('Report Type:', report.title);
    drawTableRow('Assignees:', rfiAssigneesText);
    drawTableRow('Total Issues:', totalIssues.toString());
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
    const rowHeight = 10; // Compact row height for consistency
    const tableMargin = 20;
    const tableWidth = pageWidth - (2 * tableMargin);
    
    // Column positions and widths - standardized with Due Date column
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
    for (let i = 0; i < numberedIssues.length; i++) {
      const issue = numberedIssues[i];
      
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
        pdf.setLineWidth(0.5);
        pdf.line(20, yPosition + 5, pageWidth - 20, yPosition + 5);
        yPosition += 15;
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
      }
      
      // Alternating row background
      if (i % 2 === 0) {
        pdf.setFillColor(252, 253, 254);
        pdf.rect(20, yPosition, pageWidth - 40, rowHeight, 'F');
      }
      
      // Issue data
      pdf.setFontSize(8);
      pdf.setTextColor(40, 40, 40);
      
      const issueNumber = (issue as any).auto_number?.toString() || (i + 1).toString();
      const issueTitle = issue.title.length > 60 ? issue.title.substring(0, 60) + '...' : issue.title;
      const category = issue.category || 'N/A';
      const assignedToName = issue.assigned_to || 'Unassigned';
      
      // Format due date if available
      const dueDate = (issue as any).due_date 
        ? new Date((issue as any).due_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : 'N/A';
      
      const textY = yPosition + 6;
      
      // Draw text
      pdf.text(issueNumber, columns[0].x + columns[0].width/2, textY, { align: 'center' });
      pdf.text(issueTitle, columns[1].x + 2, textY, { align: 'left' });
      pdf.text(category, columns[2].x + columns[2].width/2, textY, { align: 'center' });
      
      // Status with color
      const statusColor = issue.status === 'closed' ? [22, 163, 74] :
                         issue.status === 'in_progress' ? [59, 130, 246] :
                         issue.status === 'open' ? [220, 38, 38] : [107, 114, 128];
      pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      pdf.setFont('helvetica', 'bold');
      pdf.text(issue.status.toUpperCase(), columns[3].x + columns[3].width/2, textY, { align: 'center' });
      
      // Due date and assigned to
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(40, 40, 40);
      pdf.text(dueDate, columns[4].x + columns[4].width/2, textY, { align: 'center' });
      pdf.text(assignedToName, columns[5].x + 2, textY, { align: 'left' });
      
      yPosition += rowHeight;
    }

    // Add individual issue detail pages
    for (let i = 0; i < numberedIssues.length; i++) {
      const issue = numberedIssues[i];
      
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
      pdf.setFont('helvetica', 'bold'); // Make status text bold
      const statusColor = issue.status === 'closed' ? [22, 163, 74] :
                         issue.status === 'in_progress' ? [59, 130, 246] :
                         issue.status === 'open' ? [220, 38, 38] : [107, 114, 128];
      pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      pdf.text(issue.status.toUpperCase(), pageWidth - 20, 45, { align: 'right' });
      
      // Reset text color
      pdf.setTextColor(0, 0, 0);
      
      // Main content area
      let yPos = 60;
      
      // Enhanced attachment display with full margin width - adjusted for A4
      const attachmentAreaWidth = pageWidth - 40; // Full width minus margins (20 each side)
      const attachmentAreaHeight = 120;
      let attachmentY = yPos;
      const maxAttachmentsPerRow = 3; // Define outside the if block for later use
      
      if (issue.attachments && issue.attachments.length > 0) {
        // Multiple attachments handling - show all attachments (max 3 per row)
        const maxAttachmentsToShow = issue.attachments.length;
        const attachmentsInFirstRow = Math.min(maxAttachmentsPerRow, maxAttachmentsToShow);
        const attachmentWidth = attachmentAreaWidth / attachmentsInFirstRow - 5;
        const attachmentHeight = 85;
        
        for (let i = 0; i < maxAttachmentsToShow; i++) {
          const attachment = issue.attachments[i];
          const rowIndex = Math.floor(i / maxAttachmentsPerRow);
          const colIndex = i % maxAttachmentsPerRow;
          const attachmentX = 20 + (colIndex * (attachmentWidth + 5));
          const currentAttachmentY = attachmentY + (rowIndex * (attachmentHeight + 5));
          
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
                const badgeY = currentAttachmentY + 5;
                pdf.circle(badgeX, badgeY, 8, 'F');
                pdf.setFontSize(8);
                pdf.setTextColor(255, 255, 255);
                pdf.text(`${i + 1}`, badgeX, badgeY + 2, { align: 'center' });
                pdf.setTextColor(0, 0, 0);
              }
            } catch (imageError) {
              // Fallback for failed image load
              pdf.setFillColor(240, 240, 240);
              pdf.rect(attachmentX, currentAttachmentY, attachmentWidth, attachmentHeight, 'F');
              pdf.setDrawColor(200, 200, 200);
              pdf.rect(attachmentX, currentAttachmentY, attachmentWidth, attachmentHeight);
              pdf.setFontSize(10);
              pdf.setTextColor(120, 120, 120);
              pdf.text('Image', attachmentX + attachmentWidth/2, currentAttachmentY + attachmentHeight/2 - 5, { align: 'center' });
              pdf.text('Failed', attachmentX + attachmentWidth/2, currentAttachmentY + attachmentHeight/2 + 5, { align: 'center' });
              pdf.setTextColor(0, 0, 0);
            }
          } else {
            // File attachment with icon and name
            pdf.setFillColor(245, 245, 245);
            pdf.rect(attachmentX, currentAttachmentY, attachmentWidth, attachmentHeight, 'F');
            pdf.setDrawColor(200, 200, 200);
            pdf.rect(attachmentX, currentAttachmentY, attachmentWidth, attachmentHeight);
            
            // File icon
            pdf.setFillColor(100, 100, 100);
            const iconSize = 20;
            const iconX = attachmentX + (attachmentWidth - iconSize) / 2;
            const iconY = currentAttachmentY + 15;
            pdf.rect(iconX, iconY, iconSize, iconSize * 1.2, 'F');
            
            // File name
            pdf.setFontSize(8);
            pdf.setTextColor(60, 60, 60);
            const fileName = attachment.name || 'File';
            const truncatedName = fileName.length > 15 ? fileName.substring(0, 12) + '...' : fileName;
            pdf.text(truncatedName, attachmentX + attachmentWidth/2, currentAttachmentY + attachmentHeight - 15, { align: 'center' });
            pdf.setTextColor(0, 0, 0);
          }
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
      // Calculate total attachment area height including all rows
      const totalAttachmentRows = issue.attachments && issue.attachments.length > 0 
        ? Math.ceil(issue.attachments.length / maxAttachmentsPerRow) 
        : 1;
      const actualAttachmentHeight = issue.attachments && issue.attachments.length > 0 
        ? (85 * totalAttachmentRows) + (5 * (totalAttachmentRows - 1))
        : attachmentAreaHeight;
      const descriptionBoxY = attachmentY + actualAttachmentHeight + 5;
      const descriptionBoxWidth = 170; // Wide landscape format
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
      
      // Position other details below the description box - 2 rows, 2 columns format
      let detailsY = descriptionBoxY + descriptionBoxHeight + 10;
      const detailsX = 20;
      const col2X = 110; // Second column X position
      
      // Get values first
      const createdByProfile2 = profileMap.get(issue.created_by);
      const createdByName2 = createdByProfile2 ? `${createdByProfile2.first_name || ''} ${createdByProfile2.last_name || ''}`.trim() || 'Unknown User' : 'Unknown User';
      const assignedToName = issue.assigned_to || 'Unassigned';
      const dueDateFormatted = (issue as any).due_date 
        ? new Date((issue as any).due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        : 'Not Set';
      
      pdf.setFontSize(9);
      
      // First row - Category and Created by (side by side)
      // Category (left column)
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(60, 60, 60);
      pdf.text('Category:', detailsX, detailsY);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      pdf.text(issue.category || 'N/A', detailsX + 20, detailsY);
      
      // Created by (right column, same row)
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(60, 60, 60);
      pdf.text('Created by:', col2X, detailsY);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      pdf.text(createdByName2, col2X + 24, detailsY);
      
      // Second row - Assigned to and Due Date (side by side)
      detailsY += 8;
      
      // Assigned to (left column)
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(60, 60, 60);
      pdf.text('Assigned to:', detailsX, detailsY);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      pdf.text(assignedToName, detailsX + 25, detailsY);
      
      // Due Date (right column, same row)
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(60, 60, 60);
      pdf.text('Due Date:', col2X, detailsY);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      pdf.text(dueDateFormatted, col2X + 20, detailsY);
      
      // Comments section - fetch and display actual comments
      detailsY += 15;
      
      // Fetch comments for this issue
      const { data: comments } = await supabase
        .from('rfi_comments')
        .select(`
          id,
          comment_text,
          created_at,
          user_id
        `)
        .eq('rfi_id', issue.id)
        .order('created_at', { ascending: true });
      
      if (comments && comments.length > 0) {
        // Fetch user profiles for comment authors
        const commentUserIds = [...new Set(comments.map(c => c.user_id))];
        const { data: commentProfiles } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name')
          .in('user_id', commentUserIds);
        
        const commentProfileMap = new Map(
          (commentProfiles || []).map(p => [p.user_id, p])
        );
        
        // Comments header
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(60, 60, 60);
        pdf.text('Comments:', detailsX, detailsY);
        detailsY += 8;
        
        // Display each comment
        pdf.setFontSize(9);
        for (const comment of comments) {
          // Check if we need a new page
          if (detailsY > pageHeight - 60) {
            pdf.addPage();
            pageNumber++;
            await addHeaderFooter(pdf, pageNumber);
            detailsY = 40;
          }
          
          const profile = commentProfileMap.get(comment.user_id);
          const authorName = profile?.first_name && profile?.last_name
            ? `${profile.first_name} ${profile.last_name}`
            : 'Unknown User';
          const commentDate = new Date(comment.created_at).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          
          // Comment author and date
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(60, 60, 60);
          pdf.text(`${authorName} - ${commentDate}`, detailsX, detailsY);
          detailsY += 5;
          
          // Comment text
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(80, 80, 80);
          const wrappedComment = pdf.splitTextToSize(comment.comment_text, pageWidth - 50);
          pdf.text(wrappedComment, detailsX, detailsY);
          detailsY += (wrappedComment.length * 4) + 6;
        }
      } else {
        // No comments message
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(120, 120, 120);
        pdf.text('No comments', detailsX, detailsY);
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

// Export selected issues to PDF (for bulk export)
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
    let logoWidth = 28;
    let logoHeight = 14;
    
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
        logoHeight = 6.3;
        logoWidth = logoHeight * aspectRatio;
        
        const maxWidth = 60;
        if (logoWidth > maxWidth) {
          logoWidth = maxWidth;
          logoHeight = logoWidth / aspectRatio;
        }
        
        if (logoHeight < 9.8) {
          logoHeight = 9.8;
          logoWidth = logoHeight * aspectRatio;
        }
      } catch (error) {
        console.warn('Could not get logo dimensions, using default:', error);
        logoWidth = 35;
        logoHeight = 12.6;
      }
    }

    // Header and footer helper function
    const addHeaderFooter = async (pdf: jsPDF, pageNum: number, isFirstPage = false) => {
      try {
        if (fullCompanyData?.logo_url) {
          const processedLogo = await loadImageAsDataUrl(fullCompanyData.logo_url, true);
          const logoY = 10 + (18 - logoHeight) / 2;
          pdf.addImage(processedLogo, 'JPEG', 20, logoY, logoWidth, logoHeight);
        } else if (customLogoDataUrl) {
          const processedLogo = await loadImageAsDataUrl(customLogoDataUrl, true);
          const skrobakiWidth = 22.75;
          const skrobakiHeight = 6.3;
          const logoY = 10 + (18 - skrobakiHeight) / 2;
          pdf.addImage(processedLogo, 'JPEG', 20, logoY, skrobakiWidth, skrobakiHeight);
        }
      } catch (logoError) {
        console.warn('Could not process logo, using company name:', logoError);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(40, 40, 40);
        pdf.text(fullCompanyData?.name || 'Company', 20, 20);
      }
      
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
    await addHeaderFooter(pdf, pageNumber, true);
    
    let yPos = 35;
    
    // Project banner image
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
        const bannerX = (pageWidth - actualBannerWidth) / 2;
        
        const compressedBanner = await loadImageAsDataUrl(project.banner_image);
        pdf.addImage(compressedBanner, 'JPEG', bannerX, yPos, actualBannerWidth, bannerHeight);
        yPos += bannerHeight + 40;
      } catch (bannerError) {
        console.warn('Could not add project banner to PDF:', bannerError);
        yPos += 30;
      }
    } else {
      yPos += 30;
    }

    // Project Information Table
    const coverTableStartY = yPos;
    const coverTableMargin = 40;
    const coverTableWidth = pageWidth - (2 * coverTableMargin);
    const leftColWidth = coverTableWidth * 0.4;
    const coverRowHeight = 8;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(40, 40, 40);
    pdf.text('PROJECT DETAILS', coverTableMargin, coverTableStartY - 8);
    
    pdf.setDrawColor(150, 150, 150);
    pdf.setLineWidth(0.8);
    pdf.line(coverTableMargin, coverTableStartY - 3, pageWidth - coverTableMargin, coverTableStartY - 3);
    
    let currentY = coverTableStartY + 3;
    
    const drawTableRow = (label: string, value: string) => {
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(70, 70, 70);
      pdf.text(label, coverTableMargin + 3, currentY + 5);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(40, 40, 40);
      pdf.text(value, coverTableMargin + leftColWidth + 3, currentY + 5);
      
      pdf.setDrawColor(240, 240, 240);
      pdf.setLineWidth(0.1);
      pdf.line(coverTableMargin, currentY + coverRowHeight, pageWidth - coverTableMargin, currentY + coverRowHeight);
      
      currentY += coverRowHeight;
    };

    const addressText = fullCompanyData?.address?.toString().trim();
    const addressLooksLikeEmail = addressText ? /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(addressText) : false;
    const mainTitle = (addressText && !addressLooksLikeEmail) ? addressText : project.name;
    
    const totalIssues = typedIssues.length;
    const openIssues = typedIssues.filter(issue => issue.status === 'open').length;
    
    const rfiAssigneeNames = new Set<string>();
    typedIssues.forEach(issue => {
      if (issue.assigned_to) {
        rfiAssigneeNames.add(issue.assigned_to);
      }
    });
    const rfiAssigneesText = rfiAssigneeNames.size > 0 ? Array.from(rfiAssigneeNames).join(', ') : 'No assignees';
    
    drawTableRow('Project Name:', mainTitle);
    drawTableRow('Project Number:', project.project_id || 'N/A');
    drawTableRow('Report Type:', `${report.title} (Filtered Selection)`);
    drawTableRow('Assignees:', rfiAssigneesText);
    drawTableRow('Selected Issues:', totalIssues.toString());
    drawTableRow('Open Issues:', openIssues.toString());
    drawTableRow('Date:', exportDate);
    
    pdf.setDrawColor(150, 150, 150);
    pdf.setLineWidth(0.8);
    pdf.line(coverTableMargin, currentY, pageWidth - coverTableMargin, currentY);

    // Start new page for issue summary table
    pdf.addPage();
    pageNumber++;
    await addHeaderFooter(pdf, pageNumber);
    
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 30, 30);
    pdf.text('RFI Summary', 20, 40);
    
    let yPosition = 55;
    const rowHeight = 10;
    const tableMargin = 20;
    const tableWidth = pageWidth - (2 * tableMargin);
    
    const columns = [
      { header: '#', x: tableMargin, width: tableWidth * 0.05, align: 'center' as const },
      { header: 'RFI Title', x: tableMargin + (tableWidth * 0.05), width: tableWidth * 0.38, align: 'left' as const },
      { header: 'Category', x: tableMargin + (tableWidth * 0.43), width: tableWidth * 0.12, align: 'center' as const },
      { header: 'Status', x: tableMargin + (tableWidth * 0.55), width: tableWidth * 0.10, align: 'center' as const },
      { header: 'Due Date', x: tableMargin + (tableWidth * 0.65), width: tableWidth * 0.13, align: 'center' as const },
      { header: 'Assigned To', x: tableMargin + (tableWidth * 0.78), width: tableWidth * 0.22, align: 'left' as const }
    ];
    
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
      
      pdf.setFontSize(9);
      pdf.setTextColor(40, 40, 40);
      
      const issueNumber = issue.auto_number?.toString() || (i + 1).toString();
      const issueTitle = issue.title.length > 45 ? issue.title.substring(0, 45) + '...' : issue.title;
      const category = issue.category || 'N/A';
      const assignedTo = issue.assigned_to || 'Unassigned';
      const dueDate = (issue as any).due_date ? new Date((issue as any).due_date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) : 'Not Set';
      
      const textY = yPosition + (rowHeight / 2) + 3.5;
      pdf.text(issueNumber, columns[0].x + columns[0].width/2, textY, { align: 'center' });
      pdf.text(issueTitle, columns[1].x + 2, textY, { align: 'left' });
      pdf.text(category, columns[2].x + columns[2].width/2, textY, { align: 'center' });
      
      if (issue.status === 'open') {
        pdf.setTextColor(220, 38, 38);
      } else if (issue.status === 'closed') {
        pdf.setTextColor(34, 197, 94);
      } else {
        pdf.setTextColor(107, 114, 128);
      }
      pdf.text(issue.status.toUpperCase(), columns[3].x + columns[3].width/2, textY, { align: 'center' });
      pdf.setTextColor(40, 40, 40);
      
      pdf.text(dueDate, columns[4].x + columns[4].width/2, textY, { align: 'center' });
      const assignedToText = assignedTo.length > 20 ? assignedTo.substring(0, 20) + '...' : assignedTo;
      pdf.text(assignedToText, columns[5].x + 2, textY, { align: 'left' });
      
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
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 30, 30);
      const issueNumber = issue.auto_number || `${i + 1}`;
      pdf.text(`${issueNumber}. ${issue.title}`, 20, 45);
      
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
      pdf.setTextColor(0, 0, 0);
      
      let yPos = 60;
      const attachmentAreaWidth = pageWidth - 40;
      const attachmentAreaHeight = 120;
      let attachmentY = yPos;
      const maxAttachmentsPerRow2 = 3; // Define for later use
      
      if (issue.attachments && issue.attachments.length > 0) {
        const maxAttachmentsToShow = issue.attachments.length; // Show all attachments
        const attachmentsInFirstRow = Math.min(maxAttachmentsPerRow2, maxAttachmentsToShow);
        const attachmentWidth = attachmentAreaWidth / attachmentsInFirstRow - 5;
        const attachmentHeight = 70;
        
        for (let attachmentIndex = 0; attachmentIndex < maxAttachmentsToShow; attachmentIndex++) {
          const attachment = issue.attachments[attachmentIndex];
          const rowIndex = Math.floor(attachmentIndex / maxAttachmentsPerRow2);
          const colIndex = attachmentIndex % maxAttachmentsPerRow2;
          const attachmentX = 20 + (colIndex * (attachmentWidth + 5));
          const currentAttachmentY2 = attachmentY + (rowIndex * (attachmentHeight + 5));
          
          if (attachment.type?.startsWith('image/')) {
            try {
              const { dataUrl, format } = await getAttachmentDataUrl(attachment);
              const padding = 2;
              const boxW = attachmentWidth - padding * 2;
              const boxH = attachmentHeight - padding * 2;
              
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
              
              if (issue.attachments.length > 1) {
                pdf.setFillColor(0, 0, 0);
                pdf.setDrawColor(0, 0, 0);
                const badgeX = attachmentX + attachmentWidth - 10;
                const badgeY = currentAttachmentY2 + 4;
                pdf.circle(badgeX, badgeY, 5, 'F');
                pdf.setFontSize(8);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(255, 255, 255);
                pdf.text(`${attachmentIndex + 1}`, badgeX, badgeY + 2, { align: 'center' });
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(0, 0, 0);
              }
            } catch (imageError) {
              pdf.setFillColor(240, 240, 240);
              pdf.rect(attachmentX, currentAttachmentY2, attachmentWidth, attachmentHeight, 'F');
              pdf.setDrawColor(200, 200, 200);
              pdf.rect(attachmentX, currentAttachmentY2, attachmentWidth, attachmentHeight);
              pdf.setFontSize(10);
              pdf.setTextColor(120, 120, 120);
              pdf.text('Image', attachmentX + attachmentWidth/2, currentAttachmentY2 + attachmentHeight/2 - 5, { align: 'center' });
              pdf.text('Failed', attachmentX + attachmentWidth/2, currentAttachmentY2 + attachmentHeight/2 + 5, { align: 'center' });
              pdf.setTextColor(0, 0, 0);
            }
          } else {
            pdf.setFillColor(245, 245, 245);
            pdf.rect(attachmentX, currentAttachmentY2, attachmentWidth, attachmentHeight, 'F');
            pdf.setDrawColor(200, 200, 200);
            pdf.rect(attachmentX, currentAttachmentY2, attachmentWidth, attachmentHeight);
            
            pdf.setFillColor(100, 100, 100);
            const iconSize = 20;
            const iconX = attachmentX + (attachmentWidth - iconSize) / 2;
            const iconY = currentAttachmentY2 + 15;
            pdf.rect(iconX, iconY, iconSize, iconSize * 1.2, 'F');
            
            pdf.setFontSize(8);
            pdf.setTextColor(60, 60, 60);
            const fileName = attachment.name || 'File';
            const truncatedName = fileName.length > 15 ? fileName.substring(0, 12) + '...' : fileName;
            pdf.text(truncatedName, attachmentX + attachmentWidth/2, currentAttachmentY2 + attachmentHeight - 15, { align: 'center' });
            pdf.setTextColor(0, 0, 0);
          }
        }
      } else {
        pdf.setFillColor(250, 250, 250);
        pdf.rect(20, attachmentY, attachmentAreaWidth, attachmentAreaHeight, 'F');
        pdf.setDrawColor(220, 220, 220);
        pdf.setLineWidth(1);
        pdf.rect(20, attachmentY, attachmentAreaWidth, attachmentAreaHeight);
        
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
      
      const descriptionBoxX = 20;
      // Calculate total attachment area height including all rows
      const totalAttachmentRows2 = issue.attachments && issue.attachments.length > 0 
        ? Math.ceil(issue.attachments.length / maxAttachmentsPerRow2) 
        : 1;
      const actualAttachmentHeight = issue.attachments && issue.attachments.length > 0 
        ? (70 * totalAttachmentRows2) + (5 * (totalAttachmentRows2 - 1))
        : attachmentAreaHeight;
      const descriptionBoxY = attachmentY + actualAttachmentHeight + 5;
      const descriptionBoxWidth = 170;
      const descriptionBoxHeight = 40;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(60, 60, 60);
      pdf.text('Description:', descriptionBoxX + 5, descriptionBoxY + 10);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      pdf.setFontSize(10);
      const description = issue.description || 'No description provided';
      const wrappedDescription = pdf.splitTextToSize(description, descriptionBoxWidth - 10);
      const maxLines = Math.floor((descriptionBoxHeight - 15) / 4);
      const displayedLines = wrappedDescription.slice(0, maxLines);
      pdf.text(displayedLines, descriptionBoxX + 5, descriptionBoxY + 18);
      
      // Position other details below the description box - 2 rows, 2 columns format
      let detailsY = descriptionBoxY + descriptionBoxHeight + 10;
      const detailsX = 20;
      const col2X = 110;
      
      const createdByProfile2 = profileMap.get(issue.created_by);
      const createdByName2 = createdByProfile2 ? `${createdByProfile2.first_name || ''} ${createdByProfile2.last_name || ''}`.trim() || 'Unknown User' : 'Unknown User';
      const assignedToName = issue.assigned_to || 'Unassigned';
      const dueDateText = (issue as any).due_date ? new Date((issue as any).due_date).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : 'Not Set';
      
      pdf.setFontSize(9);
      
      // First row - Category and Created by (side by side)
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(60, 60, 60);
      pdf.text('Category:', detailsX, detailsY);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      pdf.text(issue.category || 'N/A', detailsX + 20, detailsY);
      
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(60, 60, 60);
      pdf.text('Created by:', col2X, detailsY);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      pdf.text(createdByName2, col2X + 24, detailsY);
      
      // Second row - Assigned to and Due Date (side by side)
      detailsY += 8;
      
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(60, 60, 60);
      pdf.text('Assigned to:', detailsX, detailsY);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      pdf.text(assignedToName, detailsX + 25, detailsY);
      
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(60, 60, 60);
      pdf.text('Due Date:', col2X, detailsY);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      pdf.text(dueDateText, col2X + 20, detailsY);
      
      // Comments section - fetch and display actual comments
      detailsY += 15;
      
      // Fetch comments for this issue
      const { data: comments } = await supabase
        .from('rfi_comments')
        .select(`
          id,
          comment_text,
          created_at,
          user_id
        `)
        .eq('rfi_id', issue.id)
        .order('created_at', { ascending: true });
      
      if (comments && comments.length > 0) {
        // Fetch user profiles for comment authors
        const commentUserIds = [...new Set(comments.map(c => c.user_id))];
        const { data: commentProfiles } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name')
          .in('user_id', commentUserIds);
        
        const commentProfileMap = new Map(
          (commentProfiles || []).map(p => [p.user_id, p])
        );
        
        // Comments header
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(60, 60, 60);
        pdf.text('Comments:', detailsX, detailsY);
        detailsY += 8;
        
        // Display each comment
        pdf.setFontSize(9);
        for (const comment of comments) {
          // Check if we need a new page
          if (detailsY > pageHeight - 60) {
            pdf.addPage();
            pageNumber++;
            await addHeaderFooter(pdf, pageNumber);
            detailsY = 40;
          }
          
          const profile = commentProfileMap.get(comment.user_id);
          const authorName = profile?.first_name && profile?.last_name
            ? `${profile.first_name} ${profile.last_name}`
            : 'Unknown User';
          const commentDate = new Date(comment.created_at).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          
          // Comment author and date
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(60, 60, 60);
          pdf.text(`${authorName} - ${commentDate}`, detailsX, detailsY);
          detailsY += 5;
          
          // Comment text
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(80, 80, 80);
          const wrappedComment = pdf.splitTextToSize(comment.comment_text, pageWidth - 50);
          pdf.text(wrappedComment, detailsX, detailsY);
          detailsY += (wrappedComment.length * 4) + 6;
        }
      } else {
        // No comments message
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(120, 120, 120);
        pdf.text('No comments', detailsX, detailsY);
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