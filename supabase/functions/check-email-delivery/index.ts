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

    // Analyze the delivery
    const recipientDomain = emailData.to?.[0]?.split('@')[1]?.toLowerCase() || 'unknown';
    
    const analysis = {
      email_id: resendEmailId,
      recipient: emailData.to?.[0] || 'unknown',
      recipient_domain: recipientDomain,
      status: emailData.last_event || 'unknown',
      created_at: emailData.created_at,
      from: emailData.from,
      subject: emailData.subject,
      is_microsoft_domain: recipientDomain.includes('outlook') || recipientDomain.includes('hotmail') || recipientDomain.includes('live') || recipientDomain.includes('microsoft'),
      likely_issue: getLikelyIssue(emailData, recipientDomain),
      recommendations: getRecommendations(emailData, recipientDomain)
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

function getLikelyIssue(emailData: any, domain: string): string {
  const lastEvent = emailData.last_event;
  
  if (lastEvent === 'delivered') {
    if (domain.includes('outlook') || domain.includes('hotmail') || domain.includes('live') || domain.includes('microsoft')) {
      return 'Microsoft aggressive spam filtering - emails marked as delivered but filtered to quarantine/junk before reaching inbox';
    } else if (domain.includes('gmail')) {
      return 'Gmail filtering to spam folder or promotions tab';
    } else {
      return 'Corporate email filtering or spam folder placement';
    }
  } else if (lastEvent === 'bounced') {
    return 'Email bounced - invalid address or mailbox full';
  } else if (lastEvent === 'complained') {
    return 'Recipient marked email as spam';
  } else {
    return `Unknown delivery status: ${lastEvent}`;
  }
}

function getRecommendations(emailData: any, domain: string): string[] {
  const recommendations = [];
  const lastEvent = emailData.last_event;
  
  if (lastEvent === 'delivered') {
    if (domain.includes('outlook') || domain.includes('hotmail') || domain.includes('live') || domain.includes('microsoft')) {
      recommendations.push('Check junk/spam folder in Outlook');
      recommendations.push('Check quarantine folder (if corporate email)');
      recommendations.push('Add sender to safe senders list');
      recommendations.push('Contact IT department about email filtering rules');
      recommendations.push('Try sending from a different domain temporarily');
    } else if (domain.includes('gmail')) {
      recommendations.push('Check spam folder');
      recommendations.push('Check promotions tab');
      recommendations.push('Mark sender as important');
    } else {
      recommendations.push('Check spam/junk folder');
      recommendations.push('Add sender to contacts');
      recommendations.push('Check with email administrator');
    }
  } else {
    recommendations.push('Check email address for typos');
    recommendations.push('Verify domain authentication settings');
    recommendations.push('Contact Resend support for detailed delivery logs');
  }
  
  return recommendations;
}

serve(handler);