import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserPermissionsContext } from '@/contexts/UserPermissionsContext';

interface TaskReviewsTabProps {
  taskId: string;
}

export const TaskReviewsTab = ({ taskId }: TaskReviewsTabProps) => {
  const { canViewSubModule } = useUserPermissionsContext();
  
  // Check if user has reviewer permissions
  const canViewReviews = canViewSubModule('tasks', 'reviews');

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['task-reviews', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_reviews')
        .select(`
          *,
          task_submittals (
            submittal_name,
            submittal_type
          )
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: canViewReviews,
  });

  if (!canViewReviews) {
    return (
      <Card className="p-8 text-center">
        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Reviews Restricted</h3>
        <p className="text-muted-foreground">
          You need Reviewer permissions to access this section.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Reviews</h3>
        <Button>
          <MessageSquare className="w-4 h-4 mr-2" />
          Add Review
        </Button>
      </div>

      {isLoading ? (
        <Card className="p-8 text-center text-muted-foreground">
          Loading reviews...
        </Card>
      ) : reviews && reviews.length === 0 ? (
        <Card className="p-8 text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No reviews yet</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews?.map((review) => (
            <Card key={review.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-semibold">
                    {review.task_submittals?.submittal_name || 'Unnamed Submittal'}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {review.task_submittals?.submittal_type}
                  </p>
                </div>
                <Badge variant={
                  review.review_status === 'approved' ? 'default' :
                  review.review_status === 'rejected' ? 'destructive' :
                  'secondary'
                }>
                  {review.review_status}
                </Badge>
              </div>
              
              {review.review_comments && (
                <p className="text-sm mb-4">{review.review_comments}</p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {review.rating && (
                  <div className="flex items-center gap-1">
                    {review.rating >= 4 ? (
                      <ThumbsUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <ThumbsDown className="w-4 h-4 text-red-600" />
                    )}
                    <span>{review.rating}/5</span>
                  </div>
                )}
                {review.reviewed_at && (
                  <span>
                    Reviewed {new Date(review.reviewed_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
