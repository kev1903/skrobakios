import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Plus, MessageSquare, Calendar, User, Building2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ReviewForm } from './ReviewForm';
import { ReviewCard } from './ReviewCard';
import { useToast } from '@/hooks/use-toast';

interface Review {
  id: string;
  rating: number;
  review_text: string | null;
  project_context: string | null;
  reviewee_type: 'user' | 'company';
  reviewee_id: string;
  reviewer_id: string;
  status: string;
  created_at: string;
  is_verified_collaboration: boolean | null;
  // Profile data for reviewee
  reviewee_name?: string;
  reviewee_avatar?: string;
  // Profile data for reviewer  
  reviewer_name?: string;
  reviewer_avatar?: string;
}

interface ReviewsPageProps {
  onNavigate: (page: string) => void;
}

export const ReviewsPage = ({ onNavigate }: ReviewsPageProps) => {
  const [reviewsReceived, setReviewsReceived] = useState<Review[]>([]);
  const [reviewsGiven, setReviewsGiven] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Fetch reviews received with reviewer profiles
      const { data: receivedData, error: receivedError } = await supabase
        .from('reviews')
        .select('*')
        .eq('reviewee_id', user.id)
        .eq('reviewee_type', 'user')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (receivedError) throw receivedError;

      // Fetch reviewer profiles for received reviews
      const processedReceived: Review[] = [];
      if (receivedData && receivedData.length > 0) {
        const reviewerIds = receivedData.map(r => r.reviewer_id);
        const { data: reviewerProfiles } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, avatar_url')
          .in('user_id', reviewerIds);

        for (const review of receivedData) {
          const reviewerProfile = reviewerProfiles?.find(p => p.user_id === review.reviewer_id);
          processedReceived.push({
            ...review,
            reviewee_type: review.reviewee_type as 'user' | 'company',
            reviewer_name: reviewerProfile 
              ? `${reviewerProfile.first_name || ''} ${reviewerProfile.last_name || ''}`.trim()
              : 'Anonymous',
            reviewer_avatar: reviewerProfile?.avatar_url || null
          });
        }
      }

      // Fetch reviews given
      const { data: givenData, error: givenError } = await supabase
        .from('reviews')
        .select('*')
        .eq('reviewer_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (givenError) throw givenError;

      // Process given reviews
      const processedGiven: Review[] = [];
      if (givenData && givenData.length > 0) {
        for (const review of givenData) {
          let revieweeName = 'Unknown';
          let revieweeAvatar = null;

          if (review.reviewee_type === 'user') {
            const { data: userProfile } = await supabase
              .from('profiles')
              .select('first_name, last_name, avatar_url')
              .eq('user_id', review.reviewee_id)
              .single();

            if (userProfile) {
              revieweeName = `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim();
              revieweeAvatar = userProfile.avatar_url;
            }
          } else {
            const { data: company } = await supabase
              .from('companies')
              .select('name, logo_url')
              .eq('id', review.reviewee_id)
              .single();

            if (company) {
              revieweeName = company.name;
              revieweeAvatar = company.logo_url;
            }
          }

          processedGiven.push({
            ...review,
            reviewee_type: review.reviewee_type as 'user' | 'company',
            reviewee_name: revieweeName,
            reviewee_avatar: revieweeAvatar
          });
        }
      }

      setReviewsReceived(processedReceived);
      setReviewsGiven(processedGiven);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "Error",
        description: "Failed to fetch reviews",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    fetchReviews(); // Refresh the reviews
    toast({
      title: "Success",
      description: "Review submitted successfully",
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => onNavigate('personal-dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading reviews...</div>
        </div>
      </div>
    );
  }

  if (showReviewForm) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => setShowReviewForm(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reviews
          </Button>
        </div>
        <ReviewForm 
          onCancel={() => setShowReviewForm(false)}
          onSubmit={handleReviewSubmitted}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => onNavigate('personal-dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Reviews</h1>
            <p className="text-muted-foreground">Manage your reviews and feedback</p>
          </div>
        </div>
        <Button onClick={() => setShowReviewForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Write Review
        </Button>
      </div>

      <Tabs defaultValue="received" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="received" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Reviews Received ({reviewsReceived.length})
          </TabsTrigger>
          <TabsTrigger value="given" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Reviews Given ({reviewsGiven.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="space-y-4">
          {reviewsReceived.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't received any reviews yet. Complete some projects to start receiving feedback!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {reviewsReceived.map((review) => (
                <ReviewCard 
                  key={review.id} 
                  review={review} 
                  showReviewee={false}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="given" className="space-y-4">
          {reviewsGiven.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Reviews Written</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't written any reviews yet. Share your experience with others!
                </p>
                <Button onClick={() => setShowReviewForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Write Your First Review
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {reviewsGiven.map((review) => (
                <ReviewCard 
                  key={review.id} 
                  review={review} 
                  showReviewee={true}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};