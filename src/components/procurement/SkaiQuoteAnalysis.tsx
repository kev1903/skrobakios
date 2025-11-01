import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle, Clock, DollarSign, Award, Loader2, BarChart3, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

interface Quote {
  id: string;
  rfq_id: string;
  vendor_id: string;
  quote_ref?: string;
  quote_amount_inc_gst?: number;
  scope_coverage_percent?: number;
  lead_time_days?: number;
  is_compliant?: boolean;
  validity_date?: string;
  evaluation_score?: number;
  rank?: number;
  status: string;
  vendor?: {
    id: string;
    name: string;
    trade_category: string;
    compliance_rating?: string;
  };
}

interface AnalysisResult {
  recommendation: {
    vendorName: string;
    vendorId: string;
    overallScore: number;
    reasoning: string;
  };
  scoreBreakdown: {
    quality: number;
    availability: number;
    performance: number;
    compliance: number;
    cost: number;
  };
  insights: Array<{
    type: 'positive' | 'warning' | 'info';
    message: string;
  }>;
  comparison: Array<{
    vendorName: string;
    totalScore: number;
    strengths: string[];
    weaknesses: string[];
  }>;
}

interface SkaiQuoteAnalysisProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotes: Quote[];
  rfqTitle: string;
  projectId: string;
}

export const SkaiQuoteAnalysis: React.FC<SkaiQuoteAnalysisProps> = ({
  open,
  onOpenChange,
  quotes,
  rfqTitle,
  projectId,
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const analyzeQuotes = async () => {
    if (quotes.length === 0) {
      toast.error('No quotes available for analysis');
      return;
    }

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-quotes', {
        body: {
          quotes: quotes.map(q => ({
            id: q.id,
            vendorId: q.vendor_id,
            vendorName: q.vendor?.name,
            amount: q.quote_amount_inc_gst,
            scopeCoverage: q.scope_coverage_percent,
            leadTime: q.lead_time_days,
            isCompliant: q.is_compliant,
            validityDate: q.validity_date,
            complianceRating: q.vendor?.compliance_rating,
          })),
          rfqTitle,
          projectId,
        },
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      toast.success('Analysis complete');
    } catch (error) {
      console.error('Error analyzing quotes:', error);
      toast.error('Failed to analyze quotes');
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 40) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      default:
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
    }
  };

  React.useEffect(() => {
    if (open && quotes.length > 0 && !analysis) {
      analyzeQuotes();
    }
  }, [open, quotes]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-luxury-gold/20 to-luxury-gold/5">
              <Sparkles className="w-5 h-5 text-luxury-gold" />
            </div>
            <div>
              <DialogTitle className="text-xl font-display">SkAi Quote Analysis</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">{rfqTitle}</p>
            </div>
          </div>
        </DialogHeader>

        {analyzing ? (
          <div className="py-12 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-luxury-gold mx-auto mb-4" />
            <p className="text-muted-foreground">Analyzing quotes with AI...</p>
            <p className="text-xs text-muted-foreground mt-2">
              Evaluating quality, availability, performance, compliance, and cost
            </p>
          </div>
        ) : analysis ? (
          <div className="space-y-6">
            {/* Best Recommendation */}
            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-emerald-600 text-white">
                    <Award className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-lg font-semibold text-emerald-900 mb-2">
                      Recommended Vendor
                    </h3>
                    <p className="text-2xl font-bold text-emerald-700 mb-2">
                      {analysis.recommendation.vendorName}
                    </p>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={`${getScoreColor(analysis.recommendation.overallScore)} border`}>
                        Overall Score: {analysis.recommendation.overallScore}/100
                      </Badge>
                    </div>
                    <p className="text-sm text-emerald-900/80 leading-relaxed">
                      {analysis.recommendation.reasoning}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Score Breakdown */}
            <Card className="bg-white/80 backdrop-blur-xl border border-border/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-luxury-gold" />
                  <h3 className="font-display text-lg font-semibold">Score Breakdown</h3>
                </div>
                <div className="grid grid-cols-5 gap-4">
                  {Object.entries(analysis.scoreBreakdown).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${getScoreColor(value)} border-2 mb-2`}>
                        <span className="font-bold text-lg">{value}</span>
                      </div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {key}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Key Insights */}
            <Card className="bg-white/80 backdrop-blur-xl border border-border/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-luxury-gold" />
                  <h3 className="font-display text-lg font-semibold">Key Insights</h3>
                </div>
                <div className="space-y-3">
                  {analysis.insights.map((insight, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-accent/30"
                    >
                      {getInsightIcon(insight.type)}
                      <p className="text-sm text-foreground flex-1">{insight.message}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Vendor Comparison */}
            <Card className="bg-white/80 backdrop-blur-xl border border-border/30">
              <CardContent className="p-6">
                <h3 className="font-display text-lg font-semibold mb-4">Vendor Comparison</h3>
                <div className="space-y-4">
                  {analysis.comparison.map((vendor, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-accent/20 hover:bg-accent/30 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-foreground">{vendor.vendorName}</h4>
                        <Badge className={`${getScoreColor(vendor.totalScore)} border`}>
                          {vendor.totalScore}/100
                        </Badge>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">
                            Strengths
                          </p>
                          <ul className="space-y-1">
                            {vendor.strengths.map((strength, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <CheckCircle className="w-3 h-3 text-emerald-600 mt-0.5 flex-shrink-0" />
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">
                            Areas to Consider
                          </p>
                          <ul className="space-y-1">
                            {vendor.weaknesses.map((weakness, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <AlertTriangle className="w-3 h-3 text-amber-600 mt-0.5 flex-shrink-0" />
                                <span>{weakness}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button 
                className="bg-luxury-gold hover:bg-luxury-gold/90 text-white"
                onClick={() => {
                  toast.success('Analysis exported');
                }}
              >
                <FileText className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No analysis available</p>
            <Button
              onClick={analyzeQuotes}
              className="mt-4 bg-luxury-gold hover:bg-luxury-gold/90 text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Run Analysis
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
