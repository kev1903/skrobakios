import React, { useState, useEffect } from 'react';
import { Star, User, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ReviewCard } from './ReviewCard';
import { format } from 'date-fns';

interface Review {
  id: string;
  rating: number;
  review_text: string | null;
  project_context: string | null;
  reviewee_type: 'user' | 'company';
  created_at: string;
  is_verified_collaboration: boolean | null;
  reviewer_id: string;
  // Reviewer profile data
  reviewer_name?: string;
  reviewer_avatar?: string;
}

interface ReviewListProps {
  revieweeId: string;
  revieweeType: 'user' | 'company';
  className?: string;
}

export const ReviewList = ({ revieweeId, revieweeType, className }: ReviewListProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState<number | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [revieweeId, revieweeType]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('reviewee_id', revieweeId)
        .eq('reviewee_type', revieweeType)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch reviewer profiles
      const processedReviews: Review[] = [];
      if (data && data.length > 0) {
        const reviewerIds = data.map(r => r.reviewer_id);
        const { data: reviewerProfiles } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, avatar_url')
          .in('user_id', reviewerIds);

        for (const review of data) {
          const reviewerProfile = reviewerProfiles?.find(p => p.user_id === review.reviewer_id);
          processedReviews.push({
            ...review,
            reviewee_type: review.reviewee_type as 'user' | 'company',
            reviewer_name: reviewerProfile 
              ? `${reviewerProfile.first_name || ''} ${reviewerProfile.last_name || ''}`.trim()
              : 'Anonymous',
            reviewer_avatar: reviewerProfile?.avatar_url || null
          });
        }
      }

      setReviews(processedReviews);

      // Calculate average rating
      if (processedReviews.length > 0) {
        const total = processedReviews.reduce((sum, review) => sum + review.rating, 0);
        setAverageRating(total / processedReviews.length);
      } else {
        setAverageRating(null);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? 'text-yellow-500 fill-current' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
        <p className="text-muted-foreground">
          This {revieweeType} hasn't received any reviews yet.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Rating Summary */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="text-center">
          <div className="text-3xl font-bold">
            {averageRating?.toFixed(1)}
          </div>
          <div className="flex justify-center mb-1">
            {averageRating && renderStars(Math.round(averageRating))}
          </div>
          <div className="text-sm text-muted-foreground">
            {reviews.length} review{reviews.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="space-y-1">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = reviews.filter(r => r.rating === rating).length;
              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center gap-2 text-sm">
                  <span className="w-8">{rating}</span>
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-muted-foreground">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard 
            key={review.id} 
            review={review} 
            showReviewee={false}
          />
        ))}
      </div>
    </div>
  );
};