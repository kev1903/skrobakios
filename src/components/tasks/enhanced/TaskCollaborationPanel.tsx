import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Send, Clock, FileText, Users, Activity } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface TaskComment {
  id: string;
  task_id: string;
  comment: string;
  user_name: string;
  user_avatar: string | null;
  created_at: string;
}

interface TaskActivity {
  id: string;
  task_id: string;
  action_type: string;
  action_description: string;
  user_name: string;
  user_avatar: string | null;
  created_at: string;
}

interface TaskCollaborationPanelProps {
  taskId: string;
  projectId: string;
}

export function TaskCollaborationPanel({ taskId, projectId }: TaskCollaborationPanelProps) {
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState<'comments' | 'activity'>('comments');
  const { userProfile } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch task comments
  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ['task-comments', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_comments')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as TaskComment[];
    },
    enabled: !!taskId,
  });

  // Fetch task activity log
  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['task-activity', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_activity_log')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data as TaskActivity[];
    },
    enabled: !!taskId,
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (comment: string) => {
      const { data, error } = await supabase
        .from('task_comments')
        .insert({
          task_id: taskId,
          comment,
          user_name: `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim() || userProfile?.email || 'Unknown User',
          user_avatar: userProfile?.avatarUrl,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-comments', taskId] });
      setNewComment('');
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      });
    },
    onError: (error) => {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() && !addCommentMutation.isPending) {
      addCommentMutation.mutate(newComment.trim());
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  const getActivityIcon = (actionType: string) => {
    switch (actionType) {
      case 'status_change':
        return <Activity className="w-4 h-4" />;
      case 'assignment_change':
        return <Users className="w-4 h-4" />;
      case 'comment_added':
        return <MessageSquare className="w-4 h-4" />;
      case 'file_attached':
        return <FileText className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <Card className="backdrop-blur-xl bg-white/10 border-white/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Collaboration
          </CardTitle>
          <div className="flex rounded-lg bg-white/10 p-1">
            <Button
              variant={activeTab === 'comments' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('comments')}
              className={activeTab === 'comments' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}
            >
              Comments
            </Button>
            <Button
              variant={activeTab === 'activity' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('activity')}
              className={activeTab === 'activity' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}
            >
              Activity
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeTab === 'comments' && (
          <>
            {/* Add Comment Form */}
            <form onSubmit={handleSubmitComment} className="space-y-3">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none"
                rows={3}
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={!newComment.trim() || addCommentMutation.isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {addCommentMutation.isPending ? 'Sending...' : 'Send'}
                </Button>
              </div>
            </form>

            <Separator className="bg-white/20" />

            {/* Comments List */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {commentsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex space-x-3">
                      <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="w-24 h-4 bg-white/20 rounded animate-pulse" />
                        <div className="w-full h-16 bg-white/20 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : comments && comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.user_avatar || ''} />
                      <AvatarFallback className="bg-white/20 text-white text-xs">
                        {comment.user_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-white text-sm">
                          {comment.user_name}
                        </span>
                        <span className="text-xs text-white/50">
                          {formatTimeAgo(comment.created_at)}
                        </span>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3">
                        <p className="text-white/90 text-sm whitespace-pre-wrap">
                          {comment.comment}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-white/50 mx-auto mb-3" />
                  <p className="text-white/70">No comments yet</p>
                  <p className="text-sm text-white/50">Be the first to add a comment</p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {activitiesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse" />
                    <div className="flex-1 space-y-1">
                      <div className="w-48 h-4 bg-white/20 rounded animate-pulse" />
                      <div className="w-24 h-3 bg-white/20 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activities && activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white/70">
                    {getActivityIcon(activity.action_type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-white/90 text-sm">
                      <span className="font-medium">{activity.user_name}</span>{' '}
                      {activity.action_description}
                    </p>
                    <p className="text-xs text-white/50">
                      {formatTimeAgo(activity.created_at)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-white/50 mx-auto mb-3" />
                <p className="text-white/70">No activity yet</p>
                <p className="text-sm text-white/50">Task activity will appear here</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}