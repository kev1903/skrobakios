
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Search,
  TrendingUp,
  AlertTriangle,
  Info
} from 'lucide-react';

interface EmailAnalysis {
  email_id: string;
  recipient: string;
  recipient_domain: string;
  status: string;
  created_at: string;
  from: string;
  subject: string;
  domain_type: string;
  delivery_confidence: string;
  likely_issue: string;
  recommendations: string[];
  risk_factors: string[];
}

interface DiagnosticReport {
  summary: {
    total_emails: number;
    delivered: number;
    bounced: number;
    other_status: number;
  };
  domain_analysis: Record<string, any>;
  recommendations: string[];
  risk_assessment: string;
}

export const EmailDeliveryChecker = () => {
  const [emailIds, setEmailIds] = useState('85b94f0a-7092-4c53-8990-a67590995a82,29d86eca-bb98-42ef-abf3-b39745840cfa');
  const [singleEmailId, setSingleEmailId] = useState('85b94f0a-7092-4c53-8990-a67590995a82');
  const [analysis, setAnalysis] = useState<any>(null);
  const [diagnosticReport, setDiagnosticReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'single' | 'diagnostic'>('single');
  const { toast } = useToast();

  const checkSingleEmail = async () => {
    if (!singleEmailId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Resend email ID",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-email-delivery', {
        body: { resendEmailId: singleEmailId.trim() }
      });

      if (error) throw error;

      setAnalysis(data);
      toast({
        title: "Analysis Complete",
        description: "Email delivery status checked successfully"
      });
    } catch (error: any) {
      console.error('Error checking email delivery:', error);
      toast({
        title: "Check Failed",
        description: error.message || "Failed to check email delivery",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const runDiagnostic = async () => {
    if (!emailIds.trim()) {
      toast({
        title: "Error",
        description: "Please enter at least one email ID",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const emailIdArray = emailIds.split(',').map(id => id.trim()).filter(id => id);
      
      const { data, error } = await supabase.functions.invoke('email-delivery-diagnostic', {
        body: { 
          emailIds: emailIdArray,
          comparativeAnalysis: true 
        }
      });

      if (error) throw error;

      setDiagnosticReport(data);
      toast({
        title: "Diagnostic Complete",
        description: `Analyzed ${emailIdArray.length} emails successfully`
      });
    } catch (error: any) {
      console.error('Error running diagnostic:', error);
      toast({
        title: "Diagnostic Failed",
        description: error.message || "Failed to run diagnostic analysis",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceBadgeVariant = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'bounced': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Delivery Diagnostic System
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant={activeTab === 'single' ? 'default' : 'outline'}
              onClick={() => setActiveTab('single')}
              size="sm"
            >
              Single Email Check
            </Button>
            <Button 
              variant={activeTab === 'diagnostic' ? 'default' : 'outline'}
              onClick={() => setActiveTab('diagnostic')}
              size="sm"
            >
              Comparative Diagnostic
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeTab === 'single' ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter Resend Email ID"
                  value={singleEmailId}
                  onChange={(e) => setSingleEmailId(e.target.value)}
                />
                <Button onClick={checkSingleEmail} disabled={loading}>
                  {loading ? <Clock className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Check Status
                </Button>
              </div>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Latest known email IDs: 85b94f0a-7092-4c53-8990-a67590995a82 (vanessenenassee@rocketmail.com), 
                  29d86eca-bb98-42ef-abf3-b39745840cfa (accounts@skrobaki.com)
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter Email IDs (comma-separated)"
                  value={emailIds}
                  onChange={(e) => setEmailIds(e.target.value)}
                />
                <Button onClick={runDiagnostic} disabled={loading}>
                  {loading ? <Clock className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
                  Run Diagnostic
                </Button>
              </div>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Compare delivery patterns across multiple emails to identify domain-specific issues
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Single Email Analysis */}
      {analysis && activeTab === 'single' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(analysis.analysis.status)}
              Email Analysis Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Recipient</label>
                <p className="text-sm text-muted-foreground">{analysis.analysis.recipient}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Domain Type</label>
                <Badge variant="outline">{analysis.analysis.recipient_domain}</Badge>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Badge variant={analysis.analysis.status === 'delivered' ? 'default' : 'destructive'}>
                  {analysis.analysis.status}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium">Delivery Confidence</label>
                <Badge variant={getConfidenceBadgeVariant(analysis.analysis.delivery_confidence)}>
                  {analysis.analysis.delivery_confidence}
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Likely Issue</label>
              <Alert className="mt-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{analysis.analysis.likely_issue}</AlertDescription>
              </Alert>
            </div>

            <div>
              <label className="text-sm font-medium">Recommendations</label>
              <ul className="list-disc list-inside text-sm text-muted-foreground mt-1 space-y-1">
                {analysis.analysis.recommendations.map((rec: string, index: number) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>

            {analysis.analysis.troubleshooting_steps && (
              <div>
                <label className="text-sm font-medium">Troubleshooting Steps</label>
                <ul className="list-disc list-inside text-sm text-muted-foreground mt-1 space-y-1">
                  {analysis.analysis.troubleshooting_steps.map((step: string, index: number) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Diagnostic Report */}
      {diagnosticReport && activeTab === 'diagnostic' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Diagnostic Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {diagnosticReport.diagnostic_report.summary.total_emails}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Emails</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {diagnosticReport.diagnostic_report.summary.delivered}
                  </div>
                  <div className="text-sm text-muted-foreground">Delivered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {diagnosticReport.diagnostic_report.summary.bounced}
                  </div>
                  <div className="text-sm text-muted-foreground">Bounced</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {diagnosticReport.diagnostic_report.summary.other_status}
                  </div>
                  <div className="text-sm text-muted-foreground">Other Status</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Domain Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(diagnosticReport.diagnostic_report.domain_analysis).map(([domainType, data]: [string, any]) => (
                  <div key={domainType} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium capitalize">{domainType} Domains</h3>
                      <Badge variant="outline">{data.count} emails</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Delivery Rate:</span>
                        <Progress value={data.delivery_rate * 100} className="flex-1" />
                        <span className="text-sm font-medium">{Math.round(data.delivery_rate * 100)}%</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Common Issues:</span>
                        <ul className="text-sm text-muted-foreground mt-1">
                          {data.common_issues.map((issue: string, index: number) => (
                            <li key={index} className="ml-2">• {issue}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Overall Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {diagnosticReport.diagnostic_report.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Individual Email Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {diagnosticReport.email_analyses.map((emailAnalysis: EmailAnalysis, index: number) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(emailAnalysis.status)}
                        <span className="font-medium">{emailAnalysis.recipient}</span>
                      </div>
                      <Badge variant={getConfidenceBadgeVariant(emailAnalysis.delivery_confidence)}>
                        {emailAnalysis.delivery_confidence} confidence
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Domain Type:</span> {emailAnalysis.domain_type}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span> {emailAnalysis.status}
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-sm font-medium">Issue:</span>
                      <p className="text-sm text-muted-foreground">{emailAnalysis.likely_issue}</p>
                    </div>
                    {emailAnalysis.recommendations.length > 0 && (
                      <div className="mt-2">
                        <span className="text-sm font-medium">Recommendations:</span>
                        <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                          {emailAnalysis.recommendations.map((rec: string, recIndex: number) => (
                            <li key={recIndex} className="ml-2">• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
