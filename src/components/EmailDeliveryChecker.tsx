import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mail, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export const EmailDeliveryChecker = () => {
  const [emailId, setEmailId] = useState('8b146055-da9e-43fe-a405-16f6e7a2bc20'); // Latest email
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const checkDelivery = async () => {
    if (!emailId.trim()) {
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
        body: { resendEmailId: emailId.trim() }
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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Delivery Checker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter Resend Email ID"
              value={emailId}
              onChange={(e) => setEmailId(e.target.value)}
            />
            <Button onClick={checkDelivery} disabled={loading}>
              {loading ? <Clock className="h-4 w-4 animate-spin" /> : "Check Status"}
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Latest email ID: 8b146055-da9e-43fe-a405-16f6e7a2bc20 (sent to accounts@skrobaki.com)
          </div>
        </CardContent>
      </Card>

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {analysis.analysis.status === 'delivered' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-orange-500" />
              )}
              Delivery Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Recipient</label>
                <p className="text-sm text-muted-foreground">{analysis.analysis.recipient}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Badge variant={analysis.analysis.status === 'delivered' ? 'default' : 'destructive'}>
                  {analysis.analysis.status}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium">Domain Type</label>
                <Badge variant={analysis.analysis.is_microsoft_domain ? 'destructive' : 'secondary'}>
                  {analysis.analysis.recipient_domain}
                  {analysis.analysis.is_microsoft_domain && ' (Microsoft)'}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium">Created At</label>
                <p className="text-sm text-muted-foreground">
                  {new Date(analysis.analysis.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Subject</label>
              <p className="text-sm text-muted-foreground">{analysis.analysis.subject}</p>
            </div>

            <div>
              <label className="text-sm font-medium">From</label>
              <p className="text-sm text-muted-foreground">{analysis.analysis.from}</p>
            </div>

            <div className="border-t pt-4">
              <label className="text-sm font-medium">Likely Issue</label>
              <p className="text-sm text-muted-foreground mt-1">{analysis.analysis.likely_issue}</p>
            </div>

            <div>
              <label className="text-sm font-medium">Recommendations</label>
              <ul className="list-disc list-inside text-sm text-muted-foreground mt-1 space-y-1">
                {analysis.analysis.recommendations.map((rec: string, index: number) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>

            {analysis.raw_data && (
              <details className="border-t pt-4">
                <summary className="text-sm font-medium cursor-pointer">Raw Resend Data</summary>
                <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto">
                  {JSON.stringify(analysis.raw_data, null, 2)}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};