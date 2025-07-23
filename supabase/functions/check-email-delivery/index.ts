
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckRequest {
  resendEmailId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const { resendEmailId }: CheckRequest = await req.json();
    console.log('Checking delivery status for email ID:', resendEmailId);

    // Get email details from Resend API
    const emailResponse = await fetch(`https://api.resend.com/emails/${resendEmailId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
      },
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Failed to fetch email details:', errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch email details',
          status: emailResponse.status,
          details: errorText
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailData = await emailResponse.json();
    console.log('Raw email data from Resend:', JSON.stringify(emailData, null, 2));

    // Analyze the delivery with enhanced diagnostics
    const recipientDomain = emailData.to?.[0]?.split('@')[1]?.toLowerCase() || 'unknown';
    const lastEvent = emailData.last_event || 'unknown';
    
    const analysis = {
      email_id: resendEmailId,
      recipient: emailData.to?.[0] || 'unknown',
      recipient_domain: recipientDomain,
      status: lastEvent,
      created_at: emailData.created_at,
      from: emailData.from,
      subject: emailData.subject,
      is_microsoft_domain: recipientDomain.includes('outlook') || recipientDomain.includes('hotmail') || recipientDomain.includes('live') || recipientDomain.includes('microsoft'),
      is_business_domain: isBusinessDomain(recipientDomain),
      is_gmail_domain: recipientDomain.includes('gmail') || recipientDomain.includes('googlemail'),
      likely_issue: getLikelyIssue(emailData, recipientDomain),
      recommendations: getRecommendations(emailData, recipientDomain),
      troubleshooting_steps: getTroubleshootingSteps(emailData, recipientDomain),
      delivery_confidence: getDeliveryConfidence(emailData, recipientDomain)
    };

    return new Response(
      JSON.stringify({ 
        success: true,
        analysis,
        raw_data: emailData
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error checking email delivery:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

function isBusinessDomain(domain: string): boolean {
  // Common business email indicators
  const businessKeywords = ['accounts', 'admin', 'info', 'contact', 'support', 'office'];
  const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com', 'rocketmail.com'];
  
  return !personalDomains.includes(domain) || businessKeywords.some(keyword => domain.includes(keyword));
}

function getLikelyIssue(emailData: any, domain: string): string {
  const lastEvent = emailData.last_event;
  
  if (lastEvent === 'delivered') {
    if (domain.includes('outlook') || domain.includes('hotmail') || domain.includes('live') || domain.includes('microsoft')) {
      return 'Microsoft aggressive spam filtering - emails marked as delivered but likely filtered to quarantine/junk';
    } else if (domain.includes('gmail')) {
      return 'Gmail filtering to spam folder or promotions tab';
    } else if (isBusinessDomain(domain)) {
      return 'Business email server filtering - may be quarantined by corporate security';
    } else {
      return 'Email delivered but may be in spam/junk folder';
    }
  } else if (lastEvent === 'bounced') {
    return 'Email bounced - invalid address, mailbox full, or server rejection';
  } else if (lastEvent === 'complained') {
    return 'Recipient marked email as spam';
  } else if (lastEvent === 'delivery_delayed') {
    return 'Email delivery delayed - recipient server temporarily unavailable';
  } else {
    return `Email status: ${lastEvent} - may indicate delivery issues`;
  }
}

function getRecommendations(emailData: any, domain: string): string[] {
  const recommendations = [];
  const lastEvent = emailData.last_event;
  
  if (lastEvent === 'delivered') {
    if (domain.includes('outlook') || domain.includes('hotmail') || domain.includes('live') || domain.includes('microsoft')) {
      recommendations.push('Check junk/spam folder in Outlook');
      recommendations.push('Check quarantine folder (if corporate email)');
      recommendations.push('Add noreply@skrobaki.com to safe senders list');
      recommendations.push('Contact IT department about email filtering rules');
      recommendations.push('Try sending from kevin@skrobaki.com instead');
    } else if (domain.includes('gmail')) {
      recommendations.push('Check spam folder');
      recommendations.push('Check promotions tab');
      recommendations.push('Mark sender as important');
      recommendations.push('Add noreply@skrobaki.com to contacts');
    } else if (isBusinessDomain(domain)) {
      recommendations.push('Check spam/junk folder');
      recommendations.push('Contact email administrator about email filtering');
      recommendations.push('Request IT to whitelist skrobaki.com domain');
      recommendations.push('Try alternative email address if available');
    } else {
      recommendations.push('Check spam/junk folder');
      recommendations.push('Add sender to contacts');
    }
  } else if (lastEvent === 'bounced') {
    recommendations.push('Verify email address is correct');
    recommendations.push('Check if mailbox is full');
    recommendations.push('Try alternative email address');
  } else {
    recommendations.push('Check email address for typos');
    recommendations.push('Verify domain authentication settings');
    recommendations.push('Contact recipient via alternative method');
  }
  
  return recommendations;
}

function getTroubleshootingSteps(emailData: any, domain: string): string[] {
  const steps = [];
  
  // Domain-specific troubleshooting
  if (domain.includes('outlook') || domain.includes('hotmail') || domain.includes('live') || domain.includes('microsoft')) {
    steps.push('Microsoft domains have strict filtering - emails often delivered but quarantined');
    steps.push('Check Advanced Threat Protection (ATP) settings if corporate account');
    steps.push('Consider using kevin@skrobaki.com as sender for better reputation');
  } else if (isBusinessDomain(domain)) {
    steps.push('Business domains often have additional security layers');
    steps.push('Corporate firewalls may block emails from new senders');
    steps.push('Administrative emails may have different routing rules');
  }
  
  // General troubleshooting
  steps.push('Verify SPF, DKIM, and DMARC records are properly configured');
  steps.push('Check sender reputation for skrobaki.com domain');
  steps.push('Monitor delivery patterns for this domain type');
  
  return steps;
}

function getDeliveryConfidence(emailData: any, domain: string): string {
  const lastEvent = emailData.last_event;
  
  if (lastEvent === 'delivered') {
    if (domain.includes('outlook') || domain.includes('hotmail') || domain.includes('live') || domain.includes('microsoft')) {
      return 'low'; // Microsoft domains have aggressive filtering
    } else if (isBusinessDomain(domain)) {
      return 'medium'; // Business domains may have additional filtering
    } else {
      return 'high'; // Personal domains typically have better delivery
    }
  } else if (lastEvent === 'bounced') {
    return 'none'; // Email definitively not delivered
  } else {
    return 'unknown'; // Status unclear
  }
}

serve(handler);
