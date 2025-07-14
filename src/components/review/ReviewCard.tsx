import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, User, Building2, Calendar, Check } from 'lucide-react';
import { format } from 'date-fns';

interface Review {
  id: string;
  rating: number;
  review_text: string | null;
  project_context: string | null;
  reviewee_type: 'user' | 'company';
  created_at: string;
  is_verified_collaboration: boolean | null;
  // Profile data
  reviewee_name?: string;
  reviewee_avatar?: string;
  reviewer_name?: string;
  reviewer_avatar?: string;
}

interface ReviewCardProps {
  review: Review;
  showReviewee: boolean; // If true, show who was reviewed. If false, show who reviewed.
}

export const ReviewCard = ({ review, showReviewee }: ReviewCardProps) => {
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

  const displayName = showReviewee ? review.reviewee_name : review.reviewer_name;
  const displayAvatar = showReviewee ? review.reviewee_avatar : review.reviewer_avatar;
  const displayType = showReviewee ? review.reviewee_type : 'user'; // Reviewer is always a user

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {displayAvatar ? (
              <img 
                src={displayAvatar} 
                alt=""
                className={`w-12 h-12 object-cover ${
                  displayType === 'company' ? 'rounded' : 'rounded-full'
                }`}
              />
            ) : (
              <div className={`w-12 h-12 bg-muted flex items-center justify-center ${
                displayType === 'company' ? 'rounded' : 'rounded-full'
              }`}>
                {displayType === 'company' ? (
                  <Building2 className="h-6 w-6 text-muted-foreground" />
                ) : (
                  <User className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">
                    {displayName || 'Anonymous'}
                  </h3>
                  {review.is_verified_collaboration && (
                    <Badge variant="secondary" className="text-xs">
                      <Check className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(review.created_at), 'MMM d, yyyy')}
                  </div>
                  {showReviewee && (
                    <Badge variant="outline" className="text-xs">
                      {review.reviewee_type === 'company' ? 'Company' : 'Professional'}
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Rating */}
              <div className="flex items-center gap-2">
                {renderStars(review.rating)}
                <span className="font-semibold text-lg">{review.rating}</span>
              </div>
            </div>

            {/* Project Context */}
            {review.project_context && (
              <div className="mb-3">
                <Badge variant="secondary" className="text-xs">
                  {review.project_context}
                </Badge>
              </div>
            )}

            {/* Review Text */}
            {review.review_text && (
              <div className="text-sm leading-relaxed">
                <p className="whitespace-pre-wrap">{review.review_text}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};