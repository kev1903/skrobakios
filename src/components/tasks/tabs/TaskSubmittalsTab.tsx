import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SubmittalStatusCard } from '../SubmittalStatusCard';
import { Upload, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TaskSubmittalsTabProps {
  taskId: string;
}

export const TaskSubmittalsTab = ({ taskId }: TaskSubmittalsTabProps) => {
  const { data: submittals, isLoading } = useQuery({
    queryKey: ['task-submittals', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_submittals')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const pendingSubmittals = submittals?.filter(s => s.status === 'pending') || [];
  const inReviewSubmittals = submittals?.filter(s => s.status === 'in_review') || [];
  const approvedSubmittals = submittals?.filter(s => s.status === 'approved') || [];

  const formatStatus = (status: string): 'Pending' | 'In Review' | 'Approved' => {
    if (status === 'pending') return 'Pending';
    if (status === 'in_review') return 'In Review';
    return 'Approved';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Submittals</h3>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Submittal
        </Button>
      </div>

      {isLoading ? (
        <Card className="p-8 text-center text-muted-foreground">
          Loading submittals...
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Pending Review */}
          <div>
            <h4 className="text-sm font-medium mb-3 text-muted-foreground">Pending Review</h4>
            {pendingSubmittals.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground">
                No pending submittals
              </Card>
            ) : (
              <div className="space-y-3">
                {pendingSubmittals.map((submittal) => (
                  <SubmittalStatusCard
                    key={submittal.id}
                    title={submittal.submittal_name}
                    status={formatStatus(submittal.status)}
                    submittedBy={submittal.submitted_by || 'Unknown'}
                    submittedDate={new Date(submittal.submitted_at)}
                    fileCount={1}
                  />
                ))}
              </div>
            )}
          </div>

          {/* In Review */}
          <div>
            <h4 className="text-sm font-medium mb-3 text-muted-foreground">In Review</h4>
            {inReviewSubmittals.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground">
                No submittals in review
              </Card>
            ) : (
              <div className="space-y-3">
                {inReviewSubmittals.map((submittal) => (
                  <SubmittalStatusCard
                    key={submittal.id}
                    title={submittal.submittal_name}
                    status={formatStatus(submittal.status)}
                    submittedBy={submittal.submitted_by || 'Unknown'}
                    submittedDate={new Date(submittal.submitted_at)}
                    fileCount={1}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Approved */}
          <div>
            <h4 className="text-sm font-medium mb-3 text-muted-foreground">Approved</h4>
            {approvedSubmittals.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground">
                No approved submittals
              </Card>
            ) : (
              <div className="space-y-3">
                {approvedSubmittals.map((submittal) => (
                  <SubmittalStatusCard
                    key={submittal.id}
                    title={submittal.submittal_name}
                    status={formatStatus(submittal.status)}
                    submittedBy={submittal.submitted_by || 'Unknown'}
                    submittedDate={new Date(submittal.submitted_at)}
                    fileCount={1}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
