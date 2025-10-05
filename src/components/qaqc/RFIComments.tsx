import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Comment {
  id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
  updated_at: string;
  user_email?: string;
  user_name?: string;
}

interface RFICommentsProps {
  rfiId: string;
  projectId: string;
  companyId: string;
}

export const RFIComments = ({ rfiId, projectId, companyId }: RFICommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
    getCurrentUser();
  }, [rfiId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('rfi_comments')
        .select(`
          *,
          profiles:user_id (
            email,
            first_name,
            last_name
          )
        `)
        .eq('rfi_id', rfiId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const commentsWithUserInfo = (data || []).map((comment: any) => ({
        ...comment,
        user_email: comment.profiles?.email,
        user_name: comment.profiles?.first_name && comment.profiles?.last_name
          ? `${comment.profiles.first_name} ${comment.profiles.last_name}`
          : comment.profiles?.email?.split('@')[0] || 'Unknown User'
      }));

      setComments(commentsWithUserInfo);
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "Comment cannot be empty",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('rfi_comments')
        .insert({
          rfi_id: rfiId,
          project_id: projectId,
          company_id: companyId,
          user_id: user.id,
          comment_text: newComment.trim()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Comment added successfully"
      });

      setNewComment('');
      fetchComments();
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add comment",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const { error } = await supabase
        .from('rfi_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Comment deleted successfully"
      });

      fetchComments();
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive"
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5" />
          <span>Comments</span>
          <span className="text-sm font-normal text-muted-foreground">
            ({comments.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comment Form */}
        <form onSubmit={handleSubmitComment} className="space-y-3">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting || !newComment.trim()}
              size="sm"
            >
              <Send className="w-4 h-4 mr-2" />
              Post Comment
            </Button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-4 mt-6">
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground">
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div 
                key={comment.id} 
                className="border rounded-lg p-4 space-y-2 hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {getInitials(comment.user_name || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm text-foreground">
                          {comment.user_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(comment.created_at), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                        {comment.comment_text}
                      </p>
                    </div>
                  </div>
                  {currentUserId === comment.user_id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteComment(comment.id)}
                      className="ml-2 h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
