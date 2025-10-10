import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TaskAISummaryTabProps {
  taskId: string;
}

export const TaskAISummaryTab = ({ taskId }: TaskAISummaryTabProps) => {
  // Fetch all related data
  const { data: submittals } = useQuery({
    queryKey: ['task-submittals', taskId],
    queryFn: async () => {
      const { data } = await supabase
        .from('task_submittals')
        .select('*')
        .eq('task_id', taskId);
      return data;
    },
  });

  const { data: reviews } = useQuery({
    queryKey: ['task-reviews', taskId],
    queryFn: async () => {
      const { data } = await supabase
        .from('task_reviews')
        .select('*')
        .eq('task_id', taskId);
      return data;
    },
  });

  const { data: qaItems } = useQuery({
    queryKey: ['task-qa', taskId],
    queryFn: async () => {
      const { data } = await supabase
        .from('task_qa')
        .select('*')
        .eq('task_id', taskId);
      return data;
    },
  });

  const { data: costs } = useQuery({
    queryKey: ['task-costs', taskId],
    queryFn: async () => {
      const { data } = await supabase
        .from('task_costs')
        .select('*')
        .eq('task_id', taskId);
      return data;
    },
  });

  // Calculate insights
  const submittalProgress = submittals ? 
    Math.round((submittals.filter(s => s.status === 'approved').length / submittals.length) * 100) : 0;
  
  const qaProgress = qaItems ?
    Math.round((qaItems.filter(q => q.status === 'completed').length / qaItems.length) * 100) : 0;
  
  const avgReviewRating = reviews && reviews.length > 0 ?
    reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length : 0;

  const totalCostVariance = costs ?
    costs.reduce((sum, c) => sum + (Number(c.actual_cost) - Number(c.estimated_cost)), 0) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-6 h-6 text-primary" />
        <h3 className="text-lg font-semibold">AI-Generated Summary</h3>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Submittal Progress</p>
              <p className="text-2xl font-semibold">{submittalProgress}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">QA Completion</p>
              <p className="text-2xl font-semibold">{qaProgress}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Avg Review Rating</p>
              <p className="text-2xl font-semibold">{avgReviewRating.toFixed(1)}/5</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className={`w-5 h-5 ${totalCostVariance > 0 ? 'text-red-600' : 'text-green-600'}`} />
            <div>
              <p className="text-sm text-muted-foreground">Cost Variance</p>
              <p className={`text-2xl font-semibold ${totalCostVariance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ${totalCostVariance.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          AI Insights
        </h4>
        <div className="space-y-4">
          {submittalProgress < 50 && (
            <div className="flex gap-3">
              <Badge variant="secondary" className="h-fit">Alert</Badge>
              <p className="text-sm">
                Submittal progress is below 50%. Consider following up with the assignee to ensure timely completion.
              </p>
            </div>
          )}
          
          {qaProgress < 70 && qaItems && qaItems.length > 0 && (
            <div className="flex gap-3">
              <Badge variant="secondary" className="h-fit">Alert</Badge>
              <p className="text-sm">
                QA/QC checklist is not fully completed. {qaItems.filter(q => q.status !== 'completed').length} items remain pending.
              </p>
            </div>
          )}

          {totalCostVariance > 0 && (
            <div className="flex gap-3">
              <Badge variant="destructive" className="h-fit">Warning</Badge>
              <p className="text-sm">
                Task is over budget by ${totalCostVariance.toLocaleString()}. Review cost items and consider mitigation strategies.
              </p>
            </div>
          )}

          {avgReviewRating > 0 && avgReviewRating < 3 && (
            <div className="flex gap-3">
              <Badge variant="destructive" className="h-fit">Warning</Badge>
              <p className="text-sm">
                Average review rating is below 3.0. Review feedback and address concerns raised by reviewers.
              </p>
            </div>
          )}

          {submittalProgress >= 80 && qaProgress >= 80 && totalCostVariance <= 0 && (
            <div className="flex gap-3">
              <Badge variant="default" className="h-fit bg-green-600">Success</Badge>
              <p className="text-sm">
                Task is performing well across all metrics. Submittals and QA are on track, and costs are within budget.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Summary Stats */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4">Summary Statistics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Total Submittals</p>
            <p className="text-xl font-semibold">{submittals?.length || 0}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total Reviews</p>
            <p className="text-xl font-semibold">{reviews?.length || 0}</p>
          </div>
          <div>
            <p className="text-muted-foreground">QA Items</p>
            <p className="text-xl font-semibold">{qaItems?.length || 0}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Cost Items</p>
            <p className="text-xl font-semibold">{costs?.length || 0}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
