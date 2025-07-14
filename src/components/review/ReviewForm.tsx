import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Star, Search, User, Building2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserOption {
  id: string;
  name: string;
  avatar_url: string | null;
  slug: string | null;
}

interface CompanyOption {
  id: string;
  name: string;
  logo_url: string | null;
  slug: string;
}

interface ReviewFormProps {
  onCancel: () => void;
  onSubmit: () => void;
}

export const ReviewForm = ({ onCancel, onSubmit }: ReviewFormProps) => {
  const [reviewType, setReviewType] = useState<'user' | 'company'>('user');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReviewee, setSelectedReviewee] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState('');
  const [projectContext, setProjectContext] = useState('');
  const [isVerifiedCollaboration, setIsVerifiedCollaboration] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [users, setUsers] = useState<UserOption[]>([]);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  
  const { toast } = useToast();

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchOptions();
    } else {
      setUsers([]);
      setCompanies([]);
    }
  }, [searchQuery, reviewType]);

  const searchOptions = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (reviewType === 'user') {
        const { data, error } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, avatar_url, slug')
          .neq('user_id', user.id) // Don't include current user
          .eq('public_profile', true)
          .or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`)
          .limit(10);

        if (error) throw error;

        const formattedUsers = (data || []).map(profile => ({
          id: profile.user_id,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Anonymous',
          avatar_url: profile.avatar_url,
          slug: profile.slug
        }));

        setUsers(formattedUsers);
      } else {
        const { data, error } = await supabase
          .from('companies')
          .select('id, name, logo_url, slug')
          .eq('public_page', true)
          .ilike('name', `%${searchQuery}%`)
          .limit(10);

        if (error) throw error;
        setCompanies(data || []);
      }
    } catch (error) {
      console.error('Error searching:', error);
      toast({
        title: "Error",
        description: "Failed to search options",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedReviewee) {
      toast({
        title: "Error",
        description: "Please select who you're reviewing",
        variant: "destructive"
      });
      return;
    }

    if (!reviewText.trim()) {
      toast({
        title: "Error", 
        description: "Please write a review",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check for existing review
      const { data: existingReview, error: checkError } = await supabase
        .from('reviews')
        .select('id')
        .eq('reviewer_id', user.id)
        .eq('reviewee_id', selectedReviewee)
        .eq('reviewee_type', reviewType)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingReview) {
        toast({
          title: "Error",
          description: "You have already reviewed this " + reviewType,
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('reviews')
        .insert({
          reviewer_id: user.id,
          reviewee_id: selectedReviewee,
          reviewee_type: reviewType,
          rating,
          review_text: reviewText.trim(),
          project_context: projectContext.trim() || null,
          is_verified_collaboration: isVerifiedCollaboration,
          status: 'active'
        });

      if (error) throw error;

      onSubmit();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={`w-8 h-8 rounded ${
              star <= rating 
                ? 'text-yellow-500 hover:text-yellow-600' 
                : 'text-gray-300 hover:text-gray-400'
            }`}
          >
            <Star className="w-full h-full fill-current" />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
        <CardDescription>
          Share your experience working with a professional or company
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Review Type Selection */}
          <div className="space-y-3">
            <Label>Who are you reviewing?</Label>
            <RadioGroup
              value={reviewType}
              onValueChange={(value: 'user' | 'company') => {
                setReviewType(value);
                setSelectedReviewee('');
                setSearchQuery('');
              }}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="user" id="user" />
                <Label htmlFor="user" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Individual Professional
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="company" id="company" />
                <Label htmlFor="company" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Company
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Search for Reviewee */}
          <div className="space-y-3">
            <Label>Search for {reviewType === 'user' ? 'professional' : 'company'}</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search for ${reviewType === 'user' ? 'a professional' : 'a company'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {loading && (
                <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            
            {/* Search Results */}
            {searchQuery.length >= 2 && !loading && (
              <div className="border rounded-md max-h-40 overflow-y-auto">
                {reviewType === 'user' ? (
                  users.length > 0 ? (
                    users.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          setSelectedReviewee(user.id);
                          setSearchQuery(user.name);
                        }}
                        className={`w-full p-3 text-left hover:bg-accent flex items-center gap-3 ${
                          selectedReviewee === user.id ? 'bg-accent' : ''
                        }`}
                      >
                        {user.avatar_url ? (
                          <img 
                            src={user.avatar_url} 
                            alt=""
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <span>{user.name}</span>
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-muted-foreground text-sm">No professionals found</div>
                  )
                ) : (
                  companies.length > 0 ? (
                    companies.map((company) => (
                      <button
                        key={company.id}
                        type="button"
                        onClick={() => {
                          setSelectedReviewee(company.id);
                          setSearchQuery(company.name);
                        }}
                        className={`w-full p-3 text-left hover:bg-accent flex items-center gap-3 ${
                          selectedReviewee === company.id ? 'bg-accent' : ''
                        }`}
                      >
                        {company.logo_url ? (
                          <img 
                            src={company.logo_url} 
                            alt=""
                            className="w-8 h-8 rounded object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <span>{company.name}</span>
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-muted-foreground text-sm">No companies found</div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Rating */}
          <div className="space-y-3">
            <Label>Rating</Label>
            <div className="flex items-center gap-2">
              {renderStars()}
              <span className="text-sm text-muted-foreground ml-2">
                {rating} star{rating !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Review Text */}
          <div className="space-y-3">
            <Label htmlFor="review">Review *</Label>
            <Textarea
              id="review"
              placeholder="Share your experience working with this professional/company..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              required
            />
          </div>

          {/* Project Context */}
          <div className="space-y-3">
            <Label htmlFor="context">Project Context (Optional)</Label>
            <Input
              id="context"
              placeholder="e.g., Kitchen renovation, Office building construction..."
              value={projectContext}
              onChange={(e) => setProjectContext(e.target.value)}
            />
          </div>

          {/* Verified Collaboration */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="verified"
              checked={isVerifiedCollaboration}
              onCheckedChange={(checked) => setIsVerifiedCollaboration(checked as boolean)}
            />
            <Label htmlFor="verified" className="text-sm">
              This review is based on a verified collaboration/project
            </Label>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit Review
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};