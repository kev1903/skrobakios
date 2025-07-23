
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DiagnosticRequest {
  emailIds: string[];
  recipientEmails?: string[];
  comparativeAnalysis?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("=== EMAIL DELIVERY DIAGNOSTIC STARTED ===");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!resendApiKey || !supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ 
          error: "Server configuration error - missing required environment variables",
          missing: {
            resendApiKey: !resendApiKey,
            supabaseUrl: !supabaseUrl,
            supabaseServiceKey: !supabaseServiceKey
          }
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { emailIds, recipientEmails = [], comparativeAnalysis = false }: DiagnosticRequest = await req.json();

    if (!emailIds || emailIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "Email IDs are required for diagnostic analysis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Analyzing ${emailIds.length} email(s):`, emailIds);

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Analyze each email
    const emailAnalyses = [];
    for (const emailId of emailIds) {
      try {
        const emailResponse = await fetch(`https://api.resend.com/emails/${emailId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
          },
        });

        if (emailResponse.ok) {
          const emailData = await emailResponse.json();
          const analysis = analyzeEmailDelivery(emailData);
          emailAnalyses.push(analysis);
          
          // Log the analysis to database
          await logEmailAnalysis(supabase, emailId, analysis);
        } else {
          console.error(`Failed to fetch email ${emailId}`);
          emailAnalyses.push({
            email_id: emailId,
            error: 'Failed to fetch email data',
            status: 'error'
          });
        }
      } catch (error) {
        console.error(`Error analyzing email ${emailId}:`, error);
        emailAnalyses.push({
          email_id: emailId,
          error: error.message,
          status: 'error'
        });
      }
    }

    // Generate diagnostic report
    const diagnosticReport = generateDiagnosticReport(emailAnalyses, comparativeAnalysis);

    // Store diagnostic session
    await storeDiagnosticSession(supabase, emailIds, diagnosticReport);

    return new Response(
      JSON.stringify({ 
        success: true,
        diagnostic_report: diagnosticReport,
        email_analyses: emailAnalyses,
        analyzed_count: emailAnalyses.length,
        timestamp: new Date().toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Email delivery diagnostic error:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "Diagnostic analysis failed", 
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

function analyzeEmailDelivery(emailData: any) {
  const recipientDomain = emailData.to?.[0]?.split('@')[1]?.toLowerCase() || 'unknown';
  const lastEvent = emailData.last_event || 'unknown';
  
  return {
    email_id: emailData.id,
    recipient: emailData.to?.[0] || 'unknown',
    recipient_domain: recipientDomain,
    status: lastEvent,
    created_at: emailData.created_at,
    from: emailData.from,
    subject: emailData.subject,
    domain_type: getDomainType(recipientDomain),
    delivery_confidence: getDeliveryConfidence(lastEvent, recipientDomain),
    likely_issue: getLikelyIssue(lastEvent, recipientDomain),
    recommendations: getRecommendations(lastEvent, recipientDomain),
    risk_factors: getRiskFactors(emailData, recipientDomain)
  };
}

function getDomainType(domain: string): string {
  if (domain.includes('outlook') || domain.includes('hotmail') || domain.includes('live') || domain.includes('microsoft')) {
    return 'microsoft';
  } else if (domain.includes('gmail') || domain.includes('googlemail')) {
    return 'gmail';
  } else if (isBusinessDomain(domain)) {
    return 'business';
  } else {
    return 'personal';
  }
}

function isBusinessDomain(domain: string): boolean {
  const businessKeywords = ['accounts', 'admin', 'info', 'contact', 'support', 'office'];
  const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com', 'rocketmail.com'];
  
  return !personalDomains.includes(domain) || businessKeywords.some(keyword => domain.includes(keyword));
}

function getDeliveryConfidence(status: string, domain: string): string {
  if (status === 'delivered') {
    const domainType = getDomainType(domain);
    if (domainType === 'microsoft') return 'low';
    if (domainType === 'business') return 'medium';
    return 'high';
  }
  return status === 'bounced' ? 'none' : 'unknown';
}

function getLikelyIssue(status: string, domain: string): string {
  if (status === 'delivered') {
    const domainType = getDomainType(domain);
    if (domainType === 'microsoft') {
      return 'Microsoft aggressive spam filtering - likely quarantined';
    } else if (domainType === 'business') {
      return 'Corporate email filtering - may be quarantined';
    }
    return 'Email delivered successfully';
  }
  return `Email status: ${status}`;
}

function getRecommendations(status: string, domain: string): string[] {
  const recommendations = [];
  const domainType = getDomainType(domain);
  
  if (status === 'delivered') {
    if (domainType === 'microsoft') {
      recommendations.push('Check junk/spam folder');
      recommendations.push('Check quarantine folder (corporate accounts)');
      recommendations.push('Add sender to safe senders list');
      recommendations.push('Use kevin@skrobaki.com as sender for better reputation');
    } else if (domainType === 'business') {
      recommendations.push('Contact IT department about email filtering');
      recommendations.push('Request whitelisting of skrobaki.com domain');
      recommendations.push('Check administrative email routing');
    }
  }
  
  return recommendations;
}

function getRiskFactors(emailData: any, domain: string): string[] {
  const riskFactors = [];
  const domainType = getDomainType(domain);
  
  if (domainType === 'microsoft') {
    riskFactors.push('Microsoft domains have aggressive spam filtering');
  }
  
  if (domainType === 'business') {
    riskFactors.push('Business domains may have additional security layers');
  }
  
  if (emailData.from?.includes('noreply')) {
    riskFactors.push('Noreply addresses may be flagged as automated');
  }
  
  return riskFactors;
}

function generateDiagnosticReport(analyses: any[], comparative = false) {
  const report = {
    summary: {
      total_emails: analyses.length,
      delivered: analyses.filter(a => a.status === 'delivered').length,
      bounced: analyses.filter(a => a.status === 'bounced').length,
      other_status: analyses.filter(a => a.status !== 'delivered' && a.status !== 'bounced').length
    },
    domain_analysis: {},
    delivery_confidence: {},
    recommendations: [],
    risk_assessment: 'medium'
  };

  // Analyze by domain type
  const domainTypes = ['microsoft', 'gmail', 'business', 'personal'];
  domainTypes.forEach(type => {
    const typeAnalyses = analyses.filter(a => a.domain_type === type);
    if (typeAnalyses.length > 0) {
      report.domain_analysis[type] = {
        count: typeAnalyses.length,
        delivered: typeAnalyses.filter(a => a.status === 'delivered').length,
        delivery_rate: typeAnalyses.filter(a => a.status === 'delivered').length / typeAnalyses.length,
        common_issues: [...new Set(typeAnalyses.map(a => a.likely_issue))]
      };
    }
  });

  // Generate overall recommendations
  if (analyses.some(a => a.domain_type === 'microsoft')) {
    report.recommendations.push('Consider using kevin@skrobaki.com for Microsoft domains');
  }
  
  if (analyses.some(a => a.domain_type === 'business')) {
    report.recommendations.push('Contact business email administrators for whitelisting');
  }

  report.recommendations.push('Verify SPF/DKIM/DMARC configuration');
  report.recommendations.push('Monitor delivery patterns over time');

  return report;
}

async function logEmailAnalysis(supabase: any, emailId: string, analysis: any) {
  try {
    await supabase
      .from('email_sending_log')
      .insert({
        recipient_email: analysis.recipient,
        sender_email: analysis.from,
        email_type: 'diagnostic_analysis',
        status: 'analyzed',
        resend_email_id: emailId,
        sent_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Failed to log email analysis:', error);
  }
}

async function storeDiagnosticSession(supabase: any, emailIds: string[], report: any) {
  try {
    await supabase
      .from('email_sending_log')
      .insert({
        recipient_email: 'diagnostic_session',
        sender_email: 'system',
        email_type: 'diagnostic_session',
        status: 'completed',
        error_message: JSON.stringify({ emailIds, report }),
        sent_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Failed to store diagnostic session:', error);
  }
}

serve(handler);
